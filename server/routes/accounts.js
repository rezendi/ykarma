const express = require('express');
const router = express.Router();
const util = require('./util');
const email = require('./emails');
const firebase = require('./firebase');
const blockchain = require('./blockchain');

const redisService = require("redis");
var redis = redisService.createClient({host:"redis", port: 6379});
redis.on('error', function (err) {
  if (process.env.NODE_ENV === "production") {
    console.log('Something went wrong with Redis', err);
  }
});
var accountCache = {};

// GET set up 
router.get('/setup/:ykid', async function(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    util.warn("setting up test data", req.params.ykid);
    let account = await blockchain.getAccountFor(req.params.ykid);
    getSessionFromAccount(req, account);
    req.session.email = process.env.ADMIN_EMAIL; // so we can look at everything
    //util.debug("set up test data", req.session);
    return res.json({"success":true});
  } else {
    util.warn("setup called out of test mode");
  }
});


/* GET account details */
router.get('/account/:id', async function(req, res, next) {
  try {
    let account = await blockchain.getAccountFor(req.params.id);
    if (req.session.email !== process.env.ADMIN_EMAIL && req.session.ykid !== id && req.session.ykcid != account.communityIds[0]) {
      util.warn('Unauthorized account request', req.session);
      return res.json({"success":false, "error": req.t("Not authorized")});
    }
    util.debug('account', account);
    res.json(account);
  } catch(error) {
    return res.json({"success":false, "error": error});
  }
});


/* GET account details */
router.get('/me', async function(req, res, next) {
  util.debug("me session", req.session);
  var account;
  try {
    if (req.session.ykid) {
      account = await blockchain.getAccountFor(req.session.ykid);
    } else {
      var url = req.session.email || req.session.handle;
      url = getLongUrlFromShort(url);
      if (url.startsWith('error')) {
        return res.json({"success":false, "error": url});
      }
      account = await blockchain.getAccountForUrl(url);
    }
    
    // we've got the account, now hydrate it and mark as active if not already
    getSessionFromAccount(req, account);
    let community = await blockchain.getCommunityFor(req.session.ykcid); 
    account.community = community;
    await hydrateAccount(account);
    account.spendable = await blockchain.availableToSpend(account.id, '');
    if (!hasNeverLoggedIn(account)) {
      return res.json(account);
    }
    util.warn("Marking account active and replenishing");
    await blockchain.markAccountActive(account);
    redis.del(`account-${account.id}`); // clear our one redis cache
    await blockchain.replenishAccount(account.id);
    res.json(account);
  } catch(error) {
    util.warn("account me error", error);
    res.json({"success":false, "error":error});
  }
});

router.get('/full', async function(req, res, next) {
  try {
    let totals = await blockchain.trancheTotalsForId(req.session.ykid);
    // possibly eventually page these
    let given = await blockchain.tranchesGivenForId(req.session.ykid, totals[0]);
    let received = await blockchain.tranchesReceivedForId(req.session.ykid, totals[1]);
    var account = req.session.account;
    account.given = JSON.parse(given);
    account.received = JSON.parse(received);
    await hydrateAccount(account);
    console.log("hydrated", account);
    res.json(account);
  } catch(error) {
    util.warn("error getting full profile", error);
    res.json(req.session.account);
  }
});

/* GET account details */
router.get('/url/:url', async function(req, res, next) {
  var url = req.params.url;
  if (req.session.email !== url && req.session.handle !== url && req.session.email !== process.env.ADMIN_EMAIL) {
    util.warn("Not authorized", req.params.url);
    return res.json({"success":false, "error": req.t("Not authorized")});
  }
  url = getLongUrlFromShort(url);
  if (url.startsWith('error')) {
    return res.json({"success":false, "error": url});
  }
  try {
    let account = await blockchain.getAccountForUrl(url);
    res.json(account);
  } catch(error) {
    return res.json({"success":false, "error": error});
  }
});

