var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var eth = require('./eth');

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
  getAccountForUrl(url, (account) => {
    console.log('callback', account);
    res.json(account);
  });
});


/* POST new account */
router.post('/create', function(req, res, next) {
  var account = req.body.account;
  console.log("account", JSON.stringify(account));
  if (account.id !== 0) {
    return res.json({"success":false, "error": 'Account exists'});
  }
  if (!verifyURLs(account.urls)) {
    return res.json({"success":false, "error": 'Bad URL(s)'});
  }
  var method = eth.contract.methods.addNewAccount(
    account.communityId,
    account.userAddress,
    JSON.stringify(account.metadata),
    account.urls,
  );
  method.send({from:communityAdminAddress, gas: eth.GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
      res.json({"success":false, "error": error});
    } else {
      console.log('result', result);
      res.json('{success:true}');
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
    res.json({"success":false, "error": error});
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
  var sender = req.body.id;
  var recipient = req.body.email;
  if (!recipient.startsWith("mailto:")) {
    recipient = "mailto:" + recipient;
  }
  if (!verifyURLs(recipient)) {
    return res.json({"success":false, "error": "Bad URL"});
  }
  console.log("About to give " + req.body.amount + " from id " + sender + " to", recipient);
  var method = eth.contract.methods.give(
    sender,
    recipient,
    req.body.amount,
  );
  console.log("About to send", req.body);
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

function verifyURLs(urls) {
  return true;
}

module.exports = router;
