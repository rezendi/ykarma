const eth = require('./eth');
const util = require('./util');

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

var getAccountFor = async function(id) {
  return eth.getAccountFor(parseInt(req.params.ykid)); 
}

var getCommunityFor = async function(id) {
  return eth.getCommunityFor(parseInt(req.params.ykid)); 
}

async function getAccountForUrl(url) {
  return new Promise(async function(resolve, reject) {
    var method = eth.contract.methods.accountForUrl(url);
    try {
      let result = await method.call();
      var account = eth.getAccountFromResult(result);
      resolve(account);
    } catch(error) {
      util.debug('getAccountForUrl error', error);
      reject(error);
    }
  });
}

async function availableToSpend(id, flavor) {
  var method = eth.contract.methods.availableToSpend(id, flavor);
  try {
    let mySpendable = await method.call();
    return parseInt(mySpendable);
  } catch(error) {
    util.warn("available to spend error", error);
    return 0;
  }
}

async function markAccountActive(account) {
  method = eth.contract.methods.editAccount(account.id, account.userAddress, JSON.stringify(account.metadata), util.BYTES_ZERO);
  return eth.doSend(method, 1, 2);
}

async function replenishAccount(id) {
  method = eth.contract.methods.replenish(id);
  return eth.doSend(method, 1, 2);
}

async function trancheTotalsForId(id) {
  var method = eth.contract.methods.trancheTotalsForIdkid);
  return method.call();
}

async function tranchesGivenForId(id, totalGiven) {
  var method = eth.contract.methods.tranchesForId(id, 1, totalGiven, true);
  return method.call();
}

async function tranchesReceivedForId(id, totalReceived) {
  var method = eth.contract.methods.tranchesForId(req.session.ykid, 1, totalReceived, false);
  return method.call();
}

async function addUrlToExistingAccount(id, url) {
  var method = eth.contract.methods.addUrlToExistingAccount(id, url);
  return eth.doSend(method, 1, 2);
}

async function removeUrlFromExistingAccount(id, url) {
  var method = eth.contract.methods.removeUrlFromExistingAccount(kid, url);
  return eth.doSend(method, 1, 3);
}

async function editAccount(id, userAddress, metadata, flags) {
  var method = eth.contract.methods.editAccount(id, userAddress, metadata, flags);
  return eth.doSend(method);
}

async function deleteAccount(id) {
  var method = eth.contract.methods.deleteAccount(id);
  eth.doSend(method);
}

async function give(id, cid, url, amount, message) {
  var method = eth.contract.methods.give(id, cid, url, amount, message);
  return eth.doSend(method, res, 1, 4);
}