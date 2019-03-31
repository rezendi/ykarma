const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const firebase = require('./firebase');
const eth = require('./eth');
const email = require('./emails');
const util = require('./util');
const rewards = require('./rewards');
const gifs = require('./slack_gifs');

const OPEN_CONVERSATION_URL = process.env.NODE_ENV === "test" ? "http://localhost:3001/api/slack/testOpenConversation" : "https://slack.com/api/conversations.open";
const POST_MESSAGE_URL = process.env.NODE_ENV === "test" ? "http://localhost:3001/api/slack/testPostMessage" : "https://slack.com/api/chat.postMessage";

var fromAccount = null;
eth.getFromAccount().then(address => {
  fromAccount = address;
});

var testData = {};

router.post('/testOpenConversation', function(req, res, next) {
  util.log("opening test conversation with", req.body)
  testData.lastOpenConversation = req.body;
  res.json({success:true, ok:true, channel:{id: "TestChannel"}, body:req.body});
});

router.get('/lastOpenConversation', function(req, res, next) {
  res.json({last:testData.lastOpenConversation});
});

router.post('/testPostMessage', function(req, res, next) {
  util.log("posting test message", req.body)
  testData.lastPostMessage = req.body;
  res.json({success:true, ok:true, body:req.body});
});

router.get('/lastPostMessage', function(req, res, next) {
  res.json({last:testData.lastPostMessage});
});

router.post('/state', function(req, res, next) {
  req.session.slackState = req.body.state;
  util.log("slack state set");
  return res.json({success:true});
});

router.get('/auth', function(req, res, next) {
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
        util.warn("Error creating custom token:", error);
      });
    });
  });
  
});

router.get('/team_auth', function(req, res, next) {
  // check slack state arg
  if (req.session.slackState != req.query.state) {
    return res.json({success:false, error: "State mismatch " + req.session.slackState});
  }
  
  // for now only the admin can add to slack
  if (req.session.email !== process.env.ADMIN_EMAIL) {
    return res.json({"success":false, "error": req.t("Not authorized")});
  }
  if (req.session.ykcid === 0) {
    return res.json({"success":false, "error": "No community"});
  }

  const code = req.query.code;
  const url = `https://slack.com/api/oauth.access?client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&code=${code}&redirect_uri=http%3A%2F%2F${process.env.DOMAIN}%2Fapi%2Fslack%2Fteam_auth`;
  fetch(url).then(function(response) {
    response.json().then((json) => {
      //console.log("response", json);
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

  var showGif = true;
  if (req.body.ssl_check === 1) {
    return res.json({"ok":true});
  }

  var text = req.body.text || '';
  if (text.startsWith(req.t('help'))) {
    let senderUrl = `slack:${req.body.team_id}-${req.body.user_id}`;
    let sender = await getAccountForUrl(senderUrl);
    return res.json({
      "response_type" : "ephemeral",
      "text" : req.t("ykarma_is") + ` ${sender.givable} ` + req.t("karma to give away to others, and") + ` ${sender.spendable} ` + req.t("to_spend_on")
    });
  }
    
  if (text.indexOf('nogif') >= 0) {
    showGif = false;
    text=text.replace(" nogif", "");
    text=text.replace("nogif ", "");
  }

  var vals = await prepareToSendKarma(req, req.body.team_id, req.body.user_id, text);
  if (!vals.error) {
    sendKarma(res, vals, function(error) {
      if (error) {
        return util.warn("sendKarma error", error);
      }
      let body = {
        "response_type" : "in_channel",
        "text": req.t("Sent!") +` ${showGif ? gifs.getGIFFor(vals.amount) : ""}`
      };
      if (!req.body.response_url) {
        return util.warn("Bailing out, no response URL given");
      }
      fetch(req.body.response_url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
        body: JSON.stringify(body),
      }).then(function(response) {
        util.log("Delayed response response", response.status);
      });
    });
  }
  
  res.json({
    "response_type" : vals.error ? "ephemeral" : "in_channel",
    "text" : vals.error ? vals.error : "Sending…"
  });
});


async function prepareToSendKarma(req, team_id, user_id, text) {
  let words = text.split(" ");
  var amount = 0;
  var recipientId = '';
  var message = '';

  for (var i=0; i < words.length; i++) {
    if (amount === 0) {
      var wordAmount = parseInt(words[i], 10);
      if (wordAmount > 0) {
        amount = wordAmount;
        continue;
      }
    }
    if (words[i].startsWith("<@")) {
      if (recipientId === '') {
        // because Slack's docs are misleading
        var endIdx = words[i].indexOf('|') > 0 ? words[i].indexOf('|') : words[i].indexOf('>');
        recipientId = words[i].substring(2, endIdx);
      } else { // someone else named
        var startIdx = words[i].indexOf('|') > 0 ? words[i].indexOf('|') : 2;
        message += `@${words[i].substring(startIdx, words[i].indexOf('>'))} `;
      }
      continue;
    }
    if (recipientId !== '') {
      message += words[i] + ' ';
    }
  }
  
  if (amount === 0) {
    return { error: req.t("Sorry! Valid amount not found") };
  }

  if (recipientId === '' || recipientId === user_id) {
    return { error: req.t("Sorry! Valid recipient not found"), amount:amount };
  }

  // get the sender  
  let senderUrl = `slack:${team_id}-${user_id}`;
  let sender = await getAccountForUrl(senderUrl);
  if (sender.id === 0 || sender.communityId === 0) {
    util.log("failed sender url", senderUrl);
    return { error: req.t("Sorry! Your YKarma account is not set up for sending here"), sender:sender, amount:amount };
  }
  if (sender.givable < amount) {
    util.log("failed sender url", senderUrl);
    util.log("failed sender", sender);
    return { error: req.t("Sorry! You don't have enough YKarma to do that. Your balance is") +` ${sender.givable}`, sender:sender, amount:amount };
  }
  
  let recipientUrl = `slack:${team_id}-${recipientId}`;
  util.warn("recipientUrl is", recipientUrl);
  let recipient = await getAccountForUrl(recipientUrl);
  if (recipient.id === 0 || recipient.communityId === 0) {
    return { error: req.t("Sorry! That YKarma account is not set up for receiving here"), sender:sender,  recipient:recipient, recipientUrl:recipientUrl, amount:amount };
  }
  
  return { sender:sender, recipient:recipient, recipientUrl: recipientUrl, amount:amount, message:message, };
}

function sendKarma(res, vals, callback) {
  util.log(`About to give ${vals.amount} from id ${vals.sender.id} to ${vals.recipientUrl} via Slack`, vals.message);
  var method = eth.contract.methods.give(
    vals.sender.id,
    vals.recipientUrl,
    vals.amount,
    vals.message || ''
  );

  eth.doSend(method, res, 1, 4, callback);
}

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
    });
  });
}

