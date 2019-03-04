process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3001');

var TestCookies = [];

describe('Slack', function () {

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
          expect(JSON.parse(res.text).text).to.equal("Sending...");
          // send via YKBot
          api.post('/api/slack/event')
            .send({ "team_id":"TEST", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"send 1 to <@USER2|test2> still testing"} })
            .set('Cookie', TestCookies).expect(200)
            .end(function (err, res) {
              if (err) done (err);
              expect(JSON.parse(res.text).text).to.equal("Sending...");
              // list rewards
              api.post('/api/slack/event')
                .send({ "team_id":"TEST", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"rewards"} })
                .set('Cookie', TestCookies).expect(200)
                .end(function (err, res) {
                  if (err) done (err);
                  expect(JSON.parse(res.text).text).to.equal("Fetching available rewards from blockchain...");
                  api.post('/api/slack/event')
                    .send({ "team_id":"TEST", "event": {"channel":"TestChannel", "type":"message.im", "user":"USER1", "text":"purchase 1"} })
                    .set('Cookie', TestCookies).expect(200)
                    .end(function (err, res) {
                      if (err) done (err);
                      expect(JSON.parse(res.text).text).to.equal("Attempting purchase...");
                      // TODO check the various posts to /testOpenConversation and /testPostMessage for correctness
                      done();
                    });
                });
            });
        });
    });
  });
});
  