/* PUT replenish */
router.put('/switchCommunity', async function(req, res, next) {
  let idx = parseInt(req.body.index || 0);
  console.log("ykcid in", req.session.ykcid);
  if (req.session.account && idx < req.session.account.communityIds.length) {
    req.session.ykcidx = idx;
    getSessionFromAccount(req, req.session.account);
    console.log("ykcid out", req.session.ykcid);
    let community = await blockchain.getCommunityFor(req.session.ykcid); 
    req.session.account.community = community;
    res.json(req.session.account);
  } else {
    return res.json({"success":false, "error":"No session"});
  }
});


/* PUT add URL */
// TODO: connect to Twitter to verify the twitter_id and handle match
// Low priority since the on-chain contract ensures you can't spoof a handle that has ever been sent any YK,
// and if one of those _is_ spoofed, that just means they they get the ability to hijack the spoofer's YK account
router.put('/addUrl', async function(req, res, next) {
  var url = getLongUrlFromShort(req.body.url);
  util.debug("adding url", url);
  if (url.startsWith('error')) {
    return res.json({"success":false, "error": url});
  }

  if (req.session.ykid) {
    util.debug("adding url to existing account");
    await blockchain.addUrlToExistingAccount(req.session.ykid, url);
  } else {
    // Are we not logged in as a YK user but hoping to add this current URL as a YK user?
    let existing = req.session.handle || req.session.email;
    var longExisting = getLongUrlFromShort(existing);
    if (longExisting.startsWith('error')) {
      return res.json({"success":false, "error": req.t("existing") + " " + longExisting});
    }
    try {
      let account = await blockchain.getAccountForUrl(url);
      getSessionFromAccount(req, account);
      await blockchain.addUrlToExistingAccount(account.id, url);
    } catch(error) {
      return res.json({"success":false, "error": error});
    }
  }

  if (req.body.url.indexOf("@") > 0) {
    req.session.email = req.body.url;
  } else {
    req.session.handle = req.body.url;
  }
  res.json({"success":req.body.url});

});

/* PUT remove URL */
router.put('/removeUrl', async function(req, res, next) {
  var type = req.body.type;
  var url = req.body.url || "error";
  if (!type) {
    type = url.indexOf("@") > 0 ? "email" : "twitter";
  }

  util.log("removing url type", type);
  if (type === "email") {
    url = getLongUrlFromShort(req.session.email || url);
  } else {
    url = getLongUrlFromShort(req.session.handle || url);
  }
  util.log("removing url", url);
  if (url.startsWith("error")) {
    return res.json({"success":false, "error": req.t("Invalid URL")});
  }

  await blockchain.removeUrlFromExistingAccount(req.session.ykid, url);
  if (type === "email") {
    req.session.email = null;
  } else {
    req.session.handle = null;
    req.session.twitter_id = null;
  }
  res.json({"success":true});
});


/* PUT edit account */
router.put('/update', async function(req, res, next) {
  var account = req.body.account;
  util.log("updating account", account);
  if (account.id === 0) {
    return res.json({"success":false, "error": 'Account ID not set'});
  }
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.ykid !== account.id) {
    return res.json({"success":false, "error": req.t("Not authorized")});
  }
  //console.log("About to edit", account);
  await blockchain.editAccount(
    account.id,
    account.userAddress,
    JSON.stringify(account.metadata),
    account.flags || util.BYTES_ZERO
  );
  redis.del(`account-${account.id}`); // clear our one cache
});


/* DELETE remove account. */
router.delete('/destroy/:id', function(req, res, next) {
  if (req.session.email !== process.env.ADMIN_EMAIL) {
    return res.json({"success":false, "error": "Admin only"});
  }
  if (req.params.id === 0) {
    return res.json({"success":false, "error": 'Account not saved'});
  }
  await blockchain.deleteAccount(req.params.id);
});


