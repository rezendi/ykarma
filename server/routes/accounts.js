var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var eth = require('./eth');
var util = require('./util');
var firebase = require('./firebase');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

accountCache = {}; // TODO probably move this to redis

// GET set upFADMIN
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
      var method = eth.contract.methods.addNewAccount(1, 0, '{"name":"Admin"}', 'mailto:'+process.env.ADMIN_EMAIL);
      doSend(method, res, 1, 2);
    });
  }
  return res.json({"success":true});
});


/* GET account list */
router.get('/for/:communityId', function(req, res, next) {
  const communityId = parseInt(req.params.communityId);
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.communityAdminId !== communityId) {
    util.log("not allowed to get accounts for",communityId);
    util.log("communityAdminId",req.session.communityAdminId);
    return res.json([]);
  }
  util.log("getting accounts for",communityId);
  var accounts = [];
  var method = eth.contract.methods.getAccountCount(communityId);
  method.call(function(error, result) {
    if (error) {
      util.log('getAccountCount error', error);
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
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.ykid !== id) {
    return res.json({"success":false, "error": "Not authorized"});
  }
  eth.getAccountFor(id, (account) => {
    util.log('callback', account);
    res.json(account);
  });
});


/* GET account details */
router.get('/me', function(req, res, next) {
  util.log("me session", req.session);
  if (req.session.ykid) {
    eth.getAccountFor(req.session.ykid, (account) => {
      getSessionFromAccount(req, account);
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
      util.log("getting session from", account);
      getSessionFromAccount(req, account);
      util.log("me new session", req.session);
      eth.getCommunityFor(req.session.ykid, (community) => {
        util.log("got community", community);
        account.community = community;
        hydrateAccount(account, () => {
          util.log("hydrated", account);
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
    util.log("Not authorized", req.params.url);
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
    '0x00'
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
  var sender = req.session.email !== process.env.ADMIN_EMAIL ? req.body.id : req.session.ykid;
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
    if (process.env.NODE_ENV!="test" && recipient.startsWith("mailto:")) {
      var docRef = firebase.db.collection('email-preferences').doc(recipient);
      docRef.get().then((doc) => {
        // TODO: query rather than get entire document?
        var sendEmail = !doc.exists || !doc.recipient || !doc.recipient.data().all || !doc.recipient.data()[sender]; 
        if (sendEmail) {
          util.log("sending mail");
          const senderName = req.session.name || req.session.email;
          sendKarmaSentMail(senderName, recipient, req.body.amount);
          docRef.update({ [sender]:true }, { create: true } );
        }
        return res.json({"success":true});
      })
      .catch(err => {
        util.log('Error getting document', err);
        return res.json({"success":false, "error":err});
      });
    } else {
      // TODO: Twitter notifications
      return res.json({"success":true});
    }
  });
});


/* POST set token */
router.post('/token/set', function(req, res, next) {
  util.log("token set", req.body);
  if (!req.body.token) {
    req.session.uid = null;
    req.session.name = null;
    req.session.email = null;
    req.session.ykid = null;
    req.session.ykcid = null;
    req.session.handle = null;
    req.session.twitter_id = null;
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
    util.log("post token session", req.session);
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
      util.log('accountWithinCommunity error', error);
    } else {
      // console.log('accountWithinCommunity result', result);
      var account = eth.getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    util.log('accountWithinCommunity call error ' + id, error);
    callback({});
  });
}

function getAccountForUrl(url, callback) {
  var method = eth.contract.methods.accountForUrl(url);
  // util.log("method", method);
  method.call(function(error, result) {
    if (error) {
      util.log('getAccountForUrl error', error);
    } else {
      util.log('getAccountForUrl result', result);
      var account = eth.getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    util.log('getAccountForUrl call error ' + url, error);
  });
}

function getAccountWithinCommunity(communityId, idx, callback) {
  var method = eth.contract.methods.accountWithinCommunity(communityId, idx);
  // console.log("accountWithinCommunity idx "+idx, communityId);
  method.call(function(error, result) {
    if (error) {
      util.log('accountWithinCommunity error', error);
    } else {
      // console.log('accountWithinCommunity result', result);
      var account = eth.getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    util.log('accountWithinCommunity call error ' + id, error);
    callback({});
  });
}

function addUrlToAccount(id, url, callback) {
  util.log("adding url "+url, id);
  var notifying = false;
  var method = eth.contract.methods.addUrlToExistingAccount(id, url);
  method.estimateGas({gas: eth.GAS}, function(error, gasAmount) {
    method.send({from:fromAccount, gas: gasAmount * 2}).on('error', (error) => {
      util.log('addUrlToAccount error', error);
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
      util.log('removeUrlFromAccount error', error);
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
  const id = given ? tranche.receiver : tranche.sender;
  if (id in accountCache) {
    tranche.details = accountCache[id];
    done();
  } else {
    eth.getAccountFor(id, (account) => {
      tranche.details = {
        metadata:     account.metadata,
        urls:         account.urls,
        communityId : account.communityId
      };
      accountCache[id] = tranche.details;
      done();
    });
  }
}

// Utility functions

function getSessionFromAccount(req, account) {
  req.session.ykid = parseInt(account.id);
  req.session.ykcid = parseInt(account.communityId);
  req.session.name = account.metadata.name;
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

function sendKarmaSentMail(sender, recipient, amount) {
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

module.exports = router;
