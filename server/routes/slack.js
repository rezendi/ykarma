const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const eth = require('./eth');
const util = require('./util');

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

// For now, just send mock Slack response with GIF
router.post('/yk', function(req, res, next) {
  console.log("got post", req.body);
  const text          = req.body.text;
  const response_url  = req.body.response_url;
  const user_id       = req.body.user_id;
  const team_id       = req.body.team_id;
  
  // for occasional pings from Slack
  const ssl_check     = req.body.ssl_check;
  const token         = req.body.token;
  
  // check to see whether there's a sufficient balance
  var sufficientBalance = true;
  
  // if not, send back an error
  if (!sufficientBalance) {
    return res.json({
    "response_type" : "ephemeral",
      "text":"Sorry! You don't have enough YKarma to do that"
    });
  }
  
  // if so, send back a GIF
  return res.json({
    "response_type" : "in_channel",
    "text": "Sent! https://giphy.com/gifs/the-wachowskis-MFje9gRTYIL28",
  });
});

router.get('/auth', function(req, res, next) {
  console.log("in slack auth");
  res.json({'hello':'world'});
});

module.exports = router;
