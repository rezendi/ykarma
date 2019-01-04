#! /usr/bin/env node

require('dotenv').config();

const fs = require('fs');
const eth = require('../routes/eth');
const dumpFile = __dirname + "/ykdump" + Date.now() +".json";

// dump all data from the YKarma contracts into a JSON file, so we can recreate it in new contracts
// this beats trying to write a custom ALTER TABLE equivalent each time the contracts change...

doDump();

function doDump() {
  console.log("dumping to", dumpFile);
  var communities = [];
  var method = eth.contract.methods.getCommunityCount();
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityCount error', error);
    } else {
      console.log('getCommunityCount result', result);
      for (var i = 0; i < result; i++) {
        eth.getCommunityFor(i+1, (community) => {
          console.log("community", community.metadata ? community.metadata.name : 'n/a');
          getCommunityData(community, function(hydratedCommunity) {
            communities.push(hydratedCommunity);
            console.log("result", parseInt(result));
            if (communities.length === parseInt(result)) {
              const json = "{'communities': " + JSON.stringify(communities) + "}";
              fs.writeFile(dumpFile, json, 'utf8', (err2) => {
                if (err2) throw err2;
                console.log("Dump written", dumpFile);
              });
            }
          });
        });
      }
    }
  });
}

function getCommunityData(community, callback) {
  community.accounts = [];
  // dump accounts
  const method = eth.contract.methods.getAccountCount(community.id);
  method.call(function(error, result) {
    console.log("account count", result);
    if (error) {
      console.log('getAccountCount error', error);
    } else if (parseInt(result) === 0) {
      callback(community);
    } else {
      for (var i = 0; i < result; i++) {
        const method2 = eth.contract.methods.accountWithinCommunity(community.id, i);
        method2.call(function(error2, result2) {
          if (error2) {
            console.log('accountWithinCommunity error', error2);
          } else {
            const account = eth.getAccountFromResult(result2);
            getAccountData(account, function(hydratedAccount) {
              // console.log("hydrated", hydratedAccount);
              community.accounts.push(hydratedAccount);
              if (community.accounts.length === parseInt(result)) {
                callback(community);
              }
            });
          }
        });
      }
    }
  });
}

function getAccountData(account, callback) {
  console.log("account id", account.id);
  // dump account basics
  // dump account availableToGive, lastReplenished
  // TODO: add accessors in YKAccounts to get full giving data
  // dump account tranches sent

  // get/dump rewards vended
  account.rewards = [];
  const method = eth.contract.methods.getRewardsCount(account.id, 2);
  method.call(function(error, result) {
    if (error) {
      console.log('getRewardsCount error', error);
    }
    else if (parseInt(result) === 0) {
      callback(account);
    } else {
      for (var i = 0; i < result; i++) {
        const method2 = eth.contract.methods.rewardByIdx(account.id, i, 2);
        method2.call(function(error2, result2) {
          if (error2) {
            console.log('rewardByIdx error', error2);
          } else {
            account.rewards.push(eth.getRewardFromResult(result2));
            if (account.rewards.length == parseInt(result)) {
              callback(account);
            }
          }
        });
      }
    }
  });
}
