const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const eth = require('./eth');
const util = require('./util');
const email = require('./emails');
const firebase = require('./firebase');
const redisService = require("redis");
var redis = redisService.createClient({host:"redis", port: 6379});
redis.on('error', function (err) {
  if (process.env.NODE_ENV === "production") {
    console.log('Something went wrong with Redis', err);
  }
});

var accountCache = {}

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

// GET set up
router.get('/setup', function(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    util.warn("setting up test data");
    req.session.email = process.env.ADMIN_EMAIL;
    req.session.ykid = 2;
    req.session.ykcid = 1;
    req.session.communityAdminId = 1;
    util.log("set up test data", req.session);
  } else {
    util.warn("setting up admin account");
    getAccountForUrl('mailto:'+process.env.ADMIN_EMAIL, (account) => {
      if (account.id !== '0') {
        return res.json({"success":true, 'message':'Redundant'});
      }
      var method = eth.contract.methods.addNewAccount(1, 0, '{"name":"Admin"}', '0x00', 'mailto:'+process.env.ADMIN_EMAIL);
      doSend(method, res, 1, 2);
    });
  }
  return res.json({"success":true});
});


/* GET account list */
router.get('/for/:communityId', function(req, res, next) {
  const communityId = parseInt(req.params.communityId);
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.ykcid !== communityId) {
    util.log("not allowed to get accounts for", communityId);
    return res.json([]);
  }
  util.log("getting accounts for",communityId);
  var accounts = [];
  var method = eth.contract.methods.getAccountCount(communityId);
  method.call(function(error, result) {
    if (error) {
      util.warn('getAccountCount error', error);
      res.json([]);
    } else {
      util.log('getAccountCount result', result);
      for (var i = 0; i < result; i++) {
        getAccountWithinCommunity(communityId, i, (account) => {
          accounts.push(account);
          if (accounts.length >= result) {
            // console.log('accounts', accounts);
            var activeAccounts = accounts.filter(acct => !hasNeverLoggedIn(acct));
            return res.json(activeAccounts);
          }
        });
      }
    }
  })
  .catch(function(error) {
    util.log('getAccountCount call error', error);
  });
});

/* GET account details */
router.get('/account/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  eth.getAccountFor(id, (account) => {
    if (req.session.email !== process.env.ADMIN_EMAIL && req.session.ykid !== id && req.session.ykcid != account.communityId) {
      util.warn('Unauthorized account request', req.session);
      return res.json({"success":false, "error": "Not authorized"});
    }
    util.debug('account', account);
    res.json(account);
  });
});


/* GET account details */
router.get('/me', async function(req, res, next) {
  util.log("me session", req.session);
  var id = await eth.getId();
  if (!id) {
    return res.status(400).send({
      message: "web3 not connected"
    });
  }
  if (req.session.ykid) {
    eth.getAccountFor(req.session.ykid, (account) => {
      getSessionFromAccount(req, account);

      // set account as active, and replenish, if not
      if (hasNeverLoggedIn(account)) {
        util.warn("Marking account active and replenishing");
        var method = eth.contract.methods.editAccount(
          account.id,
          account.userAddress,
          JSON.stringify(account.metadata),
          '0x00'
        );
        eth.doSend(method, res, 1, 2, () => {
          redis.del(`account-${account.id}`); // clear our one redis cache
          method = eth.contract.methods.replenish(account.id);
          eth.doSend(method, res, 1, 2, () => {
            // populate community and tranche data
            eth.getCommunityFor(req.session.ykcid, (community) => {
              account.community = community;
              hydrateAccount(account, () => {
                account.given = account.given.reverse();
                account.received = account.received.reverse();
                res.json(account);
              });
            });
          });
        });
      } else {
        // populate community and tranche data
        eth.getCommunityFor(req.session.ykcid, (community) => {
          account.community = community;
          hydrateAccount(account, () => {
            account.given = account.given.reverse();
            account.received = account.received.reverse();
            res.json(account);
          });
        });
      }

    });
  } else {
  var url = req.session.email || req.session.handle;
    url = getLongUrlFromShort(url);
    if (url.startsWith('error')) {
      return res.json({"success":false, "error": url});
    }
    getAccountForUrl(url, (account) => {
      getSessionFromAccount(req, account);
      eth.getCommunityFor(req.session.ykcid, (community) => {
        account.community = community;
        hydrateAccount(account, () => {
          res.json(account);
        });
      });
    });
  }
});

/* GET account details */
router.get('/url/:url', function(req, res, next) {
  var url = req.params.url;
  if (req.session.email !== url && req.session.handle !== url && req.session.email !== process.env.ADMIN_EMAIL) {
    util.warn("Not authorized", req.params.url);
    return res.json({"success":false, "error": "Not authorized"});
  }
  url = getLongUrlFromShort(url);
  if (url.startsWith('error')) {
    return res.json({"success":false, "error": url});
  }
  getAccountForUrl(url, (account) => {
    res.json(account);
  });
});


