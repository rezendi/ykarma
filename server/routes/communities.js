var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();

/* POST community listing. */
router.post('/', function(req, res, next) {
  var community = req.body.community;
  community.id = 1;
  res.json(community);
});

module.exports = router;
