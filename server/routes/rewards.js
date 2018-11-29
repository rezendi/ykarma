const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const eth = require('./eth');
const util = require('./util');
const email = require('./emails');

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

const ADMIN_ID = 1;

/* GET individual reward */
router.get('/reward/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  getRewardFor(id, (reward) => {
    //console.log('callback', reward);
    res.json({"success":true, "reward":reward});
  });
});

/* GET rewards available to the current user */
// for now just their community's rewards, if any
router.get('/available', function(req, res, next) {
  util.log("getting rewards available to community", req.session.ykcid);
  return getListOfRewards(0, req.session.ykcid, res);
});

/* GET my rewards owned list */
router.get('/my', function(req, res, next) {
  util.log("getting rewards owned by", req.session.ykid);
  return getListOfRewards(1, req.session.ykid, res);
});

/* GET my rewards vended list */
router.get('/vended', function(req, res, next) {
  util.log("getting rewards vended by", req.session.ykid);
  return getListOfRewards(2, req.session.ykid, res);
});

/* GET rewards owned list */
router.get('/ownedBy/:accountId', function(req, res, next) {
  const ownerId = parseInt(req.params.accountId);
  if (req.session.ykid !== ownerId && req.session.email !== process.env.ADMIN_EMAIL) {
    util.log("not allowed to get rewards owned by", ownerId);
    return res.json({"success":false, "rewards":[]});
  }
  util.log("getting rewards owned by", ownerId);
  return getListOfRewards(1, ownerId, res);
});

/* GET rewards vended list */
router.get('/vendedBy/:accountId', function(req, res, next) {
  const vendorId = parseInt(req.params.accountId);
  util.log("getting rewards vended by", vendorId);
  return getListOfRewards(2, vendorId, res);
});

function getListOfRewards(idType, id, res) {
  var rewards = [];
  const method = eth.contract.methods.getRewardsCount(id, idType);
  method.call(function(error, totalRewards) {
    if (error) {
      util.log('getListOfRewards error', error);
      return res.json({"success":false, "error": error});
    } else {
      // util.log('getListOfRewards result', totalRewards);
      if (parseInt(totalRewards)===0) {
        return res.json({"success":true, "rewards":[]});
      }
      for (var i = 0; i < totalRewards; i++) {
        getRewardByIndex(idType, id, i, (reward) => {
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
    util.warn('getListOfRewards call error', error);
  });
}

/* POST create a reward */
router.post('/create', function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": "Not logged in"});
  }
  var reward = req.body.reward;
  var method = eth.contract.methods.addNewReward(req.session.ykid, reward.cost, reward.quantity, reward.tag || '', JSON.stringify(reward.metadata), reward.flags || '0x00');
  eth.doSend(method, res, 1, 2, () => {
    if (req.session.email) {
      var account = req.session.account || {};
      account.metadata = account.metadata || {};
      account.metadata.emailPrefs = account.metadata.emailPrefs || {};
      // util.log("emailPrefs", account.metadata.emailPrefs);
      if (account.metadata.emailPrefs.rw !== 0) {
        email.sendRewardCreatedEmail(req.session.email, reward);
      }
    }
    util.log("reward created", reward);
    return res.json({"success":true, "result": reward});
  });
});

/* PUT update a reward */
router.put('/update', function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": "Not logged in"});
  }
  var reward = req.body.reward;
  getRewardFor(reward.id, (existing) => {
    if (req.session.ykid !== parseInt(existing.vendorId) && req.session.ykid !== ADMIN_ID) {
      return res.json({"success":false, "error": "Not authorized"});
    }
    //util.log("existing", existing);
    var method = eth.contract.methods.editExistingReward(reward.id, reward.cost || existing.cost, reward.quantity || existing.quantity, reward.tag || existing.tag, JSON.stringify(reward.metadata || existing.metadata), reward.flags || existing.flags);
    eth.doSend(method, res);
  })
});

/* DELETE delete a reward */
router.delete('/:id', function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": "Not logged in"});
  }
  getRewardFor(req.params.id, (existing) => {
    if (req.session.ykid != existing.vendorId && req.session.ykid != ADMIN_ID) {
      return res.json({"success":false, "error": "Not authorized"});
    }
    var method = eth.contract.methods.deleteReward(existing.id);
    eth.doSend(method, res, 1, 3);
  });
});

/* POST purchase a reward */
router.post('/purchase', function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": "Not logged in"});
  }
  var method = eth.contract.methods.purchase(req.session.ykid, req.body.rewardId);
  getRewardFor(req.body.rewardId, (reward) => {
    eth.doSend(method, res, 1, 2, () => {
      util.log("reward purchased", reward);
      if (req.session.email) {
        var account = req.session.account || {};
        account.metadata = account.metadata || {};
        account.metadata.emailPrefs = account.metadata.emailPrefs || {};
        // util.log("emailPrefs", account.metadata.emailPrefs);
        if (account.metadata.emailPrefs.rw !== 0) {
          email.sendRewardPurchasedEmail(req.session.email, reward);
        }
      }
      eth.getAccountFor(reward.vendorId, (vendor) => {
        email.sendRewardSoldEmail(vendor, reward);
        return res.json({"success":true, "result": reward});
      });
    });
  });
});


/**
 * Ethereum methods
 */
function getRewardFor(id, callback) {
  var method = eth.contract.methods.rewardForId(id);
  method.call(function(error, result) {
    if (error) {
      util.warn('getRewardFor error', error);
      callback({});
    } else {
      //console.log('getRewardFor result', result);
      var reward = getRewardFromResult(result);
      callback(reward);
    }
  })
  .catch(function(error) {
    util.warn('getRewardFor call error ' + id, error);
    callback({});
  });
}

function getRewardByIndex(idType, accountId, idx, callback) {
  const method = eth.contract.methods.rewardByIdx(accountId, idx, idType);
  method.call(function(error, result) {
    if (error) {
      util.warn('getRewardByIndex error', error);
    } else {
      var reward = getRewardFromResult(result);
      callback(reward);
    }
  })
  .catch(function(error) {
    util.warn('getRewardByIndex call error ' + id, error);
    callback({});
  });
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



module.exports = router;
