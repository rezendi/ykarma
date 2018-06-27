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

var accounts = [];

/* GET account list */
router.get('/for/:communityId', function(req, res, next) {
  accounts = [];
  const communityId = parseInt(req.params.communityId);
  var method = eth.contract.methods.getAccountCount(communityId);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountCount error', error);
      res.json({"success":false, "error": error});
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
  getAccountFor(id, (account) => {
    console.log('callback', account);
    res.json(account);
  });
});

/* GET account details */
router.get('/url/:url', function(req, res, next) {
  var url = "mailto:" + req.params.url;
  if (!util.verifyURLs(url)) {
    return res.json({"success":false, "error": 'Bad URL(s)'});
  }
  getAccountForUrl(url, (account) => {
    console.log('callback', account);
    res.json(account);
  });
});


/* PUT edit account */
router.put('/update', function(req, res, next) {
  var account = req.body.account;
  console.log("account", JSON.stringify(account));
  if (account.id === 0) {
    return res.json({"success":false, "error": 'Account ID set'});
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
router.delete('/:id', function(req, res, next) {
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

/* PUT give coins */
router.post('/give', function(req, res, next) {
  var sender = req.body.id; // TODO get from session
  var recipient = req.body.email;
  if (!recipient.startsWith("mailto:")) {
    recipient = "mailto:" + recipient;
  }
  if (!util.verifyURLs(recipient)) {
    return res.json({"success":false, "error": "Bad URL"});
  }
  console.log("About to give " + req.body.amount + " from id " + sender + " to", recipient);
  var method = eth.contract.methods.give(
    sender,
    recipient,
    req.body.amount,
    '',
  );
  method.send({from:communityAdminAddress, gas: eth.GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
      res.json({"success":false, "error": error});
    } else {
      console.log('result', result);
      var docRef = firebase.db.collection('email-preferences').doc(recipient);
      docRef.get().then((doc) => {
        console.log("got doc",doc);
        // TODO: query rather than get entire document?
        var sendEmail = !doc.exists || doc.recipient.data().all || !doc.recipient.data()[sender]; 
        if (sendEmail) {
          sendKarmaSentMail(req.body.amount, recipient);
          docRef.update({ [sender]:true }, { create: true } );
        }
        res.json({"success":true});
      })
      .catch(err => {
        console.log('Error getting document', err);
        res.json({"success":false, "error":err});
      });
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});


function getAccountFor(id, callback) {
  var method = eth.contract.methods.accountForId(id);
  console.log("accountForId", id);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountFor error', error);
    } else {
    console.log('getAccountFor result', result);
      var account = {
        id:           result[0],
        communityId:  result[1],
        userAddress:  result[2],
        metadata:     JSON.parse(result[3]),
        urls:         result[4],
        rewards:      result[5],
        givable:      result[6],
        spendable:    result[7],
      };
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
      var account = {
        id:           result[0],
        communityId:  result[1],
        userAddress:  result[2],
        metadata:     JSON.parse(result[3]),
        urls:         result[4],
        rewards:      result[5],
        givable:      result[6],
        spendable:    result[7],
      };
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
    console.log('getAccountForUrl result', result);
      var account = {
        id:           result[0],
        communityId:  result[1],
        userAddress:  result[2],
        metadata:     JSON.parse(result[3]),
        urls:         result[4],
        rewards:      result[5],
        givable:      result[6],
        spendable:    result[7],
      };
      callback(account);
    }
  })
  .catch(function(error) {
    console.log('getAccountFor call error ' + id, error);
  });
}

function sendKarmaSentMail(amount, recipient) {
  const name = ''; // get from session data
  var recipientEmail = recipient.replace("mailto:","");
  // TODO check that the URL is an email address
  const msg = {
    to: recipientEmail,
    from: 'karma@ykarma.com',
    subject: `${name} just sent you ${amount} YKarma!`,
    text: 'You should totally find out more!',
    html: '<strong>You should totally find out more.</strong>',
  };
  sgMail.send(msg);  
}

module.exports = router;