router.post('/event', async function(req, res, next) {

  if (req.body.type==="url_verification") {
    if (req.body.token !== process.env.SLACK_APP_TOKEN) {
      return res.json({success:false, error: "Token mismatch"});
    }
    return res.send(req.body.challenge);
  }

  if (req.body.event.bot_id || req.body.event.subtype==="bot_message") {
    console.log("bot message");
    return res.send({success:false, error:"bot message"});
  }

  var isDM = req.body.event.type==="message.im" || (req.body.event.type==="message" && req.body.event.channel_type==="im");
  if (!isDM) {
    util.warn("unhandled event request", req.body);
    return res.send(JSON.stringify(req.body));
  }

  console.log("message.im", req.body);
  var data = await getFirebaseTeamData(req.body.team_id);
  if (data.error) {
    return res.send({success:false, error:data.error})
  }
  let bot_token = data.vals.bot_token;
  if (!bot_token) {
    console.log("no bot token found");
    return res.send({success:false, error:"no token found"});
  }

  let slackTeamId = req.body.team_id;
  let slackUserId = req.body.event.user;
  let slackChannelId = req.body.event.channel;
  let senderUrl = `slack:${slackTeamId}-${slackUserId}`;
  let sender = await getAccountForUrl(senderUrl);

  // parse text
  var text;
  var body;
  var incoming = req.body.event.text || '';
  var words = incoming.split(' ');
  var purpose = words[0];
  switch (purpose) {
    
    // Get help
    case req.t("help"):
      text = req.t("bot_help");
      break;
    
    // Get balance
    case req.t("balance"):
      let availableMethod = eth.contract.methods.availableToSpend(sender.id, '');
      availableMethod.call(function(error, available) {
        if (error) {
          util.log('getAvailable error', error);
          postToChannel(slackChannelId, req.t("Error getting available-to-spend amount"), bot_token);
        } else {
          // TODO: flavor breakdown?
          postToChannel(slackChannelId, req.t("You currently have a total of") + ` ${available} ` + req.t("to spend… You can get an itemization by flavor with the 'flavors' command"), bot_token);
        }
      });
      text = req.t("You currently have") + ` ${sender.givable} ` + req.t("to give away");
      break;
    
    // Send karma
    case req.t("send"):
      var vals = await prepareToSendKarma(req, slackTeamId, slackUserId, incoming);
      if (vals.error) {
        text = vals.error;
        break;
      }
      sendKarma(res, vals, function(error) {
        if (error) {
          return util.warn("sendKarma error", error);
        }
        postToChannel(slackChannelId, req.t("Sent!"), bot_token);
        var name = sender.id;
        var email = util.getEmailFrom(sender.urls);
        if (sender.metadata && sender.metadata.name) {
          name = sender.metadata.name;
        } else if (email.length > 0) {
          name = email;
        }
        var message = `${name} ` + req.t("has sent you") + ` ${vals.amount} ` + req.t("karma");
        message = vals.message ? message + " " + req.t("with the message") + ` ${vals.message}` : '!';
        openChannelAndPost(vals.recipientUrl, message);
      });
      text = req.t("Sending…");
      break;
    
    // View rewards
    case req.t("rewards"):
      let rewardsMethod = eth.contract.methods.getRewardsCount(sender.communityId, 0);
      text = req.t('Fetching available rewards from the blockchain…');
      rewardsMethod.call(function(error, totalRewards) {
        if (error) {
          util.log('getListOfRewards error', error);
          postToChannel(slackChannelId, req.t("Error getting rewards"), bot_token);
        }
        if (parseInt(totalRewards)===0) {
          util.log("No rewards available");
          postToChannel(slackChannelId, req.t("No rewards available"), bot_token);
        }
        var available = [];
        for (var i = 0; i < parseInt(totalRewards); i++) {
          rewards.getRewardByIndex(0, sender.communityId, i, (reward) => {
            available.push(reward);
            if (available.length >= parseInt(totalRewards)) {
              var retval = available.filter(reward => reward.ownerId===0 && reward.vendorId !== sender.id);
              //TODO: structure more nicely
              text = req.t("Available Rewards") + " " + JSON.stringify(retval);
              postToChannel(slackChannelId, text, bot_token);
            }
          });
        }
      })
      .catch(function(error) {
        text = req.t("Error getting list of rewards") + ` ${error}`;
      });
      break;

    // Make a purchase
    case req.t("purchase"):
      var purchaseId = 0;
      for (var i=1; i < words.length; i++) {
        var wordNum = parseInt(words[i], 10);
        if (wordNum > 0) {
          purchaseId = wordNum;
          break;
        }
      }
      if (purchaseId === 0) {
        text = req.t("Please tell me the ID of the reward you want to purchase");
        break;
      }
      var purchaseMethod = eth.contract.methods.purchase(sender.id, purchaseId);
      rewards.getRewardFor(purchaseId, (reward) => {
        eth.doSend(purchaseMethod, res, 1, 2, (error) => {
          if (error) {
            postToChannel(slackChannelId, req.t("Could not complete purchase, sorry!"), bot_token);
            return util.warn("purchase error", error);
          }
          util.log("purchased", reward);
          // send notifications
          eth.getAccountFor(reward.vendorId, (vendor) => {
            util.log("from", vendor);
            email.sendRewardPurchasedEmail(reward, sender, vendor);
            email.sendRewardSoldEmail(reward, sender, vendor);
            let vendorSlackUrl = util.getSlackUrlFrom(vendor.urls);
            if (vendorSlackUrl) {
              // TODO check they're on the same slack team
              let buyerInfo = `<@${slackUserId}>`;
              openChannelAndPost(vendorSlackUrl, `You just sold the reward ${util.getRewardInfoFrom(reward)} to ${buyerInfo}!`);
            }
          });
        });
      });
      text = req.t("Attempting purchase…");
      break;

    // Flavors
    case req.t("flavors"):
      text = "flavor handling goes here";
      break;
    
    // Unknown command
    default:
      text = req.t("Sorry, I didn't understand you. You can ask for help with 'help'");
  }

  postToChannel(req.body.event.channel, text, bot_token);
  res.json({text:text});
});

