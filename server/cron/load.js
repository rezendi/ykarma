#! /usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const node = require('util');
const eth = require('../routes/eth');
const util = require('../routes/util');

// Load all data from a YKarma dump file back into a brand new blockchain

doLoad();

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

    // TODO: check on-chain load timestamp to see if already loaded
    
    if (vals.version === '1') {
      loadV1(vals.communities);
    }
  });
}

async function loadV1(communities) {
  await eth.getFromAccount();
  for (var i in communities) {
    var community = communities[i];
    var communityId = await addCommunity(community);
    community.id = communityId;
    console.log("community added", communityId);
    for (var j in community.accounts) {
      var account = community.accounts[j];
      var urls = account.urls.split(util.separator);
      var accountId = await addAccount(account, community.id, urls[0]);
      for (var k = 1; k < urls.length; k++) {
        addUrl(accountId, urls[k]);
      }
      account.id = accountId;
      await addTranches(account);
      await addGivable(account);
      await addOffers(account);
    }
    
    for (var j in community.accounts) {
      var account = community.accounts[j];
      await addPurchases(account);
    }
  }
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
        console.log("gCC", result);
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
  console.log("account", url);
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
          resolve(result2);
        }
      });
    });
  });
}

function addUrl(accountId, url) {
  const method = eth.contract.methods.addUrlToExistingAccount(accountId, url);
  doSend(method);
}

function addTranches(account) {
      // for each sent tranche:
      // - add giving, 100 at a time, until we have enough to send
      // - recapitulate the send
}

function addGivable(account) {
      // now add giving tranches until we're up to "givable"
      // TODO: make lastReplenished settable
  
}

function addOffers(account) {
  
}

function addPurchases(account) {
  
}

function doSend(method, callback = null) {
  method.estimateGas({gas: eth.GAS}, function(estError, gasAmount) {
    if (estError) {
      console.log('est error', estError);
      return false;
    }
    method.send({from:eth.getFromAccount(), gas: gasAmount * 2}).on('error', (error) => {
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
  })
  .catch(function(error) {
    console.log('gas estimation call error', error);
    return false;
  });
};

