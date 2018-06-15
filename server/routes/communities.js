var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();

var Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545/"));
const abi = [{"constant":true,"inputs":[],"name":"senderIsOracle","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"v","type":"uint256"}],"name":"uintToBytes","outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"newOracle","type":"address"}],"name":"addOracle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_tranches","type":"address"},{"name":"_accounts","type":"address"},{"name":"_communities","type":"address"},{"name":"_vendors","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"oracleAddress","type":"address"}],"name":"OracleAdded","type":"event"},{"constant":false,"inputs":[{"name":"_tranches","type":"address"}],"name":"updateTrancheContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_accounts","type":"address"}],"name":"updateAccountsContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communities","type":"address"}],"name":"updateCommunitiesContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_vendors","type":"address"}],"name":"updateVendorsContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"},{"name":"_url","type":"string"}],"name":"give","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_rewardId","type":"uint256"}],"name":"spend","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_accountId","type":"uint256"}],"name":"replenish","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getCommunityCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"communityForId","outputs":[{"name":"","type":"uint256"},{"name":"","type":"address"},{"name":"","type":"bool"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_adminAddress","type":"address"},{"name":"_isClosed","type":"bool"},{"name":"_domain","type":"string"},{"name":"_metadata","type":"string"},{"name":"_tags","type":"string"}],"name":"addCommunity","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_adminAddress","type":"address"},{"name":"_isClosed","type":"bool"},{"name":"_domain","type":"string"},{"name":"_metadata","type":"string"},{"name":"_tags","type":"string"}],"name":"editCommunity","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_accountId","type":"uint256"}],"name":"removeAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"deleteCommunity","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_communityId","type":"uint256"}],"name":"getAccountCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"accountForId","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_address","type":"address"},{"name":"_metadata","type":"string"},{"name":"_url","type":"string"}],"name":"addNewAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_newAddress","type":"address"},{"name":"_metadata","type":"string"}],"name":"editAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_newUrl","type":"string"}],"name":"addUrlToAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_newUrl","type":"string"}],"name":"removeUrlFromAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"deleteAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_metadata","type":"string"},{"name":"_address","type":"address"}],"name":"addVendor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_vendorId","type":"uint256"},{"name":"_cost","type":"uint256"},{"name":"_tag","type":"string"},{"name":"_metadata","type":"string"}],"name":"addReward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
const contract = new web3.eth.Contract(abi, "0x286fb1294c1cf5112baa3f3358c6f7e412e287a4");
const GAS = "5000000";
var fromAccount = null;

web3.eth.getAccounts().then((accounts) => {
  fromAccount = accounts[0];
});

var communities = [];

/* GET community list */
router.get('/', function(req, res, next) {
  communities = [];
  var method = contract.methods.getCommunityCount();
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityCount error', error);
    } else {
      console.log('getCommunityCount result', result);
      for (var i = 0; i < result; i++) {
        getCommunityFor(i, result, (community) => {
          communities.push(community);
          console.log('callback', communities);
          if (communities.length >= result) {
            res.json(communities);
          }
        });
      }
    }
  })
  .catch(function(error) {
    console.log('getCommunityCount call error', error);
  });
});

/* GET community details */
router.get('/:id', function(req, res, next) {
  for (var i=0; i<communities.length; i++) {
    if (parseInt(communities[i].id) === parseInt(req.params.id)) {
      return res.json(communities[i]);
    }
  }
  res.json({metadata:{ name: "n/a"}});
});

/* POST new community. */
router.post('/create', function(req, res, next) {
  var community = req.body.community;
  console.log("community", JSON.stringify(community));
  if (community.id !== 0) {
    res.json({'error':'community already exists'});
    return next();
  }
  var method = contract.methods.addCommunity(
    community.adminAddress,
    community.isClosed,
    community.domain || '',
    JSON.stringify(community.metadata),
    community.tags || '',
  );
  method.send({from:fromAccount, gas: GAS}, (error, result) => {
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

/* PUT edit community */
router.put('/update', function(req, res, next) {
  var community = req.body.community;
  console.log("community", JSON.stringify(community));
  if (community.id === 0) {
    res.json({'error':'community not saved'});
    return next();
  }
  var method = contract.methods.editCommunity(
    community.id,
    community.addressAdmin,
    community.isClosed,
    community.domain || '',
    JSON.stringify(community.metadata),
    community.tags || '',
  );
  method.send({from:fromAccount, gas: GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
    } else {
      console.log('result', result);
      res.json(community);
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});

/* DELETE remove community. */
router.delete('/:id', function(req, res, next) {
  if (req.params.id === 0) {
    res.redirect('/admin'); // community not saved
  }
  var method = contract.methods.deleteCommunity(req.params.id);
  method.send({from:fromAccount, gas: GAS}, (error, result) => {
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

function getCommunityFor(i, total, callback) {
  var method = contract.methods.communityForId(i+1);
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityFor error', error);
    } else {
      console.log('getCommunityFor result', result);
      var community = {
        id:           result[0],
        adminAddress: result[1],
        isClosed:     result[2],
        domain:       result[3],
        metadata:     JSON.parse(result[4]),
        tags:         result[5]
      };
      callback(community);
    }
  })
  .catch(function(error) {
    console.log('getCommunityFor call error ' + i, error);
  });
}
module.exports = router;
