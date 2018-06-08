var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var Web3 = require('web3');

var communities = [];

/* GET community list. */
router.get('/', function(req, res, next) {
  list_communities( function(err, val) {
    if (err) {
      // res.json( {"err": err} );
    } else {
      // res.json( {"res": val} );
    }
  });  
  res.json(communities);
});

function list_communities(callback) {
  const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545/"));
  const abi = [{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":true,"inputs":[],"name":"getCommunityCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"communityForId","outputs":[{"components":[{"name":"id","type":"uint256"},{"name":"adminAddress","type":"address"},{"name":"isClosed","type":"bool"},{"name":"domain","type":"string"},{"name":"metadata","type":"string"},{"name":"tags","type":"string"},{"name":"accountIds","type":"uint256[]"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"components":[{"name":"id","type":"uint256"},{"name":"adminAddress","type":"address"},{"name":"isClosed","type":"bool"},{"name":"domain","type":"string"},{"name":"metadata","type":"string"},{"name":"tags","type":"string"},{"name":"accountIds","type":"uint256[]"}],"name":"community","type":"tuple"}],"name":"addCommunity","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_accountId","type":"uint256"}],"name":"addAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_tags","type":"string"}],"name":"setTags","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
  const contract = new web3.eth.Contract(abi, "0x9a53823a53e6323962a5ee70f76fd6e75d2f708e");
  var method = contract.methods.getCommunityCount();
  if (method === undefined) {
    callback("No method", null);
  }
  method.call(function(error, result) {
    if (error) {
      console.log('error', error);
      callback(error, null);
    } else {
      console.log('result', result);
      callback(null, result);
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
    callback(error, null);
  });
};

/* GET community details. */
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
  if (community.id == 0) {
    community.id = communities.length + 1;
    communities.push(community);
  }
  res.json(community);
});

/* PUT edit community. */
router.put('/update', function(req, res, next) {
  var community = req.body.community;
  for (var i=0; i<communities.length; i++) {
    if (parseInt(communities[i].id) === parseInt(community.id)) {
      communities[i] = community;
      return res.json(communities[i]);
    }
  }
  res.json({metadata:{ name: "n/a"}});
});

module.exports = router;
