const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const firebase = require('./firebase');
const emails = require('./emails');

const blockchain = require('./blockchain');
const util = require('./util');
const communities = require('./communities');
const gifs = require('./slack_gifs');

const OPEN_CONVERSATION_URL = process.env.NODE_ENV === "test" ? "http://localhost:3001/api/slack/testOpenConversation" : "https://slack.com/api/conversations.open";
const POST_MESSAGE_URL = process.env.NODE_ENV === "test" ? "http://localhost:3001/api/slack/testPostMessage" : "https://slack.com/api/chat.postMessage";

// verification

const crypto = require('crypto');
const qs = require('qs');
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

router.use('*', (req, res, next) => {
   if (process.env.NODE_ENV==="test") {
      return next();
   }
   var slackSignature = req.headers['x-slack-signature'];
   var requestBody = qs.stringify(req.body, {format : 'RFC1738'});
   var timestamp = req.headers['x-slack-request-timestamp'];
   var time = Math.floor(new Date().getTime()/1000);
   if (Math.abs(time - timestamp) > 300) {
      util.warn("ignoring request");
      return res.status(400).send('Ignore this request.');
   }
   if (!slackSigningSecret) {
      util.warn("Empty signing secret");
      return res.status(400).send('Slack signing secret is empty.');
   }
   var sigBasestring = 'v0:' + timestamp + ':' + requestBody;
   var mySignature = 'v0=' + 
                  crypto.createHmac('sha256', slackSigningSecret)
                        .update(sigBasestring, 'utf8')
                        .digest('hex');
   if (crypto.timingSafeEqual(
              Buffer.from(mySignature, 'utf8'),
              Buffer.from(slackSignature, 'utf8'))
      ) {
         next();
   } else {
      util.warn("verification failed", slackSignature);
      next(); // for now
      //return res.status(400).send('Verification failed');
   }
});

var testData = {};

router.get('/testReset/:teamId', function(req, res, next) {
   testData.teamId = {messages:[], conversations: []};
   res.json({'ok':true});
});

router.post('/testOpenConversation', function(req, res, next) {
  let teamId = req.body.team_id  || testData.lastTeamId || req.body.channel;
  testData.teamId = testData.teamId ? testData.teamId : {messages:[], conversations: []};
  util.log(`opening team ${teamId} idx ${testData.teamId.conversations.length} test conversation`, req.body);
  testData.teamId.conversations.push(req.body);
  testData.lastTeamId = teamId;
  res.json({success:true, ok:true, channel:{id: "TestChannel"}, body:req.body});
});

router.get('/testConversation/:teamId/:index', function(req, res, next) {
   let teamId = req.params.teamId || testData.lastTeamId;
   testData.teamId = testData.teamId ? testData.teamId : {messages:[], conversations: []};
   let idx = parseInt(req.params.index);
   if (testData.teamId.conversations.length > idx) {
      return res.json({val:testData.teamId.conversations[idx]});
   }
   util.warn("conversations length is", testData.teamId.conversations.length);
   testData.lastTeamId = teamId;
   res.json({val:''});
});

router.post('/testPostMessage', function(req, res, next) {
  let teamId = req.body.team_id || testData.lastTeamId || req.body.channel;
  console.log("body", req.body);
  testData.teamId = testData.teamId ? testData.teamId : {messages:[], conversations: []};
  util.log(`posting team ${teamId} idx ${testData.teamId.messages.length} test message`, req.body);
  testData.teamId.messages.push(req.body);
  testData.lastTeamId = teamId;
  res.json({success:true, ok:true, body:req.body});
});

