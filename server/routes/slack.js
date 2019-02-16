const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const firebase = require('./firebase');
const eth = require('./eth');
const util = require('./util');

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
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
      //console.log("response", json);
      if (!json.ok) {
        util.warn("Error completing slack auth");
        return res.redirect('/profile?error=slack');
      }
      // get vals, store to Firestore
      const userId = json.user.id;
      const teamId = json.team.id;
      const uniqueId = `#${teamId}-${userId}`;
      const userVals = {
        'userId': userId,
        'name'  : json.user.name,
        'email' : json.user.email,
        'avatar': json.user.image_72,
        'token' : json.access_token,
        'teamId': teamId,
        'scope' : json.scope,
      };
      //console.log("userVals", userVals);
      var docRef = firebase.db.collection('slackUsers').doc(uniqueId);
      docRef.set(userVals);
      docRef = firebase.db.collection('slackTeams').doc(teamId);
      docRef.set({
        'id'      : teamId,
        'name'    : json.team.name,
        'domain'  : json.team.domain,
      }, { merge: true });

      // custom token per https://firebase.google.com/docs/auth/admin/create-custom-tokens#create_custom_tokens_using_the_firebase_admin_sdk
      var additionalClaims = {
        email       : json.user.email,
        displayName : json.user.name,
        slack_id    : uniqueId
      };
      firebase.admin.auth().createCustomToken(uniqueId, additionalClaims)
      .then(function(customToken) {
        firebase.admin.auth().updateUser(uniqueId, {
          displayName: json.user.name,
        });
        res.redirect('/finishSignIn?customToken='+customToken);
      })
      .catch(function(error) {
        console.log("Error creating custom token:", error);
      });
    });
  });
  
});

router.get('/team_auth', function(req, res, next) {
  util.log("in slack team auth");
  
  // check slack state arg
  if (req.session.slackState != req.query.state) {
    return res.json({success:false, error: "State mismatch " + req.session.slackState});
  }
  
  // for now only the admin can add to slack
  if (req.session.email !== process.env.ADMIN_EMAIL) {
    return res.json({"success":false, "error": "Not authorized"});
  }
  if (req.session.ykcid === 0) {
    return res.json({"success":false, "error": "No community"});
  }

  const code = req.query.code;
  const url = `https://slack.com/api/oauth.access?client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&code=${code}&redirect_uri=http%3A%2F%2F${process.env.DOMAIN}%2Fapi%2Fslack%2Fteam_auth`;
  fetch(url).then(function(response) {
    response.json().then((json) => {
      console.log("response", json);
      if (!json.ok) {
        util.warn("Error completing slack team auth");
        return res.redirect('/profile?error=slack_team');
      }
      // get vals, store to Firestore
      const teamId = json.team_id;
      var teamVals = {
        'id'        : teamId,
        'token'     : json.access_token,
        'scope'     : json.scope,
        'name'      : json.team_name,
        'userId'    : json.user_id,
        'bot_id'    : json.bot ? json.bot.bot_user_id : null,
        'bot_token' : json.bot ? json.bot.bot_access_token : null,
      };
      docRef = firebase.db.collection('slackTeams').doc(teamId);
      docRef.set(teamVals, { merge: true });
      
      // update community metadata
        eth.getCommunityFor(req.session.ykcid, (community) => {
          if (!community.metadata) {
            util.warn("Couldn't get community for id", req.session.ykcid);
            return res.redirect('/profile?error=slack_team_chain');
          }
          var slackTeams = community.metadata.slackTeams || [];
          if (slackTeams.includes(teamId)) {
            util.log("Team already added");
            return res.redirect('/admin?slackAddSuccess=true'); // TODO: better redirect
          }
          slackTeams.push(teamId);
          community.metadata.slackTeams = slackTeams;
          var method = eth.contract.methods.editExistingCommunity(
            parseInt(community.id),
            community.addressAdmin || 0,
            community.flags || '0x00',
            community.domain || '',
            JSON.stringify(community.metadata),
            community.tags || '',
          );
          eth.doSend(method, res, 1, 2, () => {
            // from here the cron job will take care of adding the users' accounts
            res.redirect('/admin?slackAddSuccess=true'); // TODO: better redirect
          });
        });

    });
  });
});

