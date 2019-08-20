const eth = require('./eth');

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

