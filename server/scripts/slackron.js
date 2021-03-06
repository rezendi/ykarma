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
});


// for each community:
// get a list of their added slack teams

async function populateSlack() {
  var method = eth.contract.methods.getCommunityCount();
  try {
    let result = await method.call();
    let communityCount = parseInt(result);
    for (var i = 1; i <= communityCount; i++) {
      let community = await eth.getCommunityFor(i);
      let metadata = community.metadata || {};
      let slackTeams = metadata.slackTeams || [];
      for (var j=0; j<slackTeams.length; j++) {
        populateTeam(community.id, slackTeams[j]);
      }
    }
  } catch(error) {
    console.log('getCommunityCount error', error);
  }
}

// for each team:
// get token etc. from firebase
// call users.list GET slack.com/api/users.list?limit=256&token=xoxp-1234-5678-90123
// for the moment, arbitrary limit of 256 users

async function populateTeam(communityId, teamId) {
  let docRef = firebase.db.collection('slackTeams').doc(teamId);
  let doc = await docRef.get();
  let token = doc.data().token;
  let url = `https://slack.com/api/users.list?limit=256&token=${token}&include_locale=true`;
  let response = await fetch(url);
  let json = await response.json();
  if (!json.ok) {
    return console.log("user list failed", json.error);
  }
  let members = json.members || [];
  for (var i=0; i<members.length; i++) {
    let member = members[i];
    // console.log("member", member);
    if (!member.deleted && !member.profile.bot_id && member.name!=="slackbot") {
      addUserIfAppropriate(communityId, member.team_id, member.id, member.profile.email, member.real_name);
      // update info from slack
      var userDocRef = firebase.db.collection('slackUsers').doc(`#${member.team_id}-${member.id}`);
      userDocRef.set({
          'name'  : member.name,
          'userId': member.id,
          'teamId': member.team_id,
          'avatar': member.profile.image_72,
          'locale': member.profile.locale,
          'email' : member.profile.email,
      }, { merge: true });
    }
  }
}

// for each user:
// does a YK account exist for slack URL? OK, move on
// does a YK account exist for their email? OK, add slack URL to that account
// create a YK account for their slack URL, add their email

async function addUserIfAppropriate(communityId, teamId, userId, userEmail, userName) {
  let slackUrl = `slack:${teamId}-${userId}`;
  var method = eth.contract.methods.accountForUrl(slackUrl);
  try {
    let result = await method.call();
    var accountId = parseInt(result[0], 10);
    if (accountId > 0) {
      console.log("slack account exists for", userName);
      return;
    }
    if (!userEmail || userEmail.length === 0 || userEmail.indexOf('@') === 0) {
      console.log("no email for", userName);
      addNewUser(communityId, teamId, userId, userEmail, userName);
    }
    let emailUrl = `mailto:${userEmail}`;
    method = eth.contract.methods.accountForUrl(emailUrl);
    let result2 = await method.call();
    accountId = parseInt(result2[0], 10);
    if (accountId > 0) {
      console.log("adding slack URL to existing email URL", userEmail);
      var method3 = eth.contract.methods.addUrlToExistingAccount(accountId, slackUrl);
      await eth.doSend(method3);
    } else {
      addNewUser(communityId, teamId, userId, userEmail, userName);
    }
  } catch(error) {
    console.log('addUserIfAppropriate error for '+slackUrl, error);
  }
}

async function addNewUser(communityId, teamId, userId, userEmail, userName) {
  console.log("adding new slack user with email", userEmail);
  let slackUrl = `slack:${teamId}-${userId}`;
  let method = eth.contract.methods.addNewAccount(
    communityId,
    '',
    `{"name":"${userName}"}`,
    '0x00',
    slackUrl
  );
  await eth.doSend(method);
  let method2 = eth.contract.methods.accountForUrl(slackUrl);
  try {
    let result = await method2.call();
    let accountId = parseInt(result[0], 10);
    console.log("newly generated account id", accountId);
    if (userEmail && userEmail.length === 0 || userEmail.indexOf('@') > 0) {
      console.log("adding email to newly generated account", userEmail);
      let emailUrl = `mailto:${userEmail}`;
      let method3 = eth.contract.methods.addUrlToExistingAccount(accountId, emailUrl);
      eth.doSend(method3);
    }
    let replenish = eth.contract.methods.replenish(accountId);
    eth.doSend(replenish);
  } catch(error) {
    console.log('getAccountForUrl error from '+slackUrl, error);
  }
}
