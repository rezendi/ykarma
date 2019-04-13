process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3001');
var slack = require('../routes/slack');

var TestCookies = [];

describe('Slack', async function () {

  // assumes a reward added as part of deploy
  var res;
  it('send karma in-channel and via DM', async function() {
    this.timeout(10000);
    try {
      // send via command
      res = await api.get('/api/slack/testReset/TEAM1');
      res = await api.post('/api/slack/yk')
        .send({"team_id":"TEAM1", "user_id":"USER1", "text":"send 1 to <@USER2> just testing"});
      expect(JSON.parse(res.text).text).to.equal("Sending…");

      // send via YKBot
      res = await api.post('/api/slack/event').set('Cookie', TestCookies)
        .send({ "team_id":"TEAM1", "event": {"channel":"User1Channel", "type":"message.im", "user":"USER1", "text":"send 1 to <@USER2|test2> still testing"} });
      expect(JSON.parse(res.text).text).to.equal("Sending…");

      res = await getApi('/api/slack/testMessage/TEAM1/0');
      val = JSON.parse(res.text).val;
      expect(val.text).to.equal("Sending…");
      expect(val.channel).to.equal("User1Channel");
      expect(val.token).to.equal("test");

      res = await getApi('/api/slack/testMessage/TEAM1/1');
      val = JSON.parse(res.text).val;
      expect(val.text).to.equal("Sent!");

      res = await getApi('/api/slack/testConversation/TEAM1/0');
      val = JSON.parse(res.text).val;
      expect(val.users).to.equal("USER2");

      res = await getApi('/api/slack/testMessage/TEAM1/2');
      expect(res.text.indexOf("has sent you") > 0).to.equal(true);

      // list rewards
      res = await api.post('/api/slack/event').set('Cookie', TestCookies)
        .send({ "team_id":"TEAM1", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"rewards"} });
      expect(JSON.parse(res.text).text).to.equal("Fetching available rewards from the blockchain…");
      res = await getApi('/api/slack/testMessage/TEAM1/4');
      expect(res.text.indexOf("*A Test Reward*") > 0).to.equal(true);
      expect(res.text.indexOf("_cost_: 10") > 0).to.equal(true);
      
      // purchase reward
      res = await api.post('/api/slack/event').set('Cookie', TestCookies)
        .send({ "team_id":"TEAM1", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"purchase 1"} });
      expect(JSON.parse(res.text).text).to.equal("Attempting purchase…");
      res = await getApi('/api/slack/testMessage/TEAM1/6');
      expect(JSON.parse(res.text).val.text).to.equal("Could not complete purchase, sorry!");
    } catch(err) {
      console.log("error", err);
    }
  });

  it('send karma in a second slack team, and make a purchase', async function() {
    this.timeout(10000);
    try {
      // send via command
      res = await api.get('/api/slack/testReset/TEAM2');
      res = await api.post('/api/slack/yk')
        .send({"team_id":"TEAM2", "user_id":"USER3", "text":"send 2 to <@USER4> just testing"});
      expect(JSON.parse(res.text).text).to.equal("Sending…");

      // purchase reward
      res = await api.post('/api/slack/event').set('Cookie', TestCookies)
        .send({ "team_id":"TEAM2", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER4", "text":"rewards"} });
      expect(JSON.parse(res.text).text).to.equal("Fetching available rewards from the blockchain…");
      res = await api.post('/api/slack/event').set('Cookie', TestCookies)
        .send({ "team_id":"TEAM2", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER4", "text":"purchase 2"} });
      expect(JSON.parse(res.text).text).to.equal("Attempting purchase…");
      res = await getApi('/api/slack/testMessage/TEAM2/3');
      expect(JSON.parse(res.text).val.text.startsWith('You just purchased the reward')).to.equal(true);
      res = await getApi('/api/slack/testMessage/TEAM2/4');
      expect(JSON.parse(res.text).val.text.startsWith('You just sold the reward')).to.equal(true);
    } catch(err) {
      console.log("error", err);
    }
  });
  
});

async function getApi(path) {
  var res = {text: '{"val":""}'};
  for (var i = 0; i<10 && res.text==='{"val":""}'; i++) {
    res = await api.get(path);
    await sleep(500);
  }
  return res;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}