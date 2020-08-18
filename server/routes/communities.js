var express = require('express');
var router = express.Router();
var util = require('./util');
const blockchain = require('./blockchain');

const RESERVED_TAGS = "ykarma, test, alpha, beta, gamma, delta, epsilon, omega";

/* GET community list */
router.get('/', async function(req, res, next) {
  var communities = [];
  try {
    let result = await blockchain.getCommunityCount();
    let communityCount = parseInt(result);
    util.log('getCommunityCount result', communityCount);
    if (communityCount===0) {
      return res.json([]);
    }
    for (var i = 0; i < communityCount; i++) {
      let community = await blockchain.getCommunityFor(i+1); 
      communities.push(community);
      //console.log('callback', communities);
      if (communities.length >= communityCount) {
        res.json(communities);
      }
    }
  } catch(error) {
    console.log('getCommunityCount error', error);
    res.json({"success":false, "error": error});
  }
});

/* GET community details */
router.get('/:id', async function(req, res, next) {
  const id = parseInt(req.params.id);
  let community = await blockchain.getCommunityFor(id); 
  util.log('callback', community);
  res.json(community);
});

/* GET account list */
router.get('/:communityId/accounts', async function(req, res, next) {
  const communityId = parseInt(req.params.communityId);
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.ykcid !== communityId) {
    util.log("not allowed to get accounts for", communityId);
    return res.json([]);
  }
  util.log("getting accounts for",communityId);
  var accounts = [];
  try {
    let result = await blockchain.getAccountCount(communityId);
    let accountCount = parseInt(result);
    util.log('getAccountCount result', accountCount);
    if (accountCount===0) {
      return res.json([]);
    }
    for (var i = 0; i < accountCount; i++) {
      getAccountWithinCommunity(communityId, i, (account) => {
        accounts.push(account);
        if (accounts.length >= accountCount) {
          // console.log('accounts', accounts);
          var activeAccounts = accounts.filter(acct => !hasNeverLoggedIn(acct));
          return res.json(activeAccounts);
        }
      });
    }
  } catch(error) {
    util.warn('getAccountCount error', error);
    res.json([]);
  }
});

/* GET community leaderboard */
router.get('/:id/leaderboard', function(req, res, next) {
  const communityId = parseInt(req.params.id);
  getLeaderboard(communityId, (error, leaders) => {
    if (error) {
      util.warn("leaderboard error", error);
      return res.json({"success":false, "error":error});
    }
    return res.json({"success":true, "leaderboard":leaders});
  });
});

/* POST new community. */
router.post('/create', async function(req, res, next) {
  console.log("session", req.session);
  if (req.session.email !== process.env.ADMIN_EMAIL) {
      return res.json({"success":false, "error": req.t("Not authorized")});
  }
  var community = req.body.community;
  community.flags = community.strict ? '0x0000000000000000000000000000000000000000000000000000000000000001' : util.BYTES_ZERO;
  util.log("community", JSON.stringify(community));
  if (community.id !== 0) {
    res.json({'success':false, 'error':'Community already exists'});
  }
  var tags = community.tags || '';
  for (var i = 0; i < RESERVED_TAGS.length; i++) {
    tags = tags.replace(RESERVED_TAGS[i],"");
    tags = tags.replace(",,",",");
  }
  try {
    let result = await blockchain.addEditCommunity(
      0,
      community.addressAdmin || util.ADDRESS_ZERO,
      community.flags || util.BYTES_ZERO,
      community.domain || '',
      JSON.stringify(community.metadata),
      tags,
    );
    res.json({'success':true, 'result':result});
  }
  catch(error) {
    res.json({"success":false, "error": error});
  }
});

/* PUT edit community */
router.put('/update', async function(req, res, next) {
  var community = req.body.community;
  community.flags = community.strict ? '0x0000000000000000000000000000000000000000000000000000000000000001' : BYTES_ZERO;
  if (req.session.email !== process.env.ADMIN_EMAIL) {
      return res.json({"success":false, "error": req.t("Not authorized")});
  }
  util.log("community update", JSON.stringify(community));
  if (community.id === 0) {
    res.json({'success':false, 'error':'community not saved'});
  }
  try {
    let result = await blockchain.addEditCommunity(
    parseInt(community.id),
      community.addressAdmin || util.ADDRESS_ZERO,
      community.flags || util.BYTES_ZERO,
      community.domain || '',
      JSON.stringify(community.metadata),
      community.tags || '',
    );
    res.json({'success':true, 'result':result});
  }
  catch(error) {
    res.json({"success":false, "error": error});
  }
});

/* DELETE remove community. */
router.delete('/:id', async function(req, res, next) {
  if (req.session.email !== process.env.ADMIN_EMAIL) {
      return res.json({"success":false, "error": req.t("Not authorized")});
  }
  if (req.params.id === 0) {
    return res.json({"success":false, "error": 'Community not saved'});
  }
  try {
    let result = await blockchain.deleteCommunity(req.params.id);
    res.json({'success':true, 'result':result});
  }
  catch(error) {
    res.json({"success":false, "error": error});
  }
});

async function getAccountWithinCommunity(communityId, idx, callback) {
  try {
    let account = await blockchain.accountWithinCommunity(communityId, idx);
    // console.log('accountWithinCommunity result', result);
    callback(account);
  } catch(error) {
    util.warn('accountWithinCommunity error', error);
  }
}

function hasNeverLoggedIn(account) {
  let noSlackUrl = !account.urls || account.urls.indexOf("slack:") < 0;
  let noWebLogin = account.flags === '0x0000000000000000000000000000000000000000000000000000000000000001';
  return account.id === 0 || (noWebLogin && noSlackUrl);
}

async function getLeaderboard(communityId, callback) {
  var leaders = [];
  try {
    let result = await blockchain.getAccountCount();
    let accountCount = parseInt(result);
    util.log('getAccountCount result', accountCount);
    for (var i = 0; i < accountCount; i++) {
      getAccountWithinCommunity(communityId, i, async (account) => {
        try {
          let spendable = await blockchain.availableToSpend(account.id, '');
          leaders.push({
            id: account.id,
            metadata: account.metadata || {},
            urls: account.urls || '',
            spendable: parseInt(spendable) || 0,
            filterOut: hasNeverLoggedIn(account),
          });
          if (leaders.length >= accountCount) {
            // console.log('accounts', accounts);
            leaders = leaders.filter(a => !a.filterOut);
            leaders = leaders.sort((a,b) => { return b.spendable - a.spendable });
            let maxLength = leaders.length < 10 ? 3 : leaders.length < 20 ? 5 : 10;
            leaders.length = Math.min(leaders.length, maxLength);
            callback(null, leaders);
          }
        } catch(error) {
          util.warn("spendable error", error);
        }
      });
    }
  } catch(error) {
    util.warn('getAccountCount error', error);
    callback(error, null);
  }
}

module.exports = {
  router: router,
  getLeaderboard: getLeaderboard
};