/* PUT replenish */
router.put('/replenish', function(req, res, next) {
  const id = parseInt(req.body.id || req.session.ykid);
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.ykid !== id) {
    return res.json({"success":false, "error": "Not authorized"});
  }
  var method = eth.contract.methods.replenish(id);
  eth.doSend(method, res);
});

/* PUT add URL */
// TODO: connect to Twitter to verify the twitter_id and handle match
// Low priority since the on-chain contract ensures you can't spoof a handle that has ever been sent any YK,
// and if one of those _is_ spoofed, that just means they they get the ability to hijack the spoofer's YK account
router.put('/addUrl', function(req, res, next) {
  var url = getLongUrlFromShort(req.body.url);
  util.debug("adding url", url);
  if (url.startsWith('error')) {
    return res.json({"success":false, "error": url});
  }

  if (req.session.ykid) {
    util.debug("adding url to existing account");
    var method = eth.contract.methods.addUrlToExistingAccount(req.session.ykid, url);
    eth.doSend(method, res, 1, 2, () => {
      if (req.body.url.indexOf("@") > 0) {
        req.session.email = req.body.url;
      } else {
        req.session.handle = req.body.url;
      }
      res.json({"success":req.body.url});
    });
    return;
  }
    
  // Are we not logged in as a YK user but hoping to add this current URL as a YK user?
  const existing = req.session.handle || req.session.email;
  var longExisting = getLongUrlFromShort(existing);
  if (longExisting.startsWith('error')) {
    return res.json({"success":false, "error": "existing "+longExisting});
  }
  getAccountForUrl(url, (account) => {
    getSessionFromAccount(req, account);
    var method = eth.contract.methods.addUrlToExistingAccount(req.session.ykid, url);
    eth.doSend(method, res, 1, 2, () => {
      if (req.body.url.indexOf("@") > 0) {
        req.session.email = req.body.url;
      } else {
        req.session.handle = req.body.url;
      }
      res.json({"success":req.body.url});
    });
  });
});

/* PUT remove URL */
router.put('/removeUrl', function(req, res, next) {
  var type = req.body.type;
  var url = req.body.url || "error";
  util.log("removing url type", type);
  if (!type) {
    type = url.indexOf("@") > 0 ? "email" : "twitter";
    util.log("removing url implied type", type);
  }
  if (type === "email") {
    url = getLongUrlFromShort(req.session.email);
  } else {
    url = getLongUrlFromShort(req.session.handle);
  }
  util.log("removing url", url);
  if (url.startsWith("error")) {
    return res.json({"success":false, "error": "Invalid URL"});
  }
  var method = eth.contract.methods.removeUrlFromExistingAccount(req.session.ykid, url);
  eth.doSend(method, res, 1, 2, () => {
    if (type === "email") {
      req.session.email = null;
    } else {
      req.session.handle = null;
      req.session.twitter_id = null;
    }
    res.json({"success":true});
  });
});


/* PUT edit account */
router.put('/update', function(req, res, next) {
  var account = req.body.account;
  util.log("updating account", account);
  if (account.id === 0) {
    return res.json({"success":false, "error": 'Account ID not set'});
  }
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.ykid !== account.id) {
    return res.json({"success":false, "error": "Not authorized"});
  }
  //console.log("About to edit", account);
  var method = eth.contract.methods.editAccount(
    account.id,
    account.userAddress,
    JSON.stringify(account.metadata),
    account.flags || '0x00'
  );
  eth.doSend(method, res);
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
  var method = eth.contract.methods.deleteAccount(req.params.id);
  eth.doSend(method, res);
});


/* POST give coins */
router.post('/give', function(req, res, next) {
  var sender = req.session.email === process.env.ADMIN_EMAIL ? req.body.id || req.session.ykid : req.session.ykid;
  var recipientUrl = getLongUrlFromShort(req.body.recipient);
  if (recipientUrl.startsWith('error')) {
    return res.json({"success":false, "error": recipientUrl});
  }
  util.warn(`About to give ${req.body.amount} from id ${sender} to ${recipientUrl}`, req.body.message);
  var method = eth.contract.methods.give(
    sender,
    recipientUrl,
    req.body.amount,
    req.body.message || '',
  );
  eth.doSend(method, res, 1, 4, function() {
    util.log("karma sent to", req.body.recipient);
    if (recipientUrl.startsWith("mailto:")) {
      var account = req.session.account || {};
      account.metadata = account.metadata || {};
      account.metadata.emailPrefs = account.metadata.emailPrefs || {};
      util.log("emailPrefs", account.metadata.emailPrefs);
      let sendNonMemberEmail = account.metadata.emailPrefs[req.body.recipient] !== 0;
      getAccountForUrl(recipientUrl, (recipient) => {
        // util.debug("recipient", recipient);
        // util.debug("hasNeverLoggedIn", ""+hasNeverLoggedIn(recipient));
        let sendEmail = hasNeverLoggedIn(recipient) ? sendNonMemberEmail : !recipient.metadata.emailPrefs || recipient.metadata.emailPrefs.kr !== 0;
        if (sendEmail) {
          util.log("sending mail", req.body.recipient);
          const senderName = req.session.name || req.session.email;
          email.sendKarmaSentEmail(senderName, recipientUrl, req.body.amount, req.body.message, hasNeverLoggedIn(recipient));
          if (!hasNeverLoggedIn(recipient)) {
            return res.json( { "success":true } );
          }
  
          // make sure we don't send karma-received email more than once unless explicitly desired
          account.metadata.emailPrefs[req.body.recipient] = 0;
          util.log("updated metadata", account.metadata);
          var method2 = eth.contract.methods.editAccount(
            account.id,
            account.userAddress,
            JSON.stringify(account.metadata),
            account.flags
          );
          eth.doSend(method2, res, 1, 4);
        } else {
          util.log("not sending email", account.metadata.emailPrefs);
          return res.json( { "success":true } );
        }
      });
    } else {
      // TODO: Twitter notifications
      return res.json( { "success":true } );
    }
  });
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
    const twitterIdentities = decodedToken.firebase.identities ? decodedToken.firebase.identities['twitter.com'] : [];
    if (twitterIdentities && twitterIdentities.length > 0) {
      req.session.twitter_id = twitterIdentities[0];
      req.session.handle = req.session.handle ? req.session.handle : req.body.handle;
    } else {
      req.session.handle = null;      
    }
    util.debug("post token session", req.session);
    res.json({"success":true});
  }).catch(function(error) {
    console.log("error", error);
    res.json({"success":false, "error":error});
  });
});


