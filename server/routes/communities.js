var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();

var communities = [];

/* GET community list. */
router.get('/', function(req, res, next) {
  res.json(communities);
});

/* GET community details. */
router.get('/:id', function(req, res, next) {
  for (var i=0; i<communities.length; i++) {
    if (parseInt(communities[i].id) === parseInt(req.params.id)) {
      return res.json(communities[i]);
    }
  }
  res.json({metadata:{ name: "n/a"}});
});

/* POST new community. */
router.post('/create', function(req, res, next) {
  var community = req.body.community;
  if (community.id == 0) {
    community.id = communities.length + 1;
    communities.push(community);
  }
  res.json(community);
});

/* PUT edit community. */
router.put('/update', function(req, res, next) {
  var community = req.body.community;
  for (var i=0; i<communities.length; i++) {
    if (parseInt(communities[i].id) === parseInt(community.id)) {
      communities[i] = community;
      return res.json(communities[i]);
    }
  }
  res.json({metadata:{ name: "n/a"}});
});

module.exports = router;
