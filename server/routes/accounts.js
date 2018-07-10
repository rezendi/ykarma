var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var eth = require('./eth');
var util = require('./util');
var firebase = require('./firebase');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// TODO: if it's a community admin, use their address if available
var communityAdminAddress = null;
eth.web3.eth.getAccounts().then((ethAccounts) => {
  communityAdminAddress = ethAccounts[0];
});

const ADMIN_ID = 1;

/* GET account list */
router.get('/for/:communityId', function(req, res, next) {
  const communityId = parseInt(req.params.communityId);
  if (req.session.ykid !== ADMIN_ID && req.session.communityAdminId !== communityId) {
    return res.json([]);
  }
  var accounts = [];
  var method = eth.contract.methods.getAccountCount(communityId);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountCount error', error);
      res.json([]);
    } else {
      console.log('getAccountCount result', result);
      for (var i = 0; i < result; i++) {
        getAccountWithinCommunity(communityId, i, (account) => {
          accounts.push(account);
          console.log('callback', accounts);
          if (accounts.length >= result) {
            res.json(accounts);
          }
        });
      }
    }
  })
  .catch(function(error) {
    console.log('getAccountCount call error', error);
  });
});

/* GET account details */
router.get('/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  if (req.session.ykid !== ADMIN_ID && req.session.ykid !== id) {
    return res.json({"success":false, "error": "Not authorized"});
  }
  getAccountFor(id, (account) => {
    console.log('callback', account);
    res.json(account);
  });
});


/* GET account details */
router.get('/url/:url', function(req, res, next) {
  if (req.session.email!==url && req.session.handle != url && req.session.ykid != ADMIN_ID) {
    console.log("Not authorized", req.params.url);
    return res.json({"success":false, "error": "Not authorized"});
  }
  var url = getLongUrlFromShort(req.params.url);
  if (url.startsWith('error')) {
    return res.json({"success":false, "error": url});
  }
  getAccountForUrl(url, (account) => {
    // console.log('accountForUrl callback', account);
    getSessionFromAccount(req, account);
    // console.log("account session", req.session);
    res.json(account);
  });
});


/* PUT add URL */
router.put('/addUrl', function(req, res, next) {
  var url = getLongUrlFromShort(req.body.url);
  console.log("trying to add url", url);
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
  console.log("removing url type", type);
  var type = req.body.type;
  var url = '';
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
  removeUrlFromAccount(req.session.ykid, url, (result) => {
    res.json({"success":result});
  });
});


/* PUT edit account */
router.put('/update', function(req, res, next) {
  var account = req.body.account;
  console.log("account", JSON.stringify(account));
  if (account.id === 0) {
    return res.json({"success":false, "error": 'Account ID not set'});
  }
  if (req.session.ykid !== ADMIN_ID && req.session.ykid !== account.id) {
    return res.json({"success":false, "error": "Not authorized"});
  }
  var method = eth.contract.methods.editAccount(
    account.id,
    account.userAddress,
    JSON.stringify(account.metadata),
  );
  method.send({from:communityAdminAddress, gas: eth.GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
      res.json({"success":false, "error": error});
    } else {
      console.log('result', result);
      res.json(account);
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
    res.json({"success":false, "error": error});
  });
});


