var Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_PROVIDER));
const abi = [{"constant":true,"inputs":[],"name":"loadMode","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"array","type":"uint256[]"},{"name":"val","type":"uint256"}],"name":"uintArrayContains","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"senderIsOracle","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"v","type":"uint256"}],"name":"uintToBytes","outputs":[{"name":"ret","type":"bytes32"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"newOracle","type":"address"}],"name":"addOracle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"i","type":"uint256"}],"name":"uint2str","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"pure","type":"function"},{"inputs":[{"name":"_tranches","type":"address"},{"name":"_accounts","type":"address"},{"name":"_communities","type":"address"},{"name":"_rewards","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"oracleAddress","type":"address"}],"name":"OracleAdded","type":"event"},{"constant":false,"inputs":[{"name":"_address","type":"address"},{"name":"idx","type":"uint256"}],"name":"updateContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"loadModeOff","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_cost","type":"uint256"}],"name":"setRewardCreationCost","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_giverId","type":"uint256"},{"name":"_communityId","type":"uint256"},{"name":"_url","type":"string"},{"name":"_amount","type":"uint256"},{"name":"_message","type":"string"}],"name":"give","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_buyerId","type":"uint256"},{"name":"_rewardId","type":"uint256"},{"name":"_communityId","type":"uint256"}],"name":"purchase","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_accountId","type":"uint256"}],"name":"lastReplenished","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCommunityCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"communityForId","outputs":[{"name":"","type":"uint256"},{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_adminAddress","type":"address"},{"name":"_flags","type":"bytes32"},{"name":"_domain","type":"string"},{"name":"_metadata","type":"string"},{"name":"_tags","type":"string"}],"name":"addEditCommunity","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_accountId","type":"uint256"}],"name":"removeAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"deleteCommunity","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_communityId","type":"uint256"}],"name":"getAccountCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_address","type":"address"}],"name":"setCommunityValidator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_accountId","type":"uint256"}],"name":"replenish","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"recalculateBalances","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"},{"name":"_tag","type":"string"}],"name":"availableToSpend","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"accountForId","outputs":[{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"trancheTotalsForId","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"},{"name":"_page","type":"uint256"},{"name":"_size","type":"uint256"},{"name":"_sender","type":"bool"}],"name":"tranchesForId","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_idx","type":"uint256"}],"name":"accountWithinCommunity","outputs":[{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_url","type":"string"}],"name":"accountForUrl","outputs":[{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"address"},{"name":"","type":"bytes32"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_communityId","type":"uint256"},{"name":"_address","type":"address"},{"name":"_metadata","type":"string"},{"name":"_flags","type":"bytes32"},{"name":"_url","type":"string"}],"name":"addNewAccount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_newAddress","type":"address"},{"name":"_metadata","type":"string"},{"name":"_flags","type":"bytes32"}],"name":"editAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_newUrl","type":"string"}],"name":"addUrlToExistingAccount","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_oldUrl","type":"string"}],"name":"removeUrlFromExistingAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"deleteAccount","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id1","type":"uint256"},{"name":"_id2","type":"uint256"}],"name":"mergeAccounts","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_vendorId","type":"uint256"},{"name":"_cost","type":"uint256"},{"name":"_quantity","type":"uint256"},{"name":"_tag","type":"string"},{"name":"_metadata","type":"string"},{"name":"_flags","type":"bytes32"}],"name":"addNewReward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"}],"name":"rewardForId","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"bytes32"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"},{"name":"_cost","type":"uint256"},{"name":"_quantity","type":"uint256"},{"name":"_tag","type":"string"},{"name":"_metadata","type":"string"},{"name":"_flags","type":"bytes32"}],"name":"editExistingReward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_id","type":"uint256"}],"name":"deleteReward","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"},{"name":"_idType","type":"uint256"}],"name":"getRewardsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_id","type":"uint256"},{"name":"_idx","type":"uint256"},{"name":"_idType","type":"uint256"}],"name":"rewardByIdx","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"uint256"},{"name":"","type":"bytes32"},{"name":"","type":"string"},{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}];
const contract = new web3.eth.Contract(abi, process.env.YKARMA_ADDRESS);
const GAS = "5000000";

