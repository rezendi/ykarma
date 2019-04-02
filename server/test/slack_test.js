process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3001');
var slack = require('../routes/slack');

var TestCookies = [];

describe('Slack', function () {

  it('test open channel and post', function (done) {
    var slackUrl = "slack:TEST-USER1";
    var text = `Mocha testing open channel and post`;
    slack.openChannelAndPost(slackUrl, text);
    setTimeout(() => {
      api.get('/api/slack/lastOpenConversation')
        .end(function (err, res) {
          if (err) done (err);
          var last = JSON.parse(res.text).last;
          expect(last.users).to.equal("USER1");
          expect(last.token).to.equal("test");
          api.get('/api/slack/lastPostMessage')
            .end(function (err, res) {
              if (err) done (err);
              last = JSON.parse(res.text).last;
              expect(last.text.split(" ")[0]).to.equal("Mocha");
              expect(last.channel).to.equal("TestChannel");
              expect(last.token).to.equal("test");
              done();
            });
        });
    }, 500);
  });

  // assumes a reward added as part of deploy
  it('send karma in-channel and via DM', function (done) {
    this.timeout(10000);
    api.get('/api/accounts/setup?ykid=4').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      // send in channel
      api.post('/api/slack/yk')
        .send({"team_id":"TEST", "user_id":"USER1", "text":"send 1 to <@USER2|test2> just testing"})
        .set('Cookie', TestCookies).expect(200)
        .end(function (err, res) {
          if (err) done (err);
          expect(JSON.parse(res.text).text).to.equal("Sending…");
          // send via YKBot
          api.post('/api/slack/event')
            .send({ "team_id":"TEST", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"send 1 to <@USER2|test2> still testing"} })
            .set('Cookie', TestCookies).expect(200)
            .end(function (err, res) {
              if (err) done (err);
              expect(JSON.parse(res.text).text).to.equal("Sending…");
              // list rewards
              api.post('/api/slack/event')
                .send({ "team_id":"TEST", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"rewards"} })
                .set('Cookie', TestCookies).expect(200)
                .end(function (err, res) {
                  if (err) done (err);
                  expect(JSON.parse(res.text).text).to.equal("Fetching available rewards from the blockchain…");
                  api.post('/api/slack/event')
                    .send({ "team_id":"TEST", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"purchase 1"} })
                    .set('Cookie', TestCookies).expect(200)
                    .end(function (err, res) {
                      if (err) done (err);
                      expect(JSON.parse(res.text).text).to.equal("Attempting purchase…");
                      // TODO check the various posts to /testOpenConversation and /testPostMessage for correctness
                      done();
                    });
                });
            });
        });
    });
  });

});
  