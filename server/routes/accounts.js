const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const eth = require('./eth');
const util = require('./util');
const firebase = require('./firebase');
const redisService = require("redis");
var redis = redisService.createClient({host:"redis", port: 6379});
redis.on('error', function (err) {
  if (process.env.NODE_ENV === "production") {
    console.log('Something went wrong with Redis', err);
  }
});

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

// GET set up
router.get('/setup', function(req, res, next) {
  if (process.env.NODE_ENV === 'test') {
    util.log("setting up test data");
    req.session.email = "test@example.com";
    req.session.ykid = 2;
    req.session.ykcid = 1;
    req.session.communityAdminId = 1;
  } else {
    util.log("setting up admin account");
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
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.communityAdminId !== communityId) {
    util.log("not allowed to get accounts for", communityId);
    util.log("communityAdminId", req.session.communityAdminId);
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
            return res.json(accounts);
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
    util.log('callback', account);
    res.json(account);
  });
});


/* GET account details */
router.get('/me', function(req, res, next) {
  util.log("me session", req.session, 0);
  if (req.session.ykid) {
    eth.getAccountFor(req.session.ykid, (account) => {
      getSessionFromAccount(req, account);

      // set account as active if not
      if (account.flags == 0x1) {
        util.log("Marking account active");
        var method = eth.contract.methods.editAccount(
          account.id,
          account.userAddress,
          JSON.stringify(account.metadata),
          '0x00'
        );
        eth.doSend(method, res, 1, 2, () => {});
      }

      // populate community and tranche data
      eth.getCommunityFor(req.session.ykid, (community) => {
        account.community = community;
        hydrateAccount(account, () => {
          res.json(account);
        });
      });
    });
  } else {
  var url = req.session.email || req.session.handle;
    url = getLongUrlFromShort(url);
    if (url.startsWith('error')) {
      return res.json({"success":false, "error": url});
    }
    getAccountForUrl(url, (account) => {
      //util.log("getting session from", account, 0);
      getSessionFromAccount(req, account);
      //util.log("me new session", req.session, 0);
      eth.getCommunityFor(req.session.ykid, (community) => {
        //util.log("got community", community, 0);
        account.community = community;
        hydrateAccount(account, () => {
          //util.log("hydrated", account, 0);
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
  if (url.startsWith('error')) {
    return res.json({"success":false, "error": url});
  }

  if (req.session.ykid) {
    addUrlToAccount(req.session.ykid, url, (result) => {
      if (req.body.url.indexOf("@") > 0) {
        req.session.email = req.body.url;
      } else {
        req.session.handle = req.body.url;
      }
      res.json({"success":result});
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
    addUrlToAccount(req.session.ykid, url, (result) => {
      if (req.body.url.indexOf("@") > 0) {
        req.session.email = req.body.url;
      } else {
        req.session.handle = req.body.url;
      }
      res.json({"success":result});
    });
  });
});

/* PUT remove URL */
router.put('/removeUrl', function(req, res, next) {
  var url = getLongUrlFromShort(req.body.url);
  if (url.startsWith("error")) {
    util.log("removing url type", type);
    var type = req.body.type;
    if (type=="twitter") {
      if (!req.session.handle) {
        return res.json({"success":false, "error": "No handle to remove"});      
      }
      url = getLongUrlFromShort(req.session.handle);
    }
    if (type=="email") {
      if (!req.session.email) {
        res.json({"success":false, "error": "No email to remove"});
      }
      url = getLongUrlFromShort(req.session.email);
    }
  }
  removeUrlFromAccount(req.session.ykid, url, (result) => {
    res.json({"success":result});
  });
});


/* PUT edit account */
router.put('/update', function(req, res, next) {
  var account = req.body.account;
  //console.log("updating account", account);
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
  var sender = req.session.email === process.env.ADMIN_EMAIL ? req.body.id : req.session.ykid;
  var recipient = getLongUrlFromShort(req.body.recipient);
  if (recipient.startsWith('error')) {
    return res.json({"success":false, "error": recipient});
  }
  util.log(`About to give ${req.body.amount} from id ${sender} to ${recipient}`, req.body.message);
  var method = eth.contract.methods.give(
    sender,
    recipient,
    req.body.amount,
    req.body.message || '',
  );
  eth.doSend(method, res, 1, 4, function() {
    util.log("karma sent", req.body.recipient);
    if (recipient.startsWith("mailto:")) {
      var account = req.session.account || {};
      account.metadata = account.metadata || {};
      account.metadata.emailPrefs = account.metadata.emailPrefs || {};
      // util.log("emailPrefs", account.metadata.emailPrefs);
      var sendEmail = account.metadata.emailPrefs[req.body.recipient] !== 0 || account.metadata.emailPrefs.kr !== 0;
      if (sendEmail) {
        util.log("sending mail", req.body.recipient);
        const senderName = req.session.name || req.session.email;
        sendKarmaSentEmail(senderName, recipient, req.body.amount);
        if (account.metadata.emailPrefs.kr && account.metadata.emailPrefs.kr !== 0) {
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
        // util.log("sending", method2);
        eth.doSend(method2, res, 1, 4);
      } else {
        util.log("not sending email", account.metadata.emailPrefs);
        return res.json( { "success":true } );
      }
    } else {
      // TODO: Twitter notifications
      return res.json( { "success":true } );
    }
  });
});


/* POST set token */
router.post('/token/set', function(req, res, next) {
  util.log("token set", req.body, 0);
  if (!req.body.token) {
    req.session.uid = null;
    req.session.name = null;
    req.session.email = null;
    req.session.ykid = null;
    req.session.ykcid = null;
    req.session.handle = null;
    req.session.twitter_id = null;
    req.session.account = null;
    return res.json({"success":true});
  }
  firebase.admin.auth().verifyIdToken(req.body.token).then(function(decodedToken) {
    req.session.uid = decodedToken.uid;
    req.session.name = req.session.name ? req.session.name : decodedToken.displayName;
    req.session.email = req.session.email ? req.session.email : decodedToken.email;
    req.session.handle = null;
    //util.log("decoded", JSON.stringify(decodedToken.firebase.identities));
    const twitterIdentities = decodedToken.firebase.identities ? decodedToken.firebase.identities['twitter.com'] : [];
    if (twitterIdentities.length > 0) {
      req.session.twitter_id = twitterIdentities[0];
      req.session.handle = req.session.handle ? req.session.handle : req.body.handle;
    }
    util.log("post token session", req.session, 0);
    res.json({"success":true});
  }).catch(function(error) {
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
      util.debug('getAccountForUrl result', result, 0);
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

function addUrlToAccount(id, url, callback) {
  util.log("adding url "+url, id);
  var notifying = false;
  var method = eth.contract.methods.addUrlToExistingAccount(id, url);
  method.estimateGas({gas: eth.GAS}, function(error, gasAmount) {
    method.send({from:fromAccount, gas: gasAmount * 2}).on('error', (error) => {
      util.warn('addUrlToAccount error', error);
      callback(false);
    })
    .on('confirmation', (number, receipt) => {
      if (number >= 1 && !notifying) {
        //console.log('addUrlToAccount result', receipt);
        notifying = true;
        callback(true);
      }
    });
  });
}

function removeUrlFromAccount(id, url, callback) {
  util.log("removing url "+url, id);
  var notifying = false;
  var method = eth.contract.methods.removeUrlFromExistingAccount(id, url);
  method.estimateGas({gas: eth.GAS}, function(error, gasAmount) {
    method.send({from:fromAccount, gas: gasAmount * 4}).on('error', (error) => {
      util.warn('removeUrlFromAccount error', error);
      callback(false);
    })
    .on('confirmation', (number, receipt) => {
      if (number >= 1 && !notifying) {
        // console.log('removeUrlFromAccount result', receipt);
        notifying = true;
        return callback(true);
      }
    });
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
      tranche.details = JSON.parse(val);
      done();
    } else {
      eth.getAccountFor(id, (account) => {
        tranche.details = {
          metadata:     account.metadata,
          urls:         account.urls,
          communityId : account.communityId
        };
        redis.set(key, JSON.stringify(tranche.details));
        done();
      });
    }
  });
  if (!success) {
    eth.getAccountFor(id, (account) => {
      tranche.details = {
        metadata:     account.metadata,
        urls:         account.urls,
        communityId : account.communityId
      };
      redis.set(key, JSON.stringify(tranche.details));
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
  var urls = account.urls.split(",");
  for (var url in urls) {
    if (url.startsWith("mailto:")) {
      req.session.email = url.substring(7);
    }
    if (url.startsWith("https://twitter.com/")) {
      req.session.handle = url.substring(20);
    }
  }
}

function getLongUrlFromShort(shortUrl) {
  var url = shortUrl;
  if (!url || url.length === 0) {
    return 'error No URL';
  }
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

function sendKarmaSentEmail(sender, recipient, amount) {
  if (process.env.NODE_ENV === "test") return;
  var recipientEmail = recipient.replace("mailto:","");
  // TODO check that the URL is an email address
  const msg = {
    to: recipientEmail,
    from: 'karma@ykarma.com',
    subject: `${sender} just sent you ${amount} YKarma!`,
    text: 'You should totally find out more!',
    html: '<strong>You should totally find out more.</strong>',
  };
  sgMail.send(msg);  
}


module.exports = router;