router.get('/testMessage/:teamId/:index', function(req, res, next) {
   let teamId = req.params.teamId || testData.lastTeamId;
   testData.teamId = testData.teamId ? testData.teamId : {messages:[], conversations: []};
   let idx = parseInt(req.params.index);
   if (testData.teamId.messages.length > idx) {
      return res.json({val:testData.teamId.messages[idx]});
   }
   util.warn("messages length is", testData.teamId.messages.length);
   testData.lastTeamId = teamId;
   res.json({val:''});
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

router.get('/team_auth', async function(req, res, next) {
  // check slack state arg
   if (req.session.slackState != req.query.state) {
      return res.json({success:false, error: "State mismatch " + req.session.slackState});
   }
  
   if (req.session.ykcid === 0) {
     return res.json({"success":false, "error": "No community"});
   }
   let community = await blockchain.getCommunityFor(req.session.ykcid);
   // for now only the admin can add to slack
   let authorizedEmail = community.metadata.adminEmail;
   let userAuthorized = req.session.email === process.env.ADMIN_EMAIL || (authorizedEmail && req.session.email===authorizedEmail);
   if (!userAuthorized) {
      return res.json({"success":false, "error": req.t("Not authorized")});
   }
 
   const code = req.query.code;
   const url = `https://slack.com/api/oauth.access?client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&code=${code}&redirect_uri=http%3A%2F%2F${process.env.DOMAIN}%2Fapi%2Fslack%2Fteam_auth`;
   fetch(url).then(async function(response) {
      response.json().then(async (json) => {
        //console.log("response", json);
        if (!json.ok) {
         util.warn("Error completing slack team auth");
         return res.redirect('/profile?error=slack_team');
        }
 
        // get vals, store to Firestore
        const teamId = json.team_id;
        var teamVals = {
         'id'          : teamId,
         'token'       : json.access_token,
         'scope'       : json.scope,
         'name'        : json.team_name,
         'userId'      : json.user_id,
         'bot_id'      : json.bot ? json.bot.bot_user_id : null,
         'bot_token'   : json.bot ? json.bot.bot_access_token : null,
         'communityId' : req.session.ykcid,
        };
        docRef = firebase.db.collection('slackTeams').doc(teamId);
        docRef.set(teamVals, { merge: true });
       
       // update community metadata
        if (!community.metadata) {
          util.warn("Couldn't get community for id", req.session.ykcid);
          return res.redirect('/profile?error=slack_team_chain');
        }
        var slackTeams = community.metadata.slackTeams || [];
        if (slackTeams.includes(teamId)) {
          util.log("Team already added");
          return res.redirect('/admin?slackAddSuccess=true');
        }
        slackTeams.push(teamId);
        community.metadata.slackTeams = slackTeams;
        await blockchain.addEditCommunity(
          parseInt(community.id),
          community.addressAdmin || util.ADDRESS_ZERO,
          community.flags || util.BYTES_ZERO,
          community.domain || '',
          JSON.stringify(community.metadata),
          community.tags || '',
        );
        // from here the cron job will take care of adding the users' accounts
        res.redirect('/admin?slackAddSuccess=true');
      });
   });
});

// For now, just send mock Slack response with GIF
router.post('/yk', async function(req, res, next) {
  util.warn("got post", req.body);
  testData.lastTeamId = req.body.team_id;

  var showGif = true;
  if (req.body.ssl_check === 1) {
    return res.json({"ok":true});
  }

  var text = req.body.text || '';
  if (text.startsWith(req.t('help'))) {
    let senderUrl = `slack:${req.body.team_id}-${req.body.user_id}`;
    let sender = await blockchain.getAccountForUrl(senderUrl);
    text = req.t("ykarma_is") + ` ${sender.givable} ` + req.t("karma to give away to others, and") + ` ${sender.spendable} ` + req.t("to_spend_on");
    text = brandResponse(text, req.body.command);
    return res.json({
      "response_type" : "ephemeral",
      "text" : text
    });
  }
    
  if (text.indexOf('nogif') >= 0) {
    showGif = false;
    text=text.replace(" nogif", "");
    text=text.replace("nogif ", "");
  }

  var vals = await prepareToSendKarma(req, req.body.team_id, req.body.user_id, text);
  if (!vals.error) {
    try {
      util.log(`About to give ${vals.amount} from id ${vals.sender.id} to ${vals.recipientUrl} via Slack`, vals.message);
      await blockchain.give(
        vals.sender.id,
        vals.communityId,
        vals.recipientUrl,
        vals.amount,
        vals.message || ''
      );
      if (!req.body.response_url) {
        util.warn("Bailing out, no response URL given");
        return res.json({ "response_type" : "ephemeral", "text" : req.t("Sending…")});
      }

      let text = req.t("Sent!") +` ${showGif ? gifs.getGIFFor(vals.amount) : ""}`;
      let body = { "response_type" : "in_channel", "text": text };
      fetch(req.body.response_url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
        body: JSON.stringify(body),
      }).then(function(response) {
        util.log("Delayed response response", response.status);
      });
    } catch(error) {
      util.warn("yk error", error);
      return res.json({ "response_type" : "ephemeral", "text" : "Error"});
    }
  }

  var responseText = vals.error ? vals.error : "Sending…";
  responseText = brandResponse(responseText, req.body.command);
  res.json({
    "response_type" : vals.error ? "ephemeral" : "in_channel",
    "text" : responseText
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
  let sender = await blockchain.getAccountForUrl(senderUrl);
  if (sender.id === 0 || sender.communityIds.length === 0) {
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
  let recipient = await blockchain.getAccountForUrl(recipientUrl);
  if (recipient.id === 0 || recipient.communityIds.length === 0) {
    return { error: req.t("Sorry! That YKarma account is not set up for receiving here"), sender:sender,  recipient:recipient, recipientUrl:recipientUrl, amount:amount };
  }
  
  let communityId = await getCommunityIdForTeam(sender.communityIds, team_id);
  
  return { sender:sender, communityId: communityId, recipient:recipient, recipientUrl: recipientUrl, amount:amount, message:message, };
}

// TODO: this is such a mess, break it into multiple methods
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
    return res.send({success:false, error:data.error});
  }
  let bot_token = data.vals.bot_token;
  if (!bot_token) {
    console.log("no bot token found");
    return res.send({success:false, error:"no token found"});
  }

  let teamId = req.body.team_id;
  let slackUserId = req.body.event.user;
  let channelId = req.body.event.channel;
  let senderUrl = `slack:${teamId}-${slackUserId}`;
  let sender = await blockchain.getAccountForUrl(senderUrl);

  // parse text
  var text;
  var incoming = req.body.event.text || '';
  var words = incoming.split(' ');
  var purpose = words[0];
  switch (purpose) {
    
    // Get help
    case req.t("help"):
      text = req.t("bot_help") + ". " + req.t("You can also view the current leaderboard with 'leaderboard'") + ".";
      break;
    
    // Get balance
    case req.t("balance"):
      text = req.t("You currently have") + ` ${sender.givable} ` + req.t("to give away");
      postToChannel(teamId, channelId, text, bot_token);
      try {
         let available = await blockchain.availableToSpend(sender.id, '');
         // TODO: flavor breakdown?
         postToChannel(teamId, channelId, req.t("You currently have a total of") + ` ${available} ` + req.t("to spend… You can get an itemization by flavor with the 'flavors' command"), bot_token);
      } catch(error) {
         util.log('getAvailable error', error);
         postToChannel(teamId, channelId, req.t("Error getting available-to-spend amount"), bot_token);
      }
      return res.json({text:text});
    
    // Send karma
    case req.t("send"):
      var vals = await prepareToSendKarma(req, teamId, slackUserId, incoming);
      text = vals.error ? vals.error : req.t("Sending…");
      postToChannel(teamId, channelId, text, bot_token);
      res.json({text:text});
      if (vals.error) {
        return;
      }

      try {
        util.log(`About to give ${vals.amount} from id ${vals.sender.id} to ${vals.recipientUrl} via Slack`, vals.message);
        await blockchain.give(
          vals.sender.id,
          vals.communityId,
          vals.recipientUrl,
          vals.amount,
          vals.message || ''
        );
        postToChannel(teamId, channelId, req.t("Sent!"), bot_token);
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
      } catch(error) {
        util.warn("send cmd error", error);
        openChannelAndPost(vals.recipientUrl, error);
      }
      return;
    
    // View rewards
    case req.t("rewards"):
      text = req.t('Fetching available rewards from the blockchain…');
      postToChannel(teamId, channelId, text, bot_token);
      res.json({text:text});
      try {
        let result = await blockchain.getRewardsCount(0, 0);
        let totalRewards = parseInt(result);
        util.log("total rewards", totalRewards);
        if (totalRewards===0) {
          util.log("No rewards available");
          postToChannel(teamId, channelId, req.t("No rewards available"), bot_token);
          return res.json({text:text});
        }
        var promises = [];
        for (var i = 0; i < totalRewards; i++) {
          promises.push(blockchain.rewardByIdx(0, i, 0));
        }
        Promise.all(promises).then(async function(values) {
          let available = values.filter(a => a.id > 0 && a.ownerId===0 && a.vendorId !== sender.id);
          blocks = [
           {
              "type": "section",
              "text": {
                 "type": "mrkdwn",
                 "text": "*"+req.t('Available rewards')+":*"
              }
           },
           {"type": "divider" }
          ];
          for (var j=0; j< available.length; j++) {
            // TODO parallelize this as well
            let vendor = await blockchain.getAccountFor(available[j].vendorId);
            var vendorInfo = util.getSlackUserIdForTeam(vendor.urls, teamId);
            vendorInfo = vendorInfo ? `<@${vendorInfo}>` : vendor.urls;
            var description = available[j].metadata.description ? `\n ${ available[j].metadata.description}` : '';
            blocks = blocks.concat([{
              "type": "section",
              "text": {
                 "type": "mrkdwn",
                 "text": `_id: ${available[j].id}_ *${available[j].metadata.name}* from ${vendorInfo} ${description}\n _cost_: ${available[j].cost} _quantity available_: ${available[j].quantity} _required tag_: ${available[j].tag}`
              }
              },
              { "type": "divider" }
           ]);
          }
          blocks = blocks.concat([{
           "type": "section",
           "text": {
              "type": "mrkdwn",
              "text": req.t("To purchase, enter 'purchase' followed by the reward's ID number, e.g. 'purchase 7'")
           }}]
          );
          postToChannel(teamId, channelId, blocks, bot_token, req.t('Available Rewards'));
        });
      } catch(error) {
         util.log('getListOfRewards error', error);
         postToChannel(teamId, channelId, req.t("Error getting rewards"), bot_token);
      }
      return;

    // Make a purchase
    case req.t("purchase"):
      var purchaseId = 0;
      for (var j=1; j < words.length; j++) {
        var wordNum = parseInt(words[j], 10);
        if (wordNum > 0) {
          purchaseId = wordNum;
          break;
        }
      }
      text = req.t("Attempting purchase…");
      if (purchaseId === 0) {
        text = req.t("Please tell me the ID of the reward you want to purchase");
      }
      postToChannel(teamId, channelId, text, bot_token);
      res.json({text:text});
      try {
        let reward = await blockchain.getRewardFor(purchaseId);
        await blockchain.purchase(sender.id, purchaseId);
        // send notifications
        let vendor = await blockchain.getAccountFor(reward.vendorId);
        emails.sendRewardPurchasedEmail(req, reward, sender, vendor);
        emails.sendRewardSoldEmail(req, reward, sender, vendor);
        var vendorInfo = util.getSlackUserIdForTeam(vendor.urls, teamId);
        vendorInfo = vendorInfo ? `<@${vendorInfo}>` : vendor.urls;
        postToChannel(teamId, channelId, `You just purchased the reward ${util.getRewardInfoFrom(reward)} from ${vendorInfo}!`, bot_token);
        let vendorSlackUrl = util.getSlackUrlForTeam(vendor.urls, teamId);
        if (vendorSlackUrl) {
          let buyerInfo = `<@${slackUserId}>`;
          openChannelAndPost(vendorSlackUrl, `You just sold the reward ${util.getRewardInfoFrom(reward)} to ${buyerInfo}!`);
        }
      } catch(error) {
        postToChannel(teamId, channelId, req.t("Could not complete purchase, sorry!"), bot_token);
        util.warn("purchase error");
      }
      return;

    // Leaderboard
    case req.t("leaderboard"):
      let communityId = await getCommunityIdForTeam(sender.communityIds, teamId);
      communities.getLeaderboard(communityId, (error, leaders) => {
         if (error) {
            postToChannel(teamId, channelId, req.t("Could not get leaderboard, sorry!"), bot_token);
         } else {
            var blocks = [];
            for (var i=0; i<leaders.length; i++) {
               let leader = leaders[i];
               var leaderInfo = util.getSlackUserIdForTeam(leader.urls, teamId);
               leaderInfo = leaderInfo ? `<@${leaderInfo}>` : leader.urls;
               blocks.push({
                  "type": "section",
                  "text": {
                     "type": "mrkdwn",
                     "text": `*${i}* | ${leader.spendable} YK | ${leaderInfo}`
                  }
               });
            }
            postToChannel(teamId, channelId, blocks, bot_token, req.t('Leaderboard'));
         }
      });
      text = req.t("Getting leaderboard…");
      break;
      
    // Flavors
    case req.t("flavors"):
      text = "flavor handling goes here";
      break;
    
    // Unknown command
    default:
      text = req.t("Sorry, I didn't understand you. You can ask for help with 'help'");
  }

});

// this didn't start off this ugly
function postToChannel(team, channel, input, bot_token, notificationText='') {
  var body = {
    text: input,
    channel: channel,
    token: bot_token
  };
  if (Array.isArray(input)) {
    body = {
      blocks: input,
      text: notificationText,
      channel: channel,
      token: bot_token
    };
  }
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
  
  postToChannel(teamId, json.channel.id, text, bot_token);
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

async function getCommunityIdForTeam(communityIds, teamId) {
   // this probably shouldn't ever happen?
   if (communityIds.length == 0) {
      return 0;
   }
   if (communityIds.length == 1) {
      return communityIds[0];
   }
   for (var i=0; i<communityIds.length; i++) {
      try {
         let community = await blockchain.getCommunityFor(communityIds[i]);
         let communityTeams = community.metadata.slackTeams || [];
         if (communityTeams.includes(teamId)) {
            return community.id;
         }
      } catch(error) {
         util.warn(`error geting community for ${communityIds[i]}`, error);
      }
   }
   //fallback, pathological
   util.warn("No community found for team ID", teamId);
   return communityIds[0];
}

function brandResponse(text, indicator) {
   // indicator can be a slack command or a slack team ID
   // obviously we'll want to store these values elsewhere not hardcoded if we pursue the white labeling thing
   if (indicator==="hfc" || indicator==="T02DAHP2X") {
      return text.replace("YKarma", "HappyFunCoin").replace("karma", "HFC").replace("/yk", "/hfc");
   }
   return text;
}

module.exports = {
  router : router,
  openChannelAndPost : openChannelAndPost
};
