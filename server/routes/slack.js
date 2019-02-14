const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
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
  
  //TODO: get the slack state arg from the login React component, check it here
  const code = req.query.code;
  const url = `https://slack.com/api/oauth.access?client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&code=${code}`;
  fetch(url).then(function(response) {
    const json = response.json();
    if (!json.ok) {
      util.warn("Error completing slack auth");
      return res.redirect('/profile?error=slack');
    }
    const token = json.access_token;
    var iniTeamId = json.team_id;

    // TODO: check whether a community exists for this team
    // if not, redirect to a "sorry, not yet"

    var idUrl = `https://slack.com/api/users.identity?token=${token}`;
    fetch(url)  .then(function(response) {
      const json = response.json();
      if (!json.ok) {
        util.warn("Error getting slack identity");
        return res.redirect('/profile?error=slackid');
      }
      const userId = json.user.id;
      const userName = json.user.name;
      const avatar = json.user.image_72;
      const teamId = json.team_id;
      const teamName = json.team.name;
      const slackUrl = `slack://${teamId}/${userId}`;
      // TODO: store access token keyed to this slackUrl in Firebase
      // TODO: create YK account (if not logged in) or add URL to current one (if logged in)
    });
  });
  
});

module.exports = router;
