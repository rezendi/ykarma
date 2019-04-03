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
    var method = eth.contract.methods.addNewCommunity(0, 0x0, 'ykarma.com', '{"name":"Alpha Karma"}', 'alpha');
    eth.doSend(method, res);
  });
});

/* GET community list */
router.get('/', function(req, res, next) {
  var communities = [];
  var method = eth.contract.methods.getCommunityCount();
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityCount error', error);
      res.json({"success":false, "error": error});
    } else {
      util.log('getCommunityCount result', result);
      for (var i = 0; i < result; i++) {
        eth.getCommunityFor(i+1, (community) => {
          communities.push(community);
          //console.log('callback', communities);
          if (communities.length >= result) {
            res.json(communities);
          }
        });
      }
    }
  });
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
router.get('/:communityId/accounts', function(req, res, next) {
  const communityId = parseInt(req.params.communityId);
  if (req.session.email !== process.env.ADMIN_EMAIL && req.session.ykcid !== communityId) {
    util.log("not allowed to get accounts for", communityId);
    return res.json([]);
  }
  util.log("getting accounts for",communityId);
  var accounts = [];
  var method = eth.contract.methods.getAccountCount(communityId);
  method.call(function(error, result) {
    if (error) {
      util.warn('getAccountCount error', error);
      res.json([]);
    } else {
      util.log('getAccountCount result', result);
      for (var i = 0; i < result; i++) {
        getAccountWithinCommunity(communityId, i, (account) => {
          accounts.push(account);
          if (accounts.length >= result) {
            // console.log('accounts', accounts);
            var activeAccounts = accounts.filter(acct => !hasNeverLoggedIn(acct));
            return res.json(activeAccounts);
          }
        });
      }
    }
  });
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
  community.flags = community.strict ? '0x0000000000000000000000000000000000000000000000000000000000000001' : '0x00';
  util.log("community", JSON.stringify(community));
  if (community.id !== 0) {
    res.json({'success':false, 'error':'Community already exists'});
  }
  var tags = community.tags || '';
  for (var i = 0; i < RESERVED_TAGS.length; i++) {
    tags = tags.replace(RESERVED_TAGS[i],"");
    tags = tags.replace(",,",",");
  }
  var method = eth.contract.methods.addNewCommunity(
    community.addressAdmin,
    community.flags || '0x00',
    community.domain || '',
    JSON.stringify(community.metadata),
    tags,
  );
  eth.doSend(method, res);
});

/* PUT edit community */
router.put('/update', function(req, res, next) {
  var community = req.body.community;
  community.flags = community.strict ? '0x0000000000000000000000000000000000000000000000000000000000000001' : '0x00';
  if (req.session.email !== process.env.ADMIN_EMAIL && parseInt(req.session.communityAdminId) !== community.id) {
      return res.json({"success":false, "error": req.t("Not authorized")});
  }
  util.log("community update", JSON.stringify(community));
  if (community.id === 0) {
    res.json({'success':false, 'error':'community not saved'});
  }
  var method = eth.contract.methods.editExistingCommunity(
    parseInt(community.id),
    community.addressAdmin || 0,
    community.flags || '0x00',
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

function getAccountWithinCommunity(communityId, idx, callback) {
  var method = eth.contract.methods.accountWithinCommunity(communityId, idx);
  // console.log("accountWithinCommunity idx "+idx, communityId);
  method.call(function(error, result) {
    if (error) {
      util.warn('accountWithinCommunity error', error);
    } else {
      // console.log('accountWithinCommunity result', result);
      var account = eth.getAccountFromResult(result);
      callback(account);
    }
  });
}

function hasNeverLoggedIn(account) {
  let noSlackUrl = !util.getSlackUrlFrom(account.urls);
  let noWebLogin = account.flags === '0x0000000000000000000000000000000000000000000000000000000000000001';
  return account.id === 0 || (noWebLogin && noSlackUrl);
}

function getLeaderboard(communityId, callback) {
  var leaders = [];
  var method = eth.contract.methods.getAccountCount(communityId);
  method.call(function(error, accountCount) {
    if (error) {
      util.warn('getAccountCount error', error);
      callback(error, null);
    } else {
      util.log('getAccountCount result', accountCount);
      for (var i = 0; i < accountCount; i++) {
        getAccountWithinCommunity(communityId, i, (account) => {
          method = eth.contract.methods.availableToSpend(account.id, '');
          method.call(function(error, spendable) {
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
          });
        });
      }
    }
  });
}

module.exports = {
  router: router,
  getLeaderboard: getLeaderboard
};
