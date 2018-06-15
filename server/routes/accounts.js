var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();

var Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545/"));
const abi = [{"constant":true,"inputs":[],"name":"senderIsOracle","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"v","type":"uint256"}],"name":"uintToBytes","outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"newOracle","type":"address"}],"name":"addOracle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_tranches","type":"address"},{"name":"_accounts","type":"address"},{"name":"_communities","type":"address"},{"name":"_vendors","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"oracleAddress","type":"address"}],"name":"OracleAdded","type":"event"},{"constant":false,"inputs":[{"name":"_tranches","type":"address"}],"name":"updateTrancheContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_accounts","type":"address"}],"name":"updateAccountsContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communities","type":"address"}],"name":"updateCommunitiesContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_vendors","type":"address"}],"name":"updateVendorsContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"},{"name":"_url","type":"string"}],"name":"give","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_rewardId","type":"uint256"}],"name":"spend","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_accountId","type":"uint256"}],"name":"replenish","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getCommunityCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"communityForId","outputs":[{"name":"","type":"uint256"},{"name":"","type":"address"},{"name":"","type":"bool"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_adminAddress","type":"address"},{"name":"_isClosed","type":"bool"},{"name":"_domain","type":"string"},{"name":"_metadata","type":"string"},{"name":"_tags","type":"string"}],"name":"addCommunity","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_adminAddress","type":"address"},{"name":"_isClosed","type":"bool"},{"name":"_domain","type":"string"},{"name":"_metadata","type":"string"},{"name":"_tags","type":"string"}],"name":"editCommunity","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_accountId","type":"uint256"}],"name":"removeAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"deleteCommunity","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_communityId","type":"uint256"}],"name":"getAccountCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"accountForId","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_address","type":"address"},{"name":"_metadata","type":"string"},{"name":"_url","type":"string"}],"name":"addNewAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_newAddress","type":"address"},{"name":"_metadata","type":"string"}],"name":"editAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_newUrl","type":"string"}],"name":"addUrlToAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_newUrl","type":"string"}],"name":"removeUrlFromAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"deleteAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_metadata","type":"string"},{"name":"_address","type":"address"}],"name":"addVendor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_vendorId","type":"uint256"},{"name":"_cost","type":"uint256"},{"name":"_tag","type":"string"},{"name":"_metadata","type":"string"}],"name":"addReward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
const contract = new web3.eth.Contract(abi, "0x1a0689c3009025b429a08834bb7ca8af8e1713c9");
const GAS = "5000000";
var communityAdminAddress = null;

// TODO: if it's a community admin, use their address if available
web3.eth.getAccounts().then((ethAccounts) => {
  communityAdminAddress = ethAccounts[0];
});

var accounts = [];

/* GET account list */
router.get('/for/:communityId', function(req, res, next) {
  accounts = [];
  const communityId = parseInt(req.params.communityId);
  var method = contract.methods.getAccountCount(communityId);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountCount error', error);
    } else {
      console.log('getAccountCount result', result);
      for (var i = 0; i < result; i++) {
        getAccountFor(communityId, i, result, () => {
          console.log('callback', accounts);
          res.json(accounts);
        });
      }
    }
  })
  .catch(function(error) {
    console.log('getAccountCount call error', error);
  });
});

/* GET community details */
router.get('/:id', function(req, res, next) {
  for (var i=0; i<accounts.length; i++) {
    if (parseInt(accounts[i].id) === parseInt(req.params.id)) {
      return res.json(accounts[i]);
    }
  }
  res.json({metadata:{ name: "n/a"}});
});


/* POST new account */
router.post('/create', function(req, res, next) {
  var account = req.body.account;
  console.log("account", JSON.stringify(account));
  if (account.id !== 0) {
    res.redirect('/admin'); // account already exists
  }
  var method = contract.methods.addNewAccount(
    account.communityId,
    account.userAddress,
    JSON.stringify(account.metadata),
    account.urls,
  );
  method.send({from:communityAdminAddress, gas: GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
    } else {
      console.log('result', result);
      res.json('{success:true}');
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});

/* PUT edit account */
router.put('/update', function(req, res, next) {
  var account = req.body.account;
  console.log("account", JSON.stringify(account));
  if (account.id === 0) {
    res.redirect('/admin'); // account not saved
  }
  var method = contract.methods.editAccount(
    account.id,
    account.userAddress,
    JSON.stringify(account.metadata),
  );
  method.send({from:communityAdminAddress, gas: GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
    } else {
      console.log('result', result);
      res.json(account);
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});

/* DELETE remove account. */
router.delete('/:id', function(req, res, next) {
  if (req.params.id === 0) {
    res.redirect('/admin'); // account not saved
  }
  var method = contract.methods.deleteAccount(req.params.id);
  method.send({from:communityAdminAddress, gas: GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
    } else {
      console.log('result', result);
      res.json({"success":"true"});
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});

function getAccountFor(communityId, i, total, callback) {
  var method = contract.methods.accountForId(i+1);
  method.call(function(error, result) {
    if (error) {
      console.log('getAccountFor error', error);
    } else {
      console.log('getAccountFor result', result);
      if (i == total-1) {
        var account = {
          id:           result[0],
          communityId:  result[1],
          userAddress:  result[2],
          metadata:     JSON.parse(result[3]),
          urls:         result[4],
        };
        accounts.push(account);
        console.log('accounts', accounts);
        callback();
      }
    }
  })
  .catch(function(error) {
    console.log('getAccountFor call error ' + i, error);
  });
}
module.exports = router;
