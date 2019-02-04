#! /usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const eth = require('../routes/eth');

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
    console.log("data", data);
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
    await addCommunity(community);
    console.log("community added");
    for (var j in community.accounts) {
      var account = community.accounts[j];
      await addAccount(account);
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
  const method = eth.contract.methods.addNewCommunity(
    community.addressAdmin,
    community.flags || '0x00',
    community.domain || '',
    JSON.stringify(community.metadata),
    community.tags || '',
  );
  doSend(method);
}

function addAccount(account) {
  
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

function doSend(method) {
  method.estimateGas({gas: eth.GAS}, function(estError, gasAmount) {
    if (estError) {
      console.log('est error', estError);
      return false;
    }
    method.send({from:eth.getFromAccount(), gas: gasAmount * 2}).on('error', (error) => {
      console.log('error', error);
      return true;
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

