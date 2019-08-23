const express = require('express');
const router = express.Router();
const blockchain = require('./blockchain');
const util = require('./util');
const email = require('./emails');

const ADMIN_ID = 1;

/* GET individual reward */
router.get('/reward/:id', async function(req, res, next) {
  const id = parseInt(req.params.id);
  let reward = await blockchain.rewardForId(id);
  res.json({"success":true, "reward":reward});
});

/* GET rewards available to the current user */
// for now just their community's rewards, if any
router.get('/available', function(req, res, next) {
  util.log("getting rewards available to community", req.session.ykcid);
  if (!req.session.ykcid) {
    return res.json({"success":true, "rewards":[]});
  }
  return getListOfRewards(0, req.session.ykcid, res);
});

/* GET my rewards owned list */
router.get('/my', function(req, res, next) {
  util.log("getting rewards owned by", req.session.ykid);
  if (!req.session.ykid) {
    return res.json({"success":true, "rewards":[]});
  }
  return getListOfRewards(1, req.session.ykid, res);
});

/* GET my rewards vended list */
router.get('/vended', function(req, res, next) {
  util.log("getting rewards vended by", req.session.ykid);
  if (!req.session.ykid) {
    return res.json({"success":true, "rewards":[]});
  }
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

async function getListOfRewards(idType, id, res) {
  try {
    let totalRewards = await blockchain.getRewardsCount(id, idType);
    if (parseInt(totalRewards)===0) {
      return res.json({"success":true, "rewards":[]});
    }
    var promises = [];
    for (var i = 0; i < parseInt(totalRewards); i++) {
      promises.push(blockchain.rewardByIdx(id, i, idType));
    }
    Promise.all(promises).then(function(values) {
      let rewards = values.filter(a => a.id > 0);
      return res.json({"success":true, "rewards":rewards});
    });
  } catch(error) {
    util.log('getListOfRewards error', error);
    return res.json({"success":false, "error": error});
  }
}

/* POST create a reward */
router.post('/create', async function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": req.t("Not logged in")});
  }
  var reward = req.body.reward;
  await blockchain.addNewReward(req.session.ykid, reward.cost, reward.quantity, reward.tag, JSON.stringify(reward.metadata), reward.flags);
  email.sendRewardCreatedEmail(req, reward, req.session.account);
  util.log("reward created", reward);
  return res.json({"success":true, "result": reward});
});

/* PUT update a reward */
router.put('/update', async function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": req.t("Not logged in")});
  }
  var reward = req.body.reward;
  let existing = await blockchain.rewardForId(reward.id);
  if (req.session.ykid !== parseInt(existing.vendorId) && req.session.ykid !== ADMIN_ID) {
    return res.json({"success":false, "error": req.t("Not authorized")});
  }
  //util.log("existing", existing);
  await blockchain.editExistingReward(reward.id, reward.cost || existing.cost, reward.quantity || existing.quantity, reward.tag || existing.tag, JSON.stringify(reward.metadata || existing.metadata), reward.flags || existing.flags);
  return res.json({"success":true, "result": reward});
});

/* DELETE delete a reward */
router.delete('/:id', async function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": req.t("Not logged in")});
  }
  let existing = await blockchain.rewardForId(req.params.id);
  if (req.session.ykid != existing.vendorId && req.session.ykid != ADMIN_ID) {
    return res.json({"success":false, "error": req.t("Not authorized")});
  }
  await blockchain.deleteReward(existing.id);
  return res.json({"success":true});
});

/* POST purchase a reward */
router.post('/purchase', async function(req, res, next) {
  if (!req.session.ykid) {
    return res.json({"success":false, "error": req.t("Not logged in")});
  }
  let reward = await blockchain.rewardForId(req.body.rewardId);
  await blockchain.purchase(req.session.ykid, req.body.rewardId);
  util.log("reward purchased", reward);
  let vendor = await blockchain.getAccountFor(reward.vendorId);
  email.sendRewardPurchasedEmail(req, reward, req.session.account, vendor);
  email.sendRewardSoldEmail(req, reward, req.session.account, vendor);
  let vendorSlackUrl = util.getSlackUrlForSameTeam(vendor.urls, req.session.account.urls);
  if (vendorSlackUrl) {
    var buyerInfo = util.getEmailFrom(req.session.account.urls);
    buyerInfo = buyerInfo ? buyerInfo : buyer.urls;
    slack.openChannelAndPost(vendorSlackUrl, `You just sold the reward ${getRwardInfoFrom(reward)} to ${buyerInfo}!`);
  }
  return res.json({"success":true, "result": reward});
});



module.exports = {
  router: router,
};
