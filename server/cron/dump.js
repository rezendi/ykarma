#! /usr/bin/env node

require('dotenv').config();

var eth = require('../routes/eth');

// dump all data from the YKarma contracts into a JSON file, so we can recreate it in new contracts
// this beats trying to write a custom ALTER TABLE equivalent each time the contracts change...

function doDump() {
  var method = eth.contract.methods.getCommunityCount();
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityCount error', error);
    } else {
      console.log('getCommunityCount result', result);
      for (var i = 0; i < result; i++) {
        eth.getCommunityFor(i+1, (community) => {
          dumpCommunity(community);
        });
      }
    }
  });
}

function dumpCommunity(community) {
  // dump accounts
  var method = eth.contract.methods.getAccountCount(community.id);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountCount error', error);
    } else {
      for (var i = 0; i < result; i++) {
        var method2 = eth.contract.methods.accountWithinCommunity(community.id, i+1, 0);
        method2.call(function(error2, account) {
          if (error2) {
            console.log('accountWithinCommunity error', error2);
          } else {
            dumpAccount(account);
          }
        });
      }
    }
  });
}

function dumpAccount(account) {
  // dump account basics
  // dump account availableToGive, lastReplenished
  // TODO: add accessors in YKAccounts to get full giving data
  // dump account tranches sent

  // get/dump rewards vended
  var method = eth.contract.methods.getRewardsCount(account.id, 2);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountCount error', error);
    } else {
      for (var i = 0; i < result; i++) {
        var method2 = eth.contract.methods.rewardByIdx(account.id, i+1, 2);
        method2.call(function(error2, reward) {
          if (error2) {
            console.log('accountWithinCommunity error', error2);
          } else {
            dumpReward(reward);
          }
        });
      }
    }
  });
}

function dumpReward(reward) {
  // just dump the data
}