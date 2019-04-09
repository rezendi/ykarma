#! /usr/bin/env node

require('dotenv').config();

const timestamp = Date.now();
const fs = require('fs');
const eth = require('../routes/eth');
const dumpFile = __dirname + "/ykdump" +timestamp +".json";
const VERSION = 1;

// dump all data from the YKarma contracts into a JSON file, so we can recreate it in new contracts
// this beats trying to write a custom ALTER TABLE equivalent each time the contracts change...

console.log(new Date().toUTCString());
doDump();

async function doDump() {
  console.log("dumping to", dumpFile);
  var communities = [];
  var method = eth.contract.methods.getCommunityCount();
  try {
    let result = await method.call();
    console.log('getCommunityCount result', result);
    for (var i = 1; i <= result; i++) {
      eth.getCommunityFor(i, (community) => {
        console.log("community", community.metadata ? community.metadata.name : 'n/a');
        getCommunityData(community, function(hydratedCommunity) {
          communities.push(hydratedCommunity);
          console.log("result", parseInt(result));
          if (communities.length === parseInt(result)) {
            let json = '{"version": "' + VERSION + '", "timestamp": " '+ timestamp + '", "communities": ' + JSON.stringify(communities) + '}';
            fs.writeFile(dumpFile, json, 'utf8', (err2) => {
              if (err2) throw err2;
              console.log("Dump written", dumpFile);
            });
          }
        });
      });
    }
  } catch(error) {
    console.log('getCommunityCount error', error);
  }
}

async function getCommunityData(community, callback) {
  community.accounts = [];
  // dump accounts
  let method = eth.contract.methods.getAccountCount(community.id);
  try {
    let result = await method.call();
    let accountCount = parseInt(result);
    console.log("account count", accountCount);
    if (parseInt(accountCount) === 0) {
      return callback(community);
    }
    for (var i = 0; i < accountCount; i++) {
      let method2 = eth.contract.methods.accountWithinCommunity(community.id, i);
      let result2 = await method2.call();
      let account = eth.getAccountFromResult(result2);
      getAccountData(account, function(hydratedAccount) {
        // console.log("hydrated", hydratedAccount);
        console.log(`id ${account.id} urls`, account.urls);
        community.accounts.push(hydratedAccount);
        if (community.accounts.length >= parseInt(accountCount)) {
          callback(community);
        }
      });
    }
  } catch(error) {
    console.log('getCommunityData error', error);
  }
}

async function getAccountData(account, callback) {
  // console.log("account id", account.id);

  // TODO: add accessors in YKAccounts to get full giving data
  let method = eth.contract.methods.lastReplenished(account.id);
  try {
    let result = await method.call();
    account.lastReplenished = result;
    getTranchesData(account, callback);
  } catch(error) {
    console.log('lastReplenished error', error);
  }
}

async function getTranchesData(account, callback) {
  // TODO: add accessors in YKAccounts to get full giving data
  let method = eth.contract.methods.trancheTotalsForId(account.id);
  try {
    let totals = await method.call();
    let method2 = eth.contract.methods.tranchesForId(account.id, 1, totals[0], true);
    let result2 = await method2.call();
    account.given = JSON.parse(result2);
    let method3 = eth.contract.methods.tranchesForId(account.id, 1, totals[1], false);
    let result3 = await method3.call();
    account.received = JSON.parse(result3);
    getRewardsData(account, callback);
  } catch(error) {
    console.log('getTranchesData error', error);
  }
}

// TODO get reward parentId, created, and sold -- especially the first is important, but currently breaks the EVM stack limit
async function getRewardsData(account, callback) {
  account.rewards = [];
  let method = eth.contract.methods.getRewardsCount(account.id, 2);
  try {
    let result = await method.call();
    if (parseInt(result) === 0) {
      return callback(account);
    }
    for (var i = 0; i < result; i++) {
      let method2 = eth.contract.methods.rewardByIdx(account.id, i, 2);
      let result2 = await method2.call();
      account.rewards.push(eth.getRewardFromResult(result2));
      if (account.rewards.length == parseInt(result)) {
        callback(account);
      }
  } catch(error) {
    console.log('getRewardsData error', error);
  }
}
