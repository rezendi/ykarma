const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const bodyParser = require("body-parser");
const firebase = require('./firebase');
const eth = require('./eth');
const util = require('./util');

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

// For now, just send mock Slack response with GIF
router.post('/yk', function(req, res, next) {
  util.log("got post", req.body);
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

router.post('/state', function(req, res, next) {
  req.session.slackState = req.body.state;
  console.log("slack state set");
  return res.json({success:true});
});

router.get('/auth', function(req, res, next) {
  util.log("in slack auth");
  
  if (req.session.slackState != req.query.state) {
    return res.json({success:false, error: "State mismatch " + req.session.slackState});
  }

  const code = req.query.code;
  const url = `https://slack.com/api/oauth.access?client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&code=${code}`;
  fetch(url).then(function(response) {
    response.json().then((json) => {
      console.log("response", json);
      if (!json.ok) {
        util.warn("Error completing slack auth");
        return res.redirect('/profile?error=slack');
      }
      // get vals, store to Firestore
      const token = json.access_token;
      const userId = json.user.id;
      const teamId = json.team.id;
      const userVals = {
        'id'    : userId,
        'name'  : json.user.name,
        'email' : json.user.email,
        'avatar': json.user.image_72,
        'token' : token,
        'teamId': teamId,
      };
      console.log("userVals", userVals);
      var docRef = firebase.db.collection('slackUsers').doc(userId);
      docRef.set(userVals);
      docRef = firebase.db.collection('slackTeams').doc(teamId);
      docRef.set({
        'id'      : teamId,
        'name'    : json.team.name,
        'domain'  : json.team.domain,
      });

      // custom token per https://firebase.google.com/docs/auth/admin/create-custom-tokens#create_custom_tokens_using_the_firebase_admin_sdk
      var additionalClaims = {
        email       : json.user.email,
        displayName : json.user.name,
        slack_id    : userId
      };
      firebase.admin.auth().createCustomToken(userId, additionalClaims)
      .then(function(customToken) {
        res.redirect('http://localhost:3000/finishSignIn?customToken='+customToken);
      })
      .catch(function(error) {
        console.log("Error creating custom token:", error);
      });
    });
  });
  
});

function getAccountForUrl(url, callback) {
  var method = eth.contract.methods.accountForUrl(url);
  // util.log("method", method);
  method.call(function(error, result) {
    if (error) {
      util.warn('getAccountForUrl error', error);
    } else {
      util.debug('getAccountForUrl result', result);
      var account = eth.getAccountFromResult(result);
      callback(account);
    }
  })
  .catch(function(error) {
    util.warn('getAccountForUrl call error ' + url, error);
  });
}


module.exports = router;
