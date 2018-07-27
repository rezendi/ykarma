var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var eth = require('./eth');

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

const ADMIN_ID = 1;

/* GET community list */
router.get('/', function(req, res, next) {
  var communities = [];
  var method = eth.contract.methods.getCommunityCount();
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityCount error', error);
      res.json({"success":false, "error": error});
    } else {
      console.log('getCommunityCount result', result);
      for (var i = 0; i < result; i++) {
        getCommunityFor(i+1, (community) => {
          communities.push(community);
          console.log('callback', communities);
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
  getCommunityFor(id, (community) => {
    console.log('callback', community);
    res.json(community);
  });
});

/* POST new community. */
router.post('/create', function(req, res, next) {
  console.log("session", req.session);
  if (parseInt(req.session.ykid) !== ADMIN_ID && req.session.email !== 'jon@rezendi.com') {
    return res.json({"success":false, "error": "Not authorized"});
  }
  var community = req.body.community;
  console.log("community", JSON.stringify(community));
  if (community.id !== 0) {
    res.json({'success':false, 'error':'Community already exists'});
  }
  var method = eth.contract.methods.addNewCommunity(
    community.addressAdmin,
    community.flags || '0x00',
    community.domain || '',
    JSON.stringify(community.metadata),
    community.tags || '',
  );
  eth.doSend(method, res);
});

/* PUT edit community */
router.put('/update', function(req, res, next) {
  var community = req.body.community;
  if (parseInt(req.session.ykid) !== ADMIN_ID && parseInt(req.session.communityAdminId) !== community.id) {
    return res.json({"success":false, "error": "Not authorized"});
  }
  console.log("community", JSON.stringify(community));
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
  if (parseInt(req.session.ykid) !== ADMIN_ID) {
    return res.json({"success":false, "error": "Not authorized"});
  }
  if (req.params.id === 0) {
    return res.json({"success":false, "error": 'Community not saved'});
  }
  var method = eth.contract.methods.deleteCommunity(req.params.id);
  eth.doSend(method,res);
});

/**
 * Ethereum methods
 */

function getCommunityFor(id, callback) {
  var method = eth.contract.methods.communityForId(id);
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityFor error', error);
    } else {
      console.log('getCommunityFor result', result);
      var community = {
        id:           result[0],
        adminAddress: result[1],
        isClosed:     result[2],
        domain:       result[3],
        metadata:     JSON.parse(result[4] || '{}'),
        tags:         result[5],
        accounts:     result[6]
      };
      callback(community);
    }
  })
  .catch(function(error) {
    console.log('getCommunityFor call error ' + id, error);
  });
}

module.exports = router;
