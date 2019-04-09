#! /usr/bin/env node

require('dotenv').config();

// Load all data from a YKarma dump file back into a brand new blockchain

const fs = require('fs');
const eth = require('../routes/eth');
const util = require('../routes/util');

var balances = {};
var ids = {};

console.log(new Date().toUTCString());
checkLoadAndRun();

async function checkLoadAndRun() {
  var checkLoadMode = eth.contract.methods.loadMode();
  try {
    let result = await checkLoadMode.call();
    if (!) {
      console.log("loadMode false");
      return;
    }
    doLoad();
  } catch(error) {
    console.log("loadMode error");
    return;
  }
}

function doLoad() {
  // open the file from the command-line arg, parse the JSON, get the version
  const file = process.argv[2];
  const fileToLoad = __dirname + "/" + file;
  if (!fs.existsSync(fileToLoad)) {
    console.log("file does not exist:", fileToLoad);
    return;
  }
  fs.readFile(fileToLoad, "utf8", (err, data) => {
    if (err) throw err;
    //console.log("data", data);
    var vals = JSON.parse(data);
    console.log("version", vals.version);
    console.log("timestamp", vals.timestamp);
    console.log("communities", vals.communities.length);

    if (vals.version === '1') {
      loadV1(vals.communities);
    }
  });
}

async function loadV1(communities) {
  await eth.getFromAccount();
  for (var i=0; i<communities.length; i++) {
    var community = communities[i];
    var communityId = await addCommunity(community);
    community.id = communityId;
    console.log("community added", communityId);
    var tranches = [];
    
    // First, add all the accounts
    var accounts = community.accounts.sort(function(a, b){return a.id - b.id});
    for (var j=0; j<accounts.length; j++) {
      var account = accounts[j];
      var urls = account.urls.split(util.separator);
      if (urls.length==1) {
        urls = account.urls.split(util.oldSeparator);
      }
      console.log("urls", urls);
      var accountId = await addAccount(account, community.id, urls[0]);
      for (var k = 1; k < urls.length; k++) {
        if(urls[k].length > 0) {
          addUrl(accountId, urls[k]);
        }
      }
      ids[account.id] = accountId;
      account.id = accountId;
      account.given.forEach(function(e) { e.sender - account.id; });
      tranches.push.apply(tranches, account.given);
      await sleep(3000);
    }
    console.log("Accounts added", accounts.length);

    // Next, recapitulate all the sends, in order
    var tranches = tranches.sort(function(a, b){return a.block - b.block});
    for (var k=0; k<tranches.length; k++) {
      await addTranche(tranches[k], community.id);
      console.log("tranche", tranches[k].block);
      await sleep(3000);
    }
    console.log("Tranches added", tranches.length);

    // Finally, reinflate givable karma, and add offers and purchases    
    for (var j=0; j<accounts.length; j++) {
      var account = accounts[j];
      await addGivable(account);
    }
    console.log("Givable updated");

    for (var j=0; j<accounts.length; j++) {
      var account = accounts[j];
      await addRewards(account.rewards, community.id);
    }
    console.log("Rewards added");
  }
  
  // load complete, switch load mode off
  console.log("Cleaning up...");
  const loadModeOff = eth.contract.methods.loadModeOff();
  doSend(loadModeOff);
  const rewardCreationCost = eth.contract.methods.setRewardCreationCost(10);
  doSend(rewardCreationCost);
  sleep(3000);
  console.log("Done.");
}

function addCommunity(community) {
  //console.log("community", community.id);
  return new Promise(async (resolve, reject) => {
    var method = eth.contract.methods.getCommunityCount();
    try {
      let result = await method.call();
      const method2 = eth.contract.methods.addEditCommunity(
        0,
        community.addressAdmin,
        community.flags || '0x00',
        community.domain || '',
        JSON.stringify(community.metadata),
        community.tags || '',
      );
      doSend(method2);
      resolve(parseInt(result)+1);
    } catch(error) {
      console.log('getCommunityCount error', error);
      reject(error);
    }
  });
}

