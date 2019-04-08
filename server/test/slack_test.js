process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3001');
var slack = require('../routes/slack');

var TestCookies = [];

describe('Slack', function () {

  it('test open channel and post', async function () {
    var slackUrl = "slack:TEST-USER1";
    var text = `Mocha testing open channel and post`;
    slack.openChannelAndPost(slackUrl, text);
    await sleep(500);
    try {
      var res = await api.get('/api/slack/lastOpenConversation');
      var last = JSON.parse(res.text).last;
        expect(last.users).to.equal("USER1");
        expect(last.token).to.equal("test");
      res = await api.get('/api/slack/lastPostMessage');
        last = JSON.parse(res.text).last;
        expect(last.text.split(" ")[0]).to.equal("Mocha");
        expect(last.channel).to.equal("TestChannel");
        expect(last.token).to.equal("test");
      return true;
    } catch(err) {
      console.log("error", err);
    }
  });

  // assumes a reward added as part of deploy
  it('send karma in-channel and via DM', async function() {
    this.timeout(10000);
    try {
      var res = await api.get('/api/accounts/setup?ykid=4');
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      res = await api.post('/api/slack/yk').set('Cookie', TestCookies)
        .send({"team_id":"TEST", "user_id":"USER1", "text":"send 1 to <@USER2> just testing"});
      expect(JSON.parse(res.text).text).to.equal("Sending…");
      // send via YKBot
      res = await api.post('/api/slack/event').set('Cookie', TestCookies)
        .send({ "team_id":"TEST", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"send 1 to <@USER2|test2> still testing"} });
      expect(JSON.parse(res.text).text).to.equal("Sending…");
      // list rewards
      res = await api.post('/api/slack/event').set('Cookie', TestCookies)
        .send({ "team_id":"TEST", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"rewards"} });
      expect(JSON.parse(res.text).text).to.equal("Fetching available rewards from the blockchain…");
      res = await api.post('/api/slack/event').set('Cookie', TestCookies)
        .send({ "team_id":"TEST", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"purchase 1"} })
      expect(JSON.parse(res.text).text).to.equal("Attempting purchase…");
    } catch(err) {
      console.log("error", err);
    }
  });

});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}