const util = require('./util');

var fromAccount;

function delay(t, v) {
   return new Promise(function(resolve) { 
       setTimeout(resolve.bind(null, v), t)
   });
}

const getFromAccount = function() {
   if (fromAccount) {
      return fromAccount;
   }
  return web3.eth.getAccounts().then((ethAccounts) => {
    fromAccount = ethAccounts[0];
    return fromAccount;
  })
  .catch(err => {
    return delay(1000).then(function() {
      return getFromAccount();
    });
  });
};

const getId = function() {
   return web3.eth.net.getId();
}

const doSend = function(method, res, minConfirmations = 1, gasMultiplier = 2, callback = null) {
  var notifying = false;
  method.estimateGas({gas: GAS}, function(estError, gasAmount) {
    if (estError) {
      util.warn('error running', method);
      util.warn('est error', estError);
      if (callback) { return callback(estError); }
      return res.json({'success':false, 'error':estError});
    }
    method.send({from:getFromAccount(), gas: gasAmount * gasMultiplier}).on('error', (error) => {
      util.warn('error running', method);
      util.warn('send error', error);
      if (callback) { return callback(error); }
      return res.json({'success':false, 'error':error});
    })
    .on('confirmation', (number, receipt) => {
      if (number >= minConfirmations && !notifying) {
        notifying = true;
        //console.log('result', receipt);
        if (callback) { return callback(); }
        return res.json({"success":true, "result": receipt});
      }
    });
  })
};

async function getAccountFor(id, callback) {
  var method = contract.methods.accountForId(id);
  util.log("accountForId", id);
  try {
    let result = await method.call();
    var account = getAccountFromResult(result);
    callback(account);
  } catch(error) {
    util.warn('getAccountFor error', error);
  }
}

function getAccountFromResult(result) {
  // console.log("result",result);
  var metadata = {};
  try { metadata = JSON.parse(result[4] || '{}'); } catch(e) { util.warn("bad metadata", result); }
  var given = [];
  try { given = JSON.parse(result[8] || '[]'); } catch(e) { util.warn("bad given", result); }
  var received = [];
  try { received = JSON.parse(result[9] || '[]'); } catch(e) { util.warn("bad received", result); }

  // hack! hack! move to more elegant handling here once we're satisfied the smart contracts work
  var communityIds = [];
  try { communityIds = JSON.parse(result[1] || '[]'); } catch(e) { util.warn("bad communityIds", result); }
  if (communityIds.length===0) {
   communityIds = [0];
  }

  return {
    id:           parseInt(result[0], 10),
    communityIds: communityIds,
    userAddress:  result[2],
    flags:        result[3],
    metadata:     metadata,
    urls:         result[5],
    rewards:      result[6],
    givable:      parseInt(result[7], 10),
    given:        given,
    received:     received,
  };
}

function getRewardFromResult(result) {
  // console.log("result",result);
  return {
    id:       parseInt(result[0], 10),
    vendorId: parseInt(result[1], 10),
    ownerId:  parseInt(result[2], 10),
    cost:     parseInt(result[3], 10),
    quantity: parseInt(result[4], 10),
    flags:    result[5],
    tag:      result[6],
    metadata: JSON.parse(result[7] || '{}'),
  };
}

const getCommunityFor = async function (id, callback) {
  var method = contract.methods.communityForId(id);
  try {
    let result = await method.call();
    var community = {
      id:           parseInt(result[0], 10),
      adminAddress: result[1],
      flags:        result[2],
      domain:       result[3],
      metadata:     JSON.parse(result[4] || '{}'),
      tags:         result[5],
      accounts:     parseInt(result[6], 10)
    };
    callback(community);
  } catch(error) {
   util.warn('getCommunityFor error', error);
  }
};


module.exports = {
    web3:         web3,
    contract:     contract,
    doSend:       doSend,
    GAS:          GAS,
    getId:        getId,
    fromAccount:  fromAccount,
    getFromAccount:        getFromAccount,
    getAccountFor:         getAccountFor,
    getAccountFromResult:  getAccountFromResult,
    getRewardFromResult:   getRewardFromResult,
    getCommunityFor:       getCommunityFor,
};