/* DELETE remove account. */
router.delete('/destroy/:id', function(req, res, next) {
  if (req.session.ykid !== ADMIN_ID) {
    return res.json({"success":false, "error": "Admin only"});
  }
  if (req.params.id === 0) {
    return res.json({"success":false, "error": 'Account not saved'});
  }
  var method = eth.contract.methods.deleteAccount(req.params.id);
  method.send({from:communityAdminAddress, gas: eth.GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
      res.json({"success":false, "error": error});
    } else {
      console.log('result', result);
      res.json({"success":true});
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});


/* POST give coins */
router.post('/give', function(req, res, next) {
  var sender = req.session.ykid === ADMIN_ID ? req.body.id : req.session.ykid;
  var recipient = getLongUrlFromShort(req.body.recipient);
  if (recipient.startsWith('error')) {
    return res.json({"success":false, "error": recipient});
  }
  console.log(`About to give ${req.body.amount} from id ${sender} to ${recipient}`, req.body.message);
  var notifying = false;
  var method = eth.contract.methods.give(
    sender,
    recipient,
    req.body.amount,
    req.body.message || '',
  );
  method.send({from:communityAdminAddress, gas: eth.GAS}).on('error', (error) => {
    console.log('error', error);
    res.json({'success':false, 'error':error});
  })
  .on('confirmation', (number, receipt) => {
    if (number >= 1 && !notifying) {
      notifying = true;
      console.log('got receipt');
      if (recipient.startsWith("mailto:")) {
        var docRef = firebase.db.collection('email-preferences').doc(recipient);
        docRef.get().then((doc) => {
          // TODO: query rather than get entire document?
          var sendEmail = !doc.exists || doc.recipient.data().all || !doc.recipient.data()[sender]; 
          if (sendEmail) {
            console.log("sending mail");
            const senderName = req.session.name || req.session.email;
            sendKarmaSentMail(senderName, recipient, req.body.amount);
            docRef.update({ [sender]:true }, { create: true } );
          }
          res.json({"success":true});
        })
        .catch(err => {
          console.log('Error getting document', err);
          res.json({"success":false, "error":err});
        });
      } else {
        // TODO: Twitter notifications
        res.json({"success":true});
      }
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});


/* POST set token */
router.post('/token/set', function(req, res, next) {
  // console.log("token set", req.body);
  if (!req.body.token) {
    req.session.uid = null;
    req.session.name = null;
    req.session.email = null;
    req.session.ykid = null;
    req.session.handle = null;
    return res.json({"success":true});
  }
  firebase.admin.auth().verifyIdToken(req.body.token).then(function(decodedToken) {
    req.session.uid = decodedToken.uid;
    req.session.name = req.session.name ? req.session.name : decodedToken.displayName;
    req.session.email = req.session.email ? req.session.email : decodedToken.email;
    req.session.handle = req.session.handle ? req.session.handle : req.body.handle;
    // console.log("session", req.session);
    res.json({"success":true});
  }).catch(function(error) {
    res.json({"success":false, "error":error});
  });
});


// GET set up test
router.get('/setUpTest', function(req, res, next) {
  if(process.env.NODE_ENV === 'test') {
    req.session.email = "test@rezendi.com";
    req.session.ykid = 2;
  }
  return res.json({"success":true});
});


function getAccountFor(id, callback) {
  var method = eth.contract.methods.accountForId(id);
  console.log("accountForId", id);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountFor error', error);
    } else {
      console.log('getAccountFor result', result);
      var account = getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    console.log('getAccountFor call error ' + id, error);
  });
}

function getAccountWithinCommunity(communityId, idx, callback) {
  var method = eth.contract.methods.accountWithinCommunity(communityId, idx);
  console.log("accountWithinCommunity id", communityId);
  console.log("accountWithinCommunity idx", idx);
  method.call(function(error, result) {
    if (error) {
      console.log('accountWithinCommunity error', error);
    } else {
      console.log('accountWithinCommunity result', result);
      var account = getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    console.log('accountWithinCommunity call error ' + id, error);
  });
}

function getAccountForUrl(url, callback) {
  var method = eth.contract.methods.accountForUrl(url);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountForUrl error', error);
    } else {
      //console.log('getAccountForUrl result', result);
      var account = getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    console.log('getAccountFor call error ' + id, error);
  });
}

function addUrlToAccount(id, url, callback) {
  console.log("adding url "+url, id);
  var notifying = false;
  var method = eth.contract.methods.addUrlToExistingAccount(id, url);
  method.send({from:communityAdminAddress, gas: eth.GAS}).on('error', (error) => {
    console.log('addUrlToAccount error', error);
    callback(false);
  })
  .on('confirmation', (number, receipt) => {
    if (number >= 1 && !notifying) {
      console.log('addUrlToAccount result', receipt);
      notifying = true;
      callback(true);
    }
  });
}

function removeUrlFromAccount(id, url, callback) {
  var method = eth.contract.methods.removeUrlFromExistingAccount(id, url);
  method.send(function(error, result) {
    if (error) {
      console.log('removeUrlFromAccount error', error);
    } else {
      callback(result);
    }
  })
  .catch(function(error) {
    console.log('removeUrlFromAccount call error ' + id, error);
  });
}


// Utility functions

function getSessionFromAccount(req, account) {
  req.session.ykid = parseInt(account.id);
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

function getAccountFromResult(result) {
  // console.log("result",result);
  return {
    id:           result[0],
    communityId:  result[1],
    userAddress:  result[2],
    flags:        result[3],
    metadata:     JSON.parse(result[4] || '{}'),
    urls:         result[5],
    rewards:      result[6],
    givable:      result[7],
    given:        JSON.parse(result[8] || '{}'),
    spendable:    JSON.parse(result[9] || '{}'),
  };
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