function getAccountWithinCommunity(communityId, idx, callback) {
  var method = eth.contract.methods.accountWithinCommunity(communityId, idx);
  // console.log("accountWithinCommunity idx "+idx, communityId);
  method.call(function(error, result) {
    if (error) {
      util.warn('accountWithinCommunity error', error);
    } else {
      // console.log('accountWithinCommunity result', result);
      var account = eth.getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    util.warn('accountWithinCommunity call error ' + id, error);
    callback({});
  });
}

function getAccountForUrl(url, callback) {
  var method = eth.contract.methods.accountForUrl(url);
  // util.log("method", method);
  method.call(function(error, result) {
    if (error) {
      util.warn('getAccountForUrl error', error);
    } else {
      util.debug('getAccountForUrl result', result);
      var account = eth.getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    util.warn('getAccountForUrl call error ' + url, error);
  });
}

function getAccountWithinCommunity(communityId, idx, callback) {
  var method = eth.contract.methods.accountWithinCommunity(communityId, idx);
  // console.log("accountWithinCommunity idx "+idx, communityId);
  method.call(function(error, result) {
    if (error) {
      util.warn('accountWithinCommunity error', error);
    } else {
      // console.log('accountWithinCommunity result', result);
      var account = eth.getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    util.warn('accountWithinCommunity call error ' + id, error);
    callback({});
  });
}

function hydrateAccount(account, done) {
  var hydrated = 0;
  if (account.given.length===0 && account.received.length===0) {
    done();
  }
  for (var i = 0; i < account.given.length; i++) {
    var given = account.given[i];
    hydrateTranche(given, true, () => {
      hydrated += 1;
      if (hydrated == account.given.length + account.received.length) {
        done();
      }
    });
  }
  for (var j = 0; j < account.received.length; j++) {
    var received = account.received[j];
    hydrateTranche(received, false, () => {
      hydrated += 1;
      if (hydrated == account.given.length + account.received.length) {
        done();
      }
    });
  }
}

function hydrateTranche(tranche, given, done) {
  // check account cache on redis
  const id = given ? tranche.receiver : tranche.sender;
  util.log("hydrating tranche for", id);
  const key = `account-${id}`;
  var success = redis.get(key, function (err, val) {
    if (err) {
      util.warn("redis error", err);
    }
    if (val && val !== '') {
      util.debug("redis cache hit");
      tranche.details = JSON.parse(val);
      done();
      return;
    }
    eth.getAccountFor(id, (account) => {
      tranche.details = {
        name:         account.metadata.name,
        urls:         account.urls,
        communityId : account.communityId
      };
      redis.set(key, JSON.stringify(tranche.details));
      done();
    });
  });

  // if redis not working
  if (!success) {
    val = accountCache[key];
    if (val) {
      tranche.details = JSON.parse(val);
      done();
      return;
    }
    eth.getAccountFor(id, (account) => {
      tranche.details = {
        name:         account.metadata.name,
        urls:         account.urls,
        communityId : account.communityId
      };
      accountCache[key] = JSON.stringify(tranche.details);
      done();
    });
  }
}

// Utility functions

function getSessionFromAccount(req, account) {
  req.session.ykid = parseInt(account.id);
  req.session.ykcid = parseInt(account.communityId);
  req.session.name = account.metadata.name;
  req.session.account = account;
  var urls = account.urls.split(util.separator);
  util.debug("urls", urls);
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
  return account.id === 0 || account.flags === '0x0000000000000000000000000000000000000000000000000000000000000001';
}

module.exports = router;
