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
  })
  .catch(function(error) {
    console.log('getCommunityCount call error', error);
    res.json({"success":false, "error": error});
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

/* POST new community. */
router.post('/create', function(req, res, next) {
  console.log("session", req.session);
  if (req.session.email !== process.env.ADMIN_EMAIL) {
    return res.json({"success":false, "error": "Not authorized"});
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
    return res.json({"success":false, "error": "Not authorized"});
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
    return res.json({"success":false, "error": "Not authorized"});
  }
  if (req.params.id === 0) {
    return res.json({"success":false, "error": 'Community not saved'});
  }
  var method = eth.contract.methods.deleteCommunity(req.params.id);
  eth.doSend(method,res);
});

module.exports = router;