function postToChannel(channel, text, bot_token) {
  var body = {
    text: text,
    channel: channel,
    token: bot_token
  };
  fetch(POST_MESSAGE_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${bot_token}`},
    body: JSON.stringify(body),
  }).then(function(response) {
    if (process.env.NODE_ENV !== 'test') {
      util.log("Post to channel response", response.status);
    }
  });
}

async function openChannelAndPost(slackUrl, text) {
  if (!slackUrl || slackUrl.indexOf(":")===-1 || slackUrl.indexOf("-")===-1) {
    return console.log("bad slack URL", slackUrl);
  }

  let teamId = slackUrl.substring(slackUrl.indexOf(":")+1, slackUrl.indexOf("-"));
  let data = await getFirebaseTeamData(teamId);
  if (data.error) {
    return console.log(data.error);
  }
  let bot_token = data.vals.bot_token;
  if (!bot_token) {
    return console.log("no bot token for", slackUrl);
  }

  let userId = slackUrl.substring(slackUrl.indexOf("-")+1);
  var body = {
    users: userId,
    token: bot_token
  };
  var response = await fetch(OPEN_CONVERSATION_URL, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${bot_token}`},
    body: JSON.stringify(body),
  });
  var json = await response.json();
  if (!json.ok) {
    return console.log("conversation open error", json);
  }
  
  postToChannel(json.channel.id, text, bot_token);
}

async function getFirebaseTeamData(team_id) {
  if (process.env.NODE_ENV === "test") {
    return Promise.resolve({ error:null, vals: { "bot_token" : "test" }});
  }
  var docRef = firebase.db.collection('slackTeams').doc(team_id);
  var doc = await docRef.get();
  if (!doc.exists) {
    util.warn("no team data for", team_id);
    return Promise.resolve({ error:"no team data", vals: null });
  }
  return Promise.resolve({error:null, vals:doc.data()});
}

module.exports = {
  router : router,
  openChannelAndPost : openChannelAndPost
};
