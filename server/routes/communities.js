var express = require('express');
var router = express.Router();
var eth = require('./eth');
var util = require('./util');

const RESERVED_TAGS = "ykarma, test, alpha, beta, gamma, delta, epsilon, omega";

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

// GET set up
router.get('/setup', function(req, res, next) {
  eth.getCommunityFor(1, (community) => {
    if (community.id !== 0) {
      return res.json({"success":true, 'message':'Redundant'});
    }
    var method = eth.contract.methods.addEditCommunity(0, util.ADDRESS_ZERO, util.BYTES_ZERO, 'ykarma.com', '{"name":"Alpha Karma"}', 'alpha');
    eth.doSend(method, res);
  });
});

/* GET community list */
router.get('/', function(req, res, next) {
  var communities = [];
  var method = eth.contract.methods.getCommunityCount();
  try {
    let communityCount = method.call();
    util.log('getCommunityCount result', communityCount);
    if (communityCount===0) {
      return res.json([]);
    }
    for (var i = 0; i < communityCount; i++) {
      eth.getCommunityFor(i+1, (community) => {
        communities.push(community);
        //console.log('callback', communities);
        if (communities.length >= communityCount) {
          res.json(communities);
        }
      });
    }
  } catch(error) {
    console.log('getCommunityCount error', error);
    res.json({"success":false, "error": error});
  }
});

/* GET community details */
router.get('/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  eth.getCommunityFor(id, (community) => {
    util.log('callback', community);
    res.json(community);
  });
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
  var method = eth.contract.methods.getAccountCount(communityId);
  try {
    let result = await method.call();
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
router.post('/create', function(req, res, next) {
  console.log("session", req.session);
  if (req.session.email !== process.env.ADMIN_EMAIL) {
      return res.json({"success":false, "error": req.t("Not authorized")});
  }
  var community = req.body.community;
  community.flags = community.strict ? '0x0000000000000000000000000000000000000000000000000000000000000001' : BYTES_ZERO;
  util.log("community", JSON.stringify(community));
  if (community.id !== 0) {
    res.json({'success':false, 'error':'Community already exists'});
  }
  var tags = community.tags || '';
  for (var i = 0; i < RESERVED_TAGS.length; i++) {
    tags = tags.replace(RESERVED_TAGS[i],"");
    tags = tags.replace(",,",",");
  }
  var method = eth.contract.methods.addEditCommunity(
    0,
    community.addressAdmin || util.ADDRESS_ZERO,
    community.flags || util.BYTES_ZERO,
    community.domain || '',
    JSON.stringify(community.metadata),
    tags,
  );
  eth.doSend(method, res);
});

/* PUT edit community */
router.put('/update', function(req, res, next) {
  var community = req.body.community;
  community.flags = community.strict ? '0x0000000000000000000000000000000000000000000000000000000000000001' : BYTES_ZERO;
  if (req.session.email !== process.env.ADMIN_EMAIL && parseInt(req.session.communityAdminId) !== community.id) {
      return res.json({"success":false, "error": req.t("Not authorized")});
  }
  util.log("community update", JSON.stringify(community));
  if (community.id === 0) {
    res.json({'success':false, 'error':'community not saved'});
  }
  var method = eth.contract.methods.addEditCommunity(
    parseInt(community.id),
    community.addressAdmin || util.ADDRESS_ZERO,
    community.flags || util.BYTES_ZERO,
    community.domain || '',
    JSON.stringify(community.metadata),
    community.tags || '',
  );
  eth.doSend(method, res);
});

/* DELETE remove community. */
router.delete('/:id', function(req, res, next) {
  if (req.session.email !== process.env.ADMIN_EMAIL) {
      return res.json({"success":false, "error": req.t("Not authorized")});
  }
  if (req.params.id === 0) {
    return res.json({"success":false, "error": 'Community not saved'});
  }
  var method = eth.contract.methods.deleteCommunity(req.params.id);
  eth.doSend(method,res);
});

async function getAccountWithinCommunity(communityId, idx, callback) {
  var method = eth.contract.methods.accountWithinCommunity(communityId, idx);
  try {
    let result = method.call();
    // console.log('accountWithinCommunity result', result);
    var account = eth.getAccountFromResult(result);
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
  var method = eth.contract.methods.getAccountCount(communityId);
  try {
    let result = await method.call();
    let accountCount = parseInt(result);
    util.log('getAccountCount result', accountCount);
    for (var i = 0; i < accountCount; i++) {
      getAccountWithinCommunity(communityId, i, async (account) => {
        method = eth.contract.methods.availableToSpend(account.id, '');
        try {
          let spendable = await method.call();
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
