const eth = require('./eth');
const util = require('./util');

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

function getAccountFor(id) {
  return eth.getAccountFor(parseInt(id));
}

function getCommunityFor(id) {
  return eth.getCommunityFor(parseInt(id)); 
}

function getAccountForUrl(url) {
  return new Promise(async function(resolve, reject) {
    var method = eth.contract.methods.accountForUrl(url);
    try {
      let result = await method.call();
      var account = eth.getAccountFromResult(result);
      resolve(account);
    } catch(error) {
      util.warn('getAccountForUrl error', error);
      reject(error);
    }
  });
}

function availableToSpend(id, flavor) {
  return new Promise(async function(resolve, reject) {
    var method = eth.contract.methods.availableToSpend(id, flavor);
    try {
      let result = await method.call();
      let mySpendable = parseInt(result);
      resolve(mySpendable);
    } catch(error) {
      util.warn("available to spend error", error);
      reject(error);
    }
  });
}

// TODO: add comparable error handling below? Or should that be top-level? Or only here for calls, not sends? Determine error strategy.

function markAccountActive(account) {
  method = eth.contract.methods.editAccount(account.id, account.userAddress, JSON.stringify(account.metadata), util.BYTES_ZERO);
  return eth.doSend(method, 1, 2);
}

function replenishAccount(id) {
  method = eth.contract.methods.replenish(id);
  return eth.doSend(method, 1, 2);
}

function trancheTotalsForId(id) {
  var method = eth.contract.methods.trancheTotalsForId(id);
  return method.call();
}

function tranchesGivenForId(id, totalGiven) {
  var method = eth.contract.methods.tranchesForId(id, 1, totalGiven, true);
  return method.call();
}

function tranchesReceivedForId(id, totalReceived) {
  var method = eth.contract.methods.tranchesForId(req.session.ykid, 1, totalReceived, false);
  return method.call();
}

function addUrlToExistingAccount(id, url) {
  var method = eth.contract.methods.addUrlToExistingAccount(id, url);
  return eth.doSend(method, 1, 2);
}

function removeUrlFromExistingAccount(id, url) {
  var method = eth.contract.methods.removeUrlFromExistingAccount(id, url);
  return eth.doSend(method, 1, 3);
}

function editAccount(id, userAddress, metadata, flags) {
  var method = eth.contract.methods.editAccount(id, userAddress, metadata, flags);
  return eth.doSend(method);
}

function deleteAccount(id) {
  var method = eth.contract.methods.deleteAccount(id);
  return eth.doSend(method);
}

function give(id, cid, url, amount, message) {
  var method = eth.contract.methods.give(id, cid, url, amount, message);
  return eth.doSend(method, 1, 3);
}

function getAccountFromResult(result) {
  return eth.getAccountFromResult(result);
}

async function getCommunityCount() {
  var method = eth.contract.methods.getCommunityCount();
  return method.call();
}

function getAccountCount(communityId) {
  var method = eth.contract.methods.getAccountCount(communityId);
  return method.call();
}

function addEditCommunity(id, addressAdmin, flags, domain, metadata, tags) {
  var method = eth.contract.methods.addEditCommunity(id, addressAdmin, flags, domain, metadata, tags);
  return eth.doSend(method);
}

function deleteCommunity(id) {
  var method = eth.contract.methods.deleteCommunity(id);
  return eth.doSend(method); 
}

async function accountWithinCommunity(communityId, accountId) {
  var method = eth.contract.methods.accountWithinCommunity(communityId, accountId);
  let result = await method.call();
  return eth.getAccountFromResult(result);
}

function getRewardsCount(id, idType) {
  let method = eth.contract.methods.getRewardsCount(id, idType);
  return method.call(); 
}

function addNewReward(id, cost, quantity, tag, metadata, flags) {
  let method = eth.contract.methods.addNewReward(id, cost, quantity, tag || '', metadata, flags || util.BYTES_ZERO);
  return eth.doSend(method);
}

function editExistingReward(id, cost, quantity, tag, metadata, flags) {
  let method = eth.contract.methods.editExistingReward(id, cost, quantity, tag, metadata, flags);
  return eth.doSend(method);
}

function deleteReward(id) {
  let method = eth.contract.methods.deleteReward(id);
  return eth.doSend(method, 1, 3); 
}

async function rewardForId(id) {
  var method = eth.contract.methods.rewardForId(id);
  let result = await method.call();
  return eth.getRewardFromResult(result);
}

async function rewardByIdx(id, idx, idType) {
  var method = eth.contract.methods.rewardByIdx(id, idx, idType);
  let result = await method.call();
  return eth.getRewardFromResult(result);
}

function purchase(userId, rewardId) {
  var method = eth.contract.methods.purchase(userId, rewardId);
  return eth.doSend(method);
}

module.exports = {
    getAccountFor,
    getCommunityFor,
    getAccountForUrl,
    availableToSpend,
    markAccountActive,
    replenishAccount,
    trancheTotalsForId,
    tranchesGivenForId,
    tranchesReceivedForId,
    addUrlToExistingAccount,
    removeUrlFromExistingAccount,
    editAccount,
    deleteAccount,
    give,
    getAccountFromResult,
    getCommunityCount,
    getAccountCount,
    addEditCommunity,
    deleteCommunity,
    accountWithinCommunity,
    getRewardsCount,
    addNewReward,
    editExistingReward,
    deleteReward,
    rewardForId,
    rewardByIdx,
    purchase
};