function addAccount(account, communityId, url) {
  return new Promise((resolve, reject) => {
    const method = eth.contract.methods.addNewAccount(
      communityId,
      account.userAddress,
      JSON.stringify(account.metadata),
      account.flags || '0x00',
      url
    );
    doSend(method, async () => {
      const method2 = eth.contract.methods.accountForUrl(url);
      try {
        let result2 = await method2.call();
        resolve(result2[0]);
      } catch(error2) {
        reject(error2);
      }
    });
  });
}

function addUrl(accountId, url) {
  const method = eth.contract.methods.addUrlToExistingAccount(accountId, url);
  doSend(method);
}

// for each sent tranche:
// - add giving, 100 at a time, until we have enough to send
// - then get the url for the recipient
// - then recapitulate the send
async function addTranche(tranche, communityId) {
  // don't regenerate reward tranches
  if (tranche.sender === tranche.receiver) {
    return;
  }
  // console.log("tranche", tranche);
  var balance = balances[tranche.sender] || 0;
  while (balance < tranche.amount) {
    // console.log("replenishing");
    const replenish = eth.contract.methods.replenish(tranche.sender);
    await doSend(replenish);
    balance += 100;
  }
  var newReceiverId = ids[tranche.receiver];
  var recipientUrl = await getUrlFor(newReceiverId);
  // console.log("sending to url", recipientUrl);
  const give = eth.contract.methods.give(tranche.sender, communityId, recipientUrl, tranche.amount, tranche.message);
  await doSend(give);
  balances[tranche.sender] = balance - tranche.amount;
}

// TODO: possibly cache these for performance's sake
function getUrlFor(recipientId) {
  return new Promise(async (resolve, reject) => {
    let method = eth.contract.methods.accountForId(recipientId);
    try {
      let result = await method.call();
      const account = eth.getAccountFromResult(result);
      const url = account.urls.split(util.separator)[0];
      resolve(url);
    } catch(error) {
      reject(error);
    }
  });
}

// add giving tranches until we're up to "givable"
async function addGivable(account) {
  var toGive = account.givable - (balances[account.id] || 0);
  console.log(`account ${account.id} givable ${account.givable} to add ${toGive}`);
  if (toGive <= 0) {
    return;
  }
  while (toGive > 0) {
    const replenish = eth.contract.methods.replenish(account.id);
    await doSend(replenish);
    // console.log("replenished");
    toGive -= 100;
  }
}

// first create reward
// then, if reward has an owner, perform purchase of reward
// and remember that account IDs may have changed during the load
async function addRewards(rewards, communityId) {
  for (var i=0; i<rewards.length; i++) {
    var reward = rewards[i];
    var rewardId = await addReward(reward, i);
    await sleep(3000);
    if (reward.ownerId) {
      await performPurchase(reward, rewardId, communityId);
      await sleep(3000);
    }
  }
}

function addReward(reward, idx) {
  var newVendorId = ids[reward.vendorId];
  return new Promise((resolve, reject) => {
    let method = eth.contract.methods.addNewReward(
      newVendorId,
      reward.cost,
      reward.quantity,
      reward.tag,
      JSON.stringify(reward.metadata),
      reward.flags || '0x00'
    );
    doSend(method, async () => {
      let method2 = eth.contract.methods.rewardByIdx(newVendorId, idx, 2);
      try {
        let result2 = await method2.call();
        resolve(result2[0]);
      } catch(error2) {
        reject(error2);
      }
    });
  });
}

function performPurchase(reward, rewardId, communityId) {
  var newOwnerId = ids[reward.ownerId];
  return new Promise((resolve, reject) => {
    const method = eth.contract.methods.purchase(newOwnerId, rewardId, communityId);
    doSend(method, () => {
      resolve(true);
    }, (error) => {
      reject(error);
    });
  });
}

function doSend(method, callback = null, errorCallback = null) {
  method.send({from:eth.getFromAccount(), gas: eth.GAS}).on('error', (error) => {
    console.log('error', error);
    if (errorCallback) {
      errorCallback(error);
    }
  })
  .on('confirmation', (number) => {
    if (callback && number == 1) {
      callback();
    }
  })
  .catch(function(error) {
    console.log('send call error ' + error);
    if (errorCallback) {
      errorCallback(error);
    }
  });
};

function sleep(ms) {
  if (process.env.NODE_ENV=="test") {
    return new Promise(resolve => setTimeout(resolve, 1));
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}