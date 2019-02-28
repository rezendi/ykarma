#! /usr/bin/env node

require('dotenv').config();

var eth = require('../routes/eth');
const fetch = require('node-fetch');
const firebase = require('../routes/firebase');

var fromAccount;
var blockNumber;

console.log(new Date().toUTCString());
console.log("ykarma", process.env.YKARMA_ADDRESS);
eth.web3.eth.getAccounts().then((ethAccounts) => {
  fromAccount = ethAccounts[0];
  eth.web3.eth.getBlockNumber((error, bn) => {
    console.log("blockNumber", bn);
    blockNumber = bn;
    populateSlack();
  });
})


// for each community:
// get a list of their added slack teams

function populateSlack() {
  var method = eth.contract.methods.getCommunityCount();
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityCount error', error);
    } else {
      for (var i = 1; i <= result; i++) {
        eth.getCommunityFor(i, (community) => {
          const metadata = community.metadata || {};
          const slackTeams = metadata.slackTeams || [];
          for (var j=0; j<slackTeams.length; j++) {
            populateTeam(community.id, slackTeams[j]);
          }
        });
      }
    }
  })
  .catch(function(error) {
    console.log('getCommunityCount call error', error);
  });
}

// for each team:
// get token etc. from firebase
// call users.list GET slack.com/api/users.list?limit=256&token=xoxp-1234-5678-90123
// for the moment, arbitrary limit of 256 users

async function populateTeam(communityId, teamId) {
  const docRef = firebase.db.collection('slackTeams').doc(teamId);
  const doc = await docRef.get();
  const token = doc.data().token;
  const url = `https://slack.com/api/users.list?limit=256&token=${token}`;
  const response = await fetch(url);
  const json = await response.json();
  if (!json.ok) {
    return console.log("user list failed", json.error);
  }
  const members = json.members || [];
  for (var i=0; i<members.length; i++) {
    const member = members[i];
    // console.log("member", member);
    if (!member.deleted && !member.profile.bot_id && member.name!=="slackbot") {
      addUserIfAppropriate(communityId, member.team_id, member.id, member.profile.email, member.real_name);
    }
  }
}

// for each user:
// does a YK account exist for slack URL? OK, move on
// does a YK account exist for their email? OK, add slack URL to that account
// create a YK account for their slack URL, add their email

function addUserIfAppropriate(communityId, teamId, userId, userEmail, userName) {
  const slackUrl = `slack:${teamId}-${userId}`;
  var method = eth.contract.methods.accountForUrl(slackUrl);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountForUrl error from '+slackUrl, error);
    } else {
      var accountId = parseInt(result[0], 10);
      if (accountId > 0) {
        console.log("slack account exists for", userName);
        return;
      }
      if (!userEmail || userEmail.length === 0 || userEmail.indexOf('@') === 0) {
        console.log("no email for", userName);
        addNewUser(communityId, teamId, userId, userEmail, userName);
      }
      const emailUrl = `mailto:${userEmail}`;
      var method2 = eth.contract.methods.accountForUrl(emailUrl);
      method2.call(function(error, result) {
        if (error) {
          console.log('getAccountForUrl error from '+emailUrl, error);
        } else {
          var accountId = parseInt(result[0], 10);
          if (accountId > 0) {
            console.log("adding slack URL to existing email URL", userEmail);
            var method3 = eth.contract.methods.addUrlToExistingAccount(accountId, slackUrl);
            doSend(method3);
          } else {
            addNewUser(communityId, teamId, userId, userEmail, userName);
          }
        }
      });
    }
  });
}

function addNewUser(communityId, teamId, userId, userEmail, userName) {
  console.log("adding new slack user with email", userEmail);
  const slackUrl = `slack:${teamId}-${userId}`;
  var method = eth.contract.methods.addNewAccount(
    communityId,
    '',
    `{"name":"${userName}"}`,
    '0x00',
    slackUrl
  );
  doSend(method,1, 2, () => {
    var method2 = eth.contract.methods.accountForUrl(slackUrl);
    method2.call(function(error, result) {
      if (error) {
        console.log('getAccountForUrl error from '+slackUrl, error);
      } else {
        var accountId = parseInt(result[0], 10);
        console.log("newly generated account id", accountId);
        if (userEmail && userEmail.length === 0 || userEmail.indexOf('@') > 0) {
          console.log("adding email to newly generated account", userEmail);
          const emailUrl = `mailto:${userEmail}`;
          var method3 = eth.contract.methods.addUrlToExistingAccount(accountId, emailUrl);
          doSend(method3);
        }
        var replenish = eth.contract.methods.replenish(accountId);
        doSend(replenish);
      }
    });
  });
}

function doSend(method, minConfirmations = 1, gasMultiplier = 2, callback = null) {
  var notifying = false;
  method.estimateGas({gas: eth.GAS}, function(estError, gasAmount) {
    if (estError) {
      console.log('est error', estError);
    }
    method.send({from:fromAccount, gas: gasAmount * gasMultiplier}).on('error', (error) => {
      console.log('send error', error);
    })
    .on('confirmation', (number, receipt) => {
      if (number >= minConfirmations && !notifying) {
        notifying = true;
        if (callback) {
          return callback();
        }
      }
    })
    .catch(function(error) {
      console.log('send call error ' + error);
    });
  })
  .catch(function(error) {
    console.log('gas estimation call error', error);
  });
}
