
process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3001');

var TestCookies = [];

describe('Account', function () {

  it('should add a URL to an account, then remove one', async function () {
    this.timeout(5000);
    try {
      var res = await api.get('/api/accounts/setup/2');
        TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      res = await api.get('/api/accounts/url/test@example.com').set('Cookie', TestCookies);
        var acct = JSON.parse(res.text);
        expect(acct.urls).to.equal("mailto:test@example.com");
        expect(acct.flags).to.equal('0x0000000000000000000000000000000000000000000000000000000000000000');
      res = await api.put('/api/accounts/addUrl').set('Cookie', TestCookies)
        .send({"url":"@testuser"});
        expect(JSON.parse(res.text).success).to.equal('@testuser');
      res = await api.get('/api/accounts/url/test@example.com').set('Cookie', TestCookies);
        acct = JSON.parse(res.text);
        expect(acct.urls).to.equal("mailto:test@example.com https://twitter.com/testuser");
      res = await api.put('/api/accounts/removeUrl').set('Cookie', TestCookies)
        .send({"url":"@testuser"});
        expect(JSON.parse(res.text).success).to.equal(true);
      res = await api.get('/api/accounts/url/test@example.com').set('Cookie', TestCookies);
        acct = JSON.parse(res.text);
        expect(acct.urls).to.equal("mailto:test@example.com");
    } catch(err) {
      return console.log("error", err);
    }
  });

  it('should list accounts for a community', async function () {
    try {
      var res = await api.get('/api/accounts/setup/2');
        TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      res = await api.get('/api/communities/1/accounts').set('Cookie', TestCookies);
        var accounts = JSON.parse(res.text);
        expect(accounts.length).to.be.above(2);
    } catch(err) {
      return console.log("error", err);
    }
  });

  it('should update account metadata', async function () {
    this.timeout(4000);
    try {
      var res = await api.get('/api/accounts/setup/2');
        TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      res = await api.put('/api/accounts/update').set('Cookie', TestCookies)
        .send({"account":{"id":2, "userAddress":"0x123f681646d4a755815f9cb19e1acc8565a0c2ac", "metadata":'{"name":"Updated"}'}});
        expect(JSON.parse(res.text).success).to.equal(true);
      res = await api.get('/api/accounts/url/test@example.com').set('Cookie', TestCookies);
        var acct = JSON.parse(res.text);
        expect(acct.metadata).to.equal('{"name":"Updated"}');
        expect(acct.userAddress).to.equal("0x123F681646d4A755815f9CB19e1aCc8565A0c2AC");
    } catch(err) {
      return console.log("error", err);
    }
  });

  it('should send karma to another account', async function () {
    var initial, initialGiven;
    this.timeout(4000);
    try {
      var res = await api.get('/api/accounts/setup/2');
        TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      res = await api.get('/api/accounts/url/test@example.com').set('Cookie', TestCookies);
        initial = parseInt(JSON.parse(res.text).givable);
        initialGiven = JSON.parse(res.text).given.length;
      res = await api.post('/api/accounts/give').set('Cookie', TestCookies)
        .send({"amount":1, "recipient":"@testrecipient", "message":"Just a message"});
        expect(JSON.parse(res.text).success).to.equal(true);
      res = await api.get('/api/accounts/url/test@example.com').set('Cookie', TestCookies);
        var acct = JSON.parse(res.text);
        expect(parseInt(acct.givable)).to.equal(initial - 1);
      res = await api.get('/api/accounts/url/@testrecipient').set('Cookie', TestCookies);
        acct = JSON.parse(res.text);
        expect(acct.flags).to.equal('0x0000000000000000000000000000000000000000000000000000000000000001');
      res = await api.get('/api/accounts/me').set('Cookie', TestCookies);
        expect(JSON.parse(res.text).given.length).to.equal(initialGiven + 1);
    } catch(err) {
      return console.log("error", err);
    }
  });

  it('should send karma to another community', async function () {
    var initialSpendable, initialGiven, initialReceived, initialGivable, acct, res;
    this.timeout(4000);
    try {
      res = await api.get('/api/accounts/setup/6');
        TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      res = await api.get('/api/accounts/me').set('Cookie', TestCookies);
        initialReceived = parseInt(JSON.parse(res.text).received.length);
        initialSpendable = parseInt(JSON.parse(res.text).spendable);
      res = await api.get('/api/accounts/setup/2');
        TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      res = await api.get('/api/accounts/url/test@example.com').set('Cookie', TestCookies);
        initialGivable = parseInt(JSON.parse(res.text).givable);
        initialGiven = JSON.parse(res.text).given.length;
      res = await api.post('/api/accounts/give').set('Cookie', TestCookies)
        .send({"amount":3, "recipient":"admin@test.com", "message":"Just a cross-community message"});
        expect(JSON.parse(res.text).success).to.equal(true);
      res = await api.get('/api/accounts/url/test@example.com').set('Cookie', TestCookies);
        acct = JSON.parse(res.text);
        expect(parseInt(acct.givable)).to.equal(initialGivable - 3);
        expect(acct.given.length).to.equal(initialGiven + 1);
      res = await api.get('/api/accounts/setup/6');
        TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      res = await api.get('/api/accounts/me').set('Cookie', TestCookies);
        acct = JSON.parse(res.text);
        expect(acct.received.length).to.equal(initialReceived + 1);
        expect(acct.spendable).to.equal(initialSpendable + 3);
    } catch(err) {
      return console.log("error", err);
    }
  });

});

