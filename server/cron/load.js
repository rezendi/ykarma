#! /usr/bin/env node

require('dotenv').config();

// Load all data from a YKarma dump file back into a brand new blockchain

const fs = require('fs');
const node = require('util');
const eth = require('../routes/eth');
const util = require('../routes/util');

var balances = {};

var checkLoadMode = eth.contract.methods.loadMode();
checkLoadMode.call(function(error, result) {
  if (error) {
    console.log("loadMode error");
    return;
  }
  if (result == false) {
    console.log("loadMode false");
    return;
  }
  doLoad();
});

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
  for (var i in communities) {
    var community = communities[i];
    var communityId = parseInt(await addCommunity(community));
    community.id = communityId;
    console.log("community added", communityId);
    var tranches = [];
    
    // First, add all the accounts
    var accounts = community.accounts.sort(function(a, b){return a.id - b.id});
    for (var j in accounts) {
      var account = accounts[j];
      var urls = account.urls.split(util.separator);
      var accountId = await addAccount(account, community.id, urls[0]);
      for (var k = 1; k < urls.length; k++) {
        addUrl(accountId, urls[k]);
      }
      account.id = accountId;
      account.given.forEach(function(e) { e.sender - account.id; });
      tranches.push.apply(tranches, account.given);
    }
    console.log("Accounts added", accounts.length);

    // Next, recapitulate all the sends, in order
    var tranches = tranches.sort(function(a, b){return parseInt(a.block) - parseInt(b.block)});
    for (var k in tranches) {
      await addTranche(tranches[k]);
    }
    console.log("Tranches added", tranches.length);

    // Finally, reinflate givable karma, and add offers and purchases    
    for (var j in accounts) {
      var account = accounts[j];
      await addGivable(account);
      await addOffers(account);
      await addPurchases(account);
    }
  }
  
  // load complete, switch load mode off
  const loadModeOff = eth.contract.methods.loadModeOff();
  doSend(loadModeOff);
}

function addCommunity(community) {
  console.log("community", community.id);
  return new Promise((resolve, reject) => {
    var method = eth.contract.methods.getCommunityCount();
    method.call(function(error, result) {
      if (error) {
        console.log('getCommunityCount error', error);
        reject(error);
      } else {
        const method2 = eth.contract.methods.addNewCommunity(
          community.addressAdmin,
          community.flags || '0x00',
          community.domain || '',
          JSON.stringify(community.metadata),
          community.tags || '',
        );
        doSend(method2);
        resolve(result+1);
      }
    });
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
    doSend(method, () => {
      const method2 = eth.contract.methods.accountForUrl(url);
      method2.call(function(error2, result2) {
        if (error2) {
          reject(error2);
        } else {
          console.log("account added", result2);
          resolve(result2[0]);
        }
      });
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
async function addTranche(tranche) {
  console.log("tranche", tranche);
  var balance = balances[tranche.sender] || 0;
  while (balance < tranche.amount) {
    console.log("replenishing");
    const replenish = eth.contract.methods.replenish(tranche.sender);
    await doSend(replenish);
    balance += 100;
  }
  var recipientUrl = await getUrlFor(tranche.receiver);
  console.log("sending to url", recipientUrl);
  const give = eth.contract.methods.give(tranche.sender, recipientUrl, tranche.amount, tranche.message);
  await doSend(give);
  balances[tranche.sender] = balance - tranche.amount;
}

// TODO: possibly cache these for performance's sake
function getUrlFor(recipientId) {
  return new Promise((resolve, reject) => {
    const method = eth.contract.methods.accountForId(recipientId);
    method.call(function(error, result) {
      if (error) {
        reject(error);
      } else {
        const account = eth.getAccountFromResult(result);
        const url = account.urls.split(util.separator)[0];
        resolve(url);
      }
    });
  });
}

// add giving tranches until we're up to "givable"
async function addGivable(account) {
  var toGive = parseInt(account.givable) - balances[account.id];
  if (toGive <= 0) {
    return;
  }
  while (toGive > 0) {
    const replenish = eth.contract.methods.replenish(accountId);
    await doSend(replenish);
    toGive -= 100;
  }
}

function addOffers(account) {
  
}

function addPurchases(account) {
  
}

function doSend(method, callback = null) {
  method.send({from:eth.getFromAccount(), gas: eth.GAS}).on('error', (error) => {
    console.log('error', error);
    if (!callback) {
      return true;
    }
  })
  .on('confirmation', (number) => {
    if (callback && number == 1) {
      callback();
      return true;
    }
  })
  .catch(function(error) {
    console.log('send call error ' + error);
    return false;
  });
};