/* POST give coins */
router.post('/give', async function(req, res, next) {
  var recipientUrl = getLongUrlFromShort(req.body.recipient);
  
  //check values
  if (recipientUrl.startsWith('error')) {
    return res.json({"success":false, "error": recipientUrl});
  }
  if (parseInt(req.body.amount) === 0) {
    return res.json({"success":false, "error": "recipientUrl"});
  }
  
  try {
    //check community values
    let community = await blockchain.getCommunityFor(req.session.ykcid); 
    if (isStrictCommunity(community)) {
      if (recipientUrl.startsWith("https://twitter.com/")) {
        return res.json({"success":false, "error": req.t('Closed community, can only give to') +` @${community.domain} ` + req.t("emails and/or via Slack")});
      }
      if (recipientUrl.startsWith("mailto:") && recipientUrl.indexOf("@"+community.domain) <= 0) {
        return res.json({"success":false, "error": req.t('Closed community, can only give to') +` @${community.domain} ` + req.t("emails and/or via Slack")});
      }
    }
    
    // perform the txn
    await blockchain.give(req.session.ykid, req.session.ykcid, recipientUrl, req.body.amount, req.body.message);
    util.log(`${req.body.amount} karma sent to`, recipientUrl);
  
    // send notifications as appropriate
    if (!recipientUrl.startsWith("mailto:")) {
      // TODO: Twitter notifications
      return res.json( { "success":true } );
    }
    var account = req.session.account || {};
    account.metadata = account.metadata || {};
    account.metadata.emailPrefs = account.metadata.emailPrefs || {};
    util.log("emailPrefs", account.metadata.emailPrefs);
    let sendNonMemberEmail = account.metadata.emailPrefs[req.body.recipient] !== 0;
    let recipient = await blockchain.getAccountForUrl(recipientUrl);
    // util.debug("recipient", recipient);
    // util.debug("hasNeverLoggedIn", ""+hasNeverLoggedIn(recipient));
    let sendEmail = hasNeverLoggedIn(recipient) ? sendNonMemberEmail : !recipient.metadata.emailPrefs || recipient.metadata.emailPrefs.kr !== 0;
    if (!sendEmail) {
      util.log("not sending email", account.metadata.emailPrefs);
      return res.json( { "success":true } );
    }
    util.debug("sending mail to", req.body.recipient);
    let senderName = req.session.name || req.session.email;
    email.sendKarmaSentEmail(req, senderName, recipientUrl, req.body.amount, req.body.message, hasNeverLoggedIn(recipient));
    if (!hasNeverLoggedIn(recipient)) {
      return res.json( { "success":true } );
    }

    // make sure we don't send karma-received email more than once unless explicitly desired
    account.metadata.emailPrefs[req.body.recipient] = 0;
    util.log("updated metadata", account.metadata);
    await blockchain.editAccount(
      account.id,
      account.userAddress,
      JSON.stringify(account.metadata),
      account.flags
    );
  } catch(error) {
    return res.json({"success":false, "error": error});
  }
});


/* POST set token */
router.post('/token/set', function(req, res, next) {
  util.debug("token set", req.body);
  if (!req.body.token) {
    req.session.uid = null;
    req.session.name = null;
    req.session.email = null;
    req.session.ykid = null;
    req.session.ykcid = null;
    req.session.ykcidx = null;
    req.session.handle = null;
    req.session.twitter_id = null;
    req.session.slack_id = null;
    req.session.account = null;
    return res.json({"success":true});
  }
  firebase.admin.auth().verifyIdToken(req.body.token).then(function(decodedToken) {
    req.session.uid = decodedToken.uid;
    req.session.slack_id = decodedToken.slack_id;
    req.session.name = req.session.name ? req.session.name : decodedToken.displayName;
    req.session.email = req.session.email ? req.session.email : decodedToken.email;
    // util.log("decoded", decodedToken);
    let twitterIdentities = decodedToken.firebase.identities ? decodedToken.firebase.identities['twitter.com'] : [];
    if (twitterIdentities && twitterIdentities.length > 0) {
      req.session.twitter_id = twitterIdentities[0];
      req.session.handle = req.session.handle ? req.session.handle : req.body.handle;
    } else {
      req.session.handle = null;      
    }
    util.debug("post token session", req.session);
    res.json({"success":true});
  });
});


