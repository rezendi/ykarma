var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var eth = require('./eth');

var fromAccount = null;

eth.web3.eth.getAccounts().then((accounts) => {
  fromAccount = accounts[0];
});

var communities = [];

/* GET community list */
router.get('/', function(req, res, next) {
  communities = [];
  var method = eth.contract.methods.getCommunityCount();
  method.call(function(error, result) {
    if (error) {
      console.log('getCommunityCount error', error);
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
  var community = req.body.community;
  console.log("community", JSON.stringify(community));
  if (community.id !== 0) {
    res.json({'error':'community already exists'});
    return next();
  }
  var method = eth.contract.methods.addCommunity(
    community.adminAddress,
    community.flags || '0x0',
    community.domain || '',
    JSON.stringify(community.metadata),
    community.tags || '',
  );
  method.send({from:fromAccount, gas: eth.GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
    } else {
      console.log('result', result);
      res.json('{success:true}');
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});

/* PUT edit community */
router.put('/update', function(req, res, next) {
  var community = req.body.community;
  console.log("community", JSON.stringify(community));
  if (community.id === 0) {
    res.json({'error':'community not saved'});
    return next();
  }
  var method = eth.contract.methods.editCommunity(
    community.id,
    community.addressAdmin,
    community.isClosed,
    community.domain || '',
    JSON.stringify(community.metadata),
    community.tags || '',
  );
  method.send({from:fromAccount, gas: eth.GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
    } else {
      console.log('result', result);
      res.json(community);
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});

/* DELETE remove community. */
router.delete('/:id', function(req, res, next) {
  if (req.params.id === 0) {
    res.redirect('/admin'); // community not saved
  }
  var method = eth.contract.methods.deleteCommunity(req.params.id);
  method.send({from:fromAccount, gas: eth.GAS}, (error, result) => {
    if (error) {
      console.log('error', error);
    } else {
      console.log('result', result);
      res.json({"success":"true"});
    }
  })
  .catch(function(error) {
    console.log('call error ' + error);
  });
});

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
