#! /usr/bin/env node

const eth = require('../routes/eth');
const slack = require('../routes/slack');

require('dotenv').config();

var fromAccount;

console.log(new Date().toUTCString());
console.log("ykarma", process.env.YKARMA_ADDRESS);
eth.web3.eth.getAccounts().then((ethAccounts) => {
  fromAccount = ethAccounts[0];
  doTheThing();
});

function doTheThing() {  
  var method = eth.contract.methods.accountForUrl("mailto:jon@rezendi.com");
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountForUrl error', error);
    } else {
      var account = eth.getAccountFromResult(result);
      sendReplenishSlack(account);
    }
  });
}

function sendReplenishSlack(account) {
  console.log("sending slack notification to", account.urls);
  if (process.env.NODE_ENV === "test" || !account.urls) return;
  var slackUrl = null;
  const urls = account.urls.split(" ");
  // TODO: what to do about accounts with multiple Slack URLs? Notify all? Notify latest, as per current code, might be best...
  for (var i in urls) {
    if (urls[i].startsWith("slack:")) {
      slackUrl = urls[i];
    }
  }
  if (slackUrl) {
    var text = `You have been allocated 100 more YKarma to give away! Your giving balance is now ${account.givable}. These expire in a month or so, so give them away soon -`;
    slack.openChannelAndPost(slackUrl, text);
  }
}