describe('Reward', function () {

  // assumes a reward added as part of deploy
  it('should add, get, update, and delete a reward', async function () {
    this.timeout(6000);
    try {
      var rewardId = 1;
      var initialRewards;
      var res = await api.get('/api/accounts/setup/2');
        TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      res = await api.get('/api/rewards/vendedBy/2').set('Cookie', TestCookies).expect(200);
        initialRewards = JSON.parse(res.text).rewards.length;
      res = await api.post('/api/rewards/create').set('Cookie', TestCookies)
        .send({"reward":{"cost":10, "quantity": 1, "tag": "test", "metadata":'{"name":"Test Reward One"}', "flags": '0x0000000000000000000000000000000000000000000000000000000000000000'}});
        expect(JSON.parse(res.text).success).to.equal(true);
      res = await api.get('/api/rewards/vendedBy/2').set('Cookie', TestCookies).expect(200);
        var rwds = JSON.parse(res.text).rewards;
        expect(rwds.length).to.equal(initialRewards + 1);
        expect(JSON.parse(rwds[initialRewards].metadata).name).to.equal("Test Reward One");
        expect(rwds[initialRewards].id).to.not.equal(0);
        expect(rwds[initialRewards].cost).to.equal(10);
        expect(rwds[initialRewards].tag).to.equal("test");
        rewardId = rwds[initialRewards].id;
      res = await api.put('/api/rewards/update').set('Cookie', TestCookies)
        .send({"reward":{"id":rewardId, "tag":"test", "metadata":'{"name":"Updated Test Reward One"}'}});
        expect(JSON.parse(res.text).success).to.equal(true);
      res = await api.get('/api/rewards/reward/'+rewardId).set('Cookie', TestCookies);
        var rwd = JSON.parse(res.text).reward;
        expect(JSON.parse(rwd.metadata).name).to.equal("Updated Test Reward One");
        expect(rwd.cost).to.equal(10);
      res = await api.delete('/api/rewards/'+rewardId).set('Cookie', TestCookies);
        expect(JSON.parse(res.text).success).to.equal(true);
      res = await api.get('/api/rewards/vendedBy/2').set('Cookie', TestCookies);
        rwds = JSON.parse(res.text).rewards;
        expect(rwds.length).to.equal(initialRewards);
    } catch(err) {
      console.log("error", err);
    }
  });

});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}