async function hydrateAccount(account) {
  var hydrated = 0;
  return new Promise(async function(resolve, reject) {
    if (account.given.length===0 && account.received.length===0) {
      resolve();
    }
    for (var i = 0; i < account.given.length; i++) {
      var given = account.given[i];
      await hydrateTranche(given, true);
      hydrated += 1;
      if (hydrated == account.given.length + account.received.length) {
        resolve();
      }
    }
    account.spendable = 0;
    for (var j = 0; j < account.received.length; j++) {
      var received = account.received[j];
      account.spendable += received.available;
      hydrateTranche(received, false, () => {
        hydrated += 1;
        if (hydrated == account.given.length + account.received.length) {
          resolve();
        }
      });
    }
  });
}

async function hydrateTranche(tranche, given) {
  // check account cache on redis
  return new Promise(async function(resolve, reject) {
    if (process.env.NODE_ENV==="test") {
      resolve();
    }
    let id = given ? tranche.receiver : tranche.sender;
    util.log("hydrating tranche for", id);
    let key = `account-${id}`;
    var success = redis.get(key, async function (err, val) {
      if (err) {
        util.warn("redis error", err);
      }
      if (val && val !== '') {
        util.debug("redis cache hit");
        tranche.details = JSON.parse(val);
        resolve();
      }
      let account = await blockchain.getAccountFor(id);
      tranche.details = { name: account.metadata.name, urls: account.urls };
      redis.set(key, JSON.stringify(tranche.details));
      resolve();
    });
  
    // if redis not working
    if (!success) {
      val = accountCache[key];
      if (val) {
        tranche.details = JSON.parse(val);
        resolve();
      }
      let account = await blockchain.getAccountFor(id);
      tranche.details = { name: account.metadata.name, urls: account.urls };
      accountCache[key] = JSON.stringify(tranche.details);
      resolve();
    }
  });
}

// Utility functions

function getSessionFromAccount(req, account) {
  req.session.ykid = account.id;
  req.session.ykcid = account.communityIds[req.session.ykcidx || 0];
  req.session.name = account.metadata.name;
  req.session.account = account;
  var urls = account.urls.split(util.separator);
  for (var i in urls) {
    if (urls[i].startsWith("mailto:")) {
      req.session.email = urls[i].replace("mailto:", "");
    }
    if (urls[i].startsWith("https://twitter.com/")) {
      req.session.handle = "@" + urls[i].replace("https://twitter.com/","");
    }
  }
}

function getLongUrlFromShort(shortUrl) {
  var url = shortUrl;
  if (!url || url.length === 0) {
    return 'error No URL';
  }
  url = url.toLowerCase();
  if (url.indexOf("@") > 0) {
    if (!url.startsWith("mailto:")) {
      url = "mailto:" + url;
    }
    // should maybe be on-chain: do some basic URL validation, fixing the "+" Gmail/GSuite hack
    if (url.indexOf('+') > 0) {
      return 'error Bad Email';
    }
  } else {
    if (url.startsWith("@")) {
      url = url.substring(1);
    }
    if (!url.startsWith("https:")) {
      url = "https://twitter.com/" + url;
    }
  }
  if (!util.verifyURLs(url)) {
    return 'error Bad URL';
  }
  return url;
}

function hasNeverLoggedIn(account) {
  let noSlackUrl = (account.urls || '').indexOf("slack:") >= 0;
  let noWebLogin = account.flags === '0x0000000000000000000000000000000000000000000000000000000000000001';
  return account.id === 0 || (noWebLogin && noSlackUrl);
}

function isStrictCommunity(community) {
  return community.flags === '0x0000000000000000000000000000000000000000000000000000000000000001';
}

module.exports = router;
