var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var eth = require('./eth');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var fromAccount = null;
eth.web3.eth.getAccounts().then((accounts) => {
  fromAccount = accounts[0];
});

/* GET individual reward */
router.get('/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  getRewardFor(id, (reward) => {
    console.log('callback', reward);
    res.json(reward);
  });
  res.json({"success":false});
});

/* GET my rewards owned list */
router.get('/ownedBy/:accountId', function(req, res, next) {
  const ownerId = parseInt(req.params.accountId);
  console.log("getting rewards owned by", ownerId);
  return getListOfRewards(true, ownerId, res);
});

/* GET my rewards vended list */
router.get('/vendedBy/:accountId', function(req, res, next) {
  const vendorId = parseInt(req.params.accountId);
  console.log("getting rewards vended by", vendorId);
  return getListOfRewards(false, vendorId, res);
});

function getListOfRewards(isOwner, accountId, res) {
  var rewards = [];
  const methods = eth.contract.methods;
  var method = isOwner ? methods.getRewardsOwnedCount(accountId) : methods.getRewardsVendedCount(accountId);
  method.call(function(error, totalRewards) {
    if (error) {
      console.log('getListOfRewards error', error);
      return res.json({"success":false, "error": error});
    } else {
      //console.log('getRewardsOwnedCount result', result);
      for (var i = 0; i < result; i++) {
        getRewardByIndex(isOwner, accountId, i, (reward) => {
          rewards.push(reward);
          if (rewards.length >= totalRewards) {
            // console.log('rewards', rewards);
            return res.json({"success":true, "rewards":rewards});
          }
        });
      }
    }
  })
  .catch(function(error) {
    console.log('getListOfRewards call error', error);
  });
}

/* GET my rewards available list */
router.get('/availableTo/:accountId', function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": "Not logged in"});
  }
});

/* POST create a reward */
router.post('/create', function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": "Not logged in"});
  }
});

/* PUT update a reward */
router.put('/update', function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": "Not logged in"});
  }
});

/* DELETE delete a reward */
router.delete('/destroy/:id', function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": "Not logged in"});
  }
});

function getRewardFor(id, callback) {
  var method = eth.contract.methods.rewardForId(id);
  console.log("rewardForId", id);
  method.call(function(error, result) {
    if (error) {
      console.log('getRewardFor error', error);
    } else {
      console.log('getRewardFor result', result);
      var reward = getRewardFromResult(result);
      callback(reward);
    }
  })
  .catch(function(error) {
    console.log('getAccountFor call error ' + id, error);
  });
}

function getRewardByIndex(iwOwner, accountId, idx, callback) {
  const methods = eth.contract.methods;
  var method = isOwner ? methods.rewardByOwner(accountId, idx) : methods.rewardByVendor(accountId, idx);
  method.call(function(error, result) {
    if (error) {
      console.log('getRewardByIndex error', error);
    } else {
      var reward = getRewardFromResult(result);
      callback(reward);
    }
  })
  .catch(function(error) {
    console.log('getRewardByIndex call error ' + id, error);
    callback({});
  });
}

function getRewardFromResult(result) {
  // console.log("result",result);
  return {
    id:       result[0],
    vendorId: result[1],
    ownerId:  result[2],
    cost:     result[3],
    flags:    result[4],
    tags:     result[5],
    metadata: JSON.parse(result[6] || '{}'),
  };
}


module.exports = router;