// For now, just send mock Slack response with GIF
router.post('/yk', async function(req, res, next) {
  util.warn("got post", req.body);
  
  if (req.body.ssl_check === 1) {
    return res.json({"ok":true});
  }

  const user_id       = req.body.user_id;
  const team_id       = req.body.team_id;
  const text          = req.body.text;
  const response_url  = req.body.response_url;
  
  const words = text.split(" ");
  var amount = 0;
  var recipientId = '';
  var message = '';
  
  for (var i=0; i < words.length; i++) {
    if (amount === 0) {
      var wordAmount = parseInt(words[i], 10);
      if (wordAmount > 0) {
        amount = wordAmount;
      }
    }
    if (words[i].startsWith("<@")) {
      if (recipientId === '') {
        recipientId = words[i].replace("<@","").replace(">","");
      }
    } else {
      if (recipientId !== '') {
        message += words[i] + ' ';
      }
    }
  }
  
  if (amount === 0) {
    return res.json({
      "response_type" : "ephemeral",
      "text" : "Sorry! Valid amount not found."
    });
  }

  if (recipientId === '' || recipientId === user_id) {
    return res.json({
      "response_type" : "ephemeral",
      "text" : "Sorry! Valid recipient not found."
    });
  }

  // get the sender  
  const senderUrl = `slack:${team_id}-${user_id}`;
  const sender = await getAccountForUrl(senderUrl);
  if (sender.id === 0 || sender.communityId === 0) {
    return res.json({
      "response_type" : "ephemeral",
      "text" : "Sorry! Your YKarma account is not set up for sending here"
    });
  }
  if (sender.givable < amount) {
    return res.json({
      "response_type" : "ephemeral",
      "text" : "Sorry! You don't have enough YKarma to do that. Your balance is " + givable
    });
  }
  
  const recipientUrl = `slack:${team_id}-${recipientId}`;
  const recipient = await getAccountForUrl(recipientUrl);
  if (recipient.id === 0 || recipient.communityId === 0) {
    return res.json({
      "response_type" : "ephemeral",
      "text" : "Sorry! That YKarma account is not set up for receiving here"
    });
  }
  
  //OK, let's go ahead and do the give
  util.warn(`About to give ${amount} from id ${sender.id} to ${recipient.id} via Slack`, message);
  var method = eth.contract.methods.give(
    sender.id,
    recipientUrl,
    amount,
    message || ''
  );

  eth.doSend(method, res, 1, 4, function() {
    // send back a GIF via the response_url
    const body = {
      "response_type" : "in_channel",
      "text": "Sent! " + getGIFFor(amount)
    };
    util.log("response body", body);
    fetch(response_url, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify(body),
    }).then(function(response) {
      util.log("Delayed response response", response.status);
    });
  });

  return res.json({
    "response_type" : "in_channel",
    "text": "Stacking a block on the chain..."
  });
});


function getAccountForUrl(url) {
  return new Promise(function(resolve, reject) {
    var method = eth.contract.methods.accountForUrl(url);
    method.call(function(error, result) {
      if (error) {
        util.warn('getAccountForUrl error', error);
      } else {
        util.debug('getAccountForUrl result', result);
        var account = eth.getAccountFromResult(result);
        resolve(account);
      }
    })
    .catch(function(error) {
      util.warn('getAccountForUrl call error ' + url, error);
      reject(error);
    });
  });
}

function getGIFFor(amount) {
  console.log("getting GIF for", amount);
  return "https://giphy.com/gifs/the-wachowskis-MFje9gRTYIL28";
}

module.exports = router;
