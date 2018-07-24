
process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3001');

var TestCookies = [];

describe('Account', function () {

  it('should add a URL to an account, then remove one', function (done) {
    this.timeout(5000);
    api.get('/accounts/setup').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.get('/accounts/url/test@rezendi.com')
        .set('Cookie', TestCookies).expect(200)
        .end(function (err, res) {
          if (err) done (err);
          var acct = JSON.parse(res.text);
          expect(acct.urls).to.equal("mailto:test@rezendi.com");
          api.put('/accounts/addUrl')
            .send({"url":"@testrezendi"})
            .set('Cookie', TestCookies).expect(200)
            .end(function (err, res) {
              if (err) done (err);
              expect(res.text).to.equal('{"success":true}');
              api.get('/accounts/url/test@rezendi.com')
                .set('Cookie', TestCookies).expect(200)
                .end(function (err, res) {
                  if (err) done (err);
                  var acct = JSON.parse(res.text);
                  expect(acct.urls).to.equal("mailto:test@rezendi.com||https://twitter.com/testrezendi");
                  api.put('/accounts/removeUrl')
                    .send({"url":"@testrezendi"})
                    .set('Cookie', TestCookies).expect(200)
                    .end(function (err, res) {
                      if (err) done (err);
                      expect(res.text).to.equal('{"success":true}');
                      api.get('/accounts/url/test@rezendi.com')
                        .set('Cookie', TestCookies).expect(200)
                        .end(function (err, res) {
                          if (err) done (err);
                          var acct = JSON.parse(res.text);
                          expect(acct.urls).to.equal("mailto:test@rezendi.com");
                          done();
                        });
                    });
                });
            });
        });
    });
  });

  it('should list accounts for a community', function (done) {
    this.timeout(5000);
    api.get('/accounts/setup').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.get('/accounts/for/1')
      .set('Cookie', TestCookies).expect(200)
      .end(function (err, res) {
        if (err) done (err);
        var accounts = JSON.parse(res.text);
        expect(accounts.length).to.be.above(2);
        done();
      });
    });
  });

  it('should update account metadata', function (done) {
    this.timeout(5000);
    api.get('/accounts/setup').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.put('/accounts/update')
        .send({"account":{"id":2, "userAddress":"0x123f681646d4a755815f9cb19e1acc8565a0c2ac", "metadata":'{"name":"Updated"}'}})
        .set('Cookie', TestCookies).expect(200)
        .end(function (err, res) {
          if (err) done (err);
          expect(res.text).to.equal('{"success":true}');
          api.get('/accounts/url/test@rezendi.com')
            .set('Cookie', TestCookies).expect(200)
            .end(function (err, res) {
              if (err) done (err);
              var acct = JSON.parse(res.text);
              expect(acct.metadata).to.equal('{"name":"Updated"}');
              expect(acct.userAddress).to.equal("0x123F681646d4A755815f9CB19e1aCc8565A0c2AC");
              done();
            });
        });
    });
  });

  it('should send karma to another account', function (done) {
    var initial;
    this.timeout(5000);
    api.get('/accounts/setup').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.get('/accounts/url/test@rezendi.com')
        .set('Cookie', TestCookies).expect(200)
        .end(function (err, res) {
          if (err) done (err);
          initial = parseInt(JSON.parse(res.text).givable);
          api.post('/accounts/give')
            .send({"amount":1, "recipient":"@testrecipient", "message":"Just a message"})
            .set('Cookie', TestCookies).expect(200)
            .end(function (err, res) {
              if (err) done (err);
              expect(res.text).to.equal('{"success":true}');
              api.get('/accounts/url/test@rezendi.com')
                .set('Cookie', TestCookies).expect(200)
                .end(function (err, res) {
                  if (err) done (err);
                  var acct = JSON.parse(res.text);
                  expect(parseInt(acct.givable)).to.equal(initial - 1);
                  done();
                });
            });
        });
    });
  });

});

describe('Reward', function () {

  it('should add, get, update, and delete a reward', function (done) {
    this.timeout(5000);
    var rewardId = 1;
    api.get('/accounts/setup').expect(200).end((err, res) => {
      if (err) done (err);
      // console.log("set-cookie", res.headers['set-cookie']);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.post('/rewards/create')
        .send({"reward":{"cost":10, "quantity": 1, "tag": "test", "metadata":'{"name":"Test Reward One"}', "flags": '0x00'}})
        .set('Cookie', TestCookies).expect(200)
        .end(function (err, res) {
          if (err) done (err);
          expect(JSON.parse(res.text).success).to.equal(true);
          api.get('/rewards/vendedBy/2')
            .set('Cookie', TestCookies).expect(200)
            .end(function (err, res) {
              if (err) done (err);
              var rwds = JSON.parse(res.text).rewards;
              //console.log("rwds", rwds);
              expect(rwds.length).to.equal(1);
              //expect(rwds.length).to.be.above(0);
              expect(JSON.parse(rwds[0].metadata).name).to.equal("Test Reward One");
              expect(rwds[0].id).to.not.equal('0');
              expect(rwds[0].cost).to.equal('10');
              expect(rwds[0].tag).to.equal("test");
              rewardId = rwds[0].id;
              api.put('/rewards/update')
                .send({"reward":{"id":rewardId, "tag":"test", "metadata":'{"name":"Updated Test Reward One"}'}})
                .set('Cookie', TestCookies).expect(200)
                .end(function (err, res) {
                  if (err) done (err);
                  // console.log("update res", res.text);
                  expect(JSON.parse(res.text).success).to.equal(true);
                  api.get('/rewards/reward/'+rewardId)
                    .set('Cookie', TestCookies).expect(200)
                    .end(function (err, res) {
                      if (err) done (err);
                      var rwd = JSON.parse(res.text).reward;
                      expect(JSON.parse(rwd.metadata).name).to.equal("Updated Test Reward One");
                      expect(rwd.cost).to.equal('10');
                      api.delete('/rewards/'+rewardId)
                        .set('Cookie', TestCookies).expect(200)
                        .end(function (err, res) {
                          if (err) done (err);
                          expect(JSON.parse(res.text).success).to.equal(true);
                          api.get('/rewards/vendedBy/2')
                            .set('Cookie', TestCookies).expect(200)
                            .end(function (err, res) {
                              if (err) done (err);
                              var rwds = JSON.parse(res.text).rewards;
                              console.log("got",rwds);
                              expect(rwds.length).to.equal(0);
                              done();
                            });
                        });
                    });
                });
            });
        });
    });
  });

});