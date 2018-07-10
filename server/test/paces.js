
process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3001');

var TestCookies = [];

describe('Account', function () {

  it('should add a URL to an account, then remove one', function (done) {
    api.get('/accounts/setUpTest').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.get('/accounts/url/test@rezendi.com')
        .set('Cookie', TestCookies).expect(200)
        .end(function (err, res) {
          if (err) done (err);
          var acct = JSON.parse(res.text);
          expect(acct.urls).to.equal("mailto:test@rezendi.com");
          TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
          api.put('/accounts/addUrl')
            .send({"url":"@testrezendi"})
            .set('Cookie', TestCookies).expect(200)
            .end(function (err, res) {
              if (err) done (err);
              expect(res.text).to.equal('{"success":true}');
              TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
              api.get('/accounts/url/test@rezendi.com')
                .set('Cookie', TestCookies).expect(200)
                .end(function (err, res) {
                  if (err) done (err);
                  var acct = JSON.parse(res.text);
                  expect(acct.urls).to.equal("mailto:test@rezendi.com||https://twitter.com/testrezendi");
                  done();
                });
            });
        });
    });
  });

  it('should list accounts for a community', function (done) {
    api.get('/accounts/setUpTest').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.get('/accounts/for/1')
      .set('Cookie', TestCookies).expect(200)
      .end(function (err, res) {
        if (err) done (err);
        var accounts = JSON.parse(res.text);
        expect(accounts.length).to.equal(2);
      });
    });
  });

  it('should update account metadata', function (done) {
    api.get('/accounts/setUpTest').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.put('/accounts/update')
        .send({"id":2, "userAddress":"0x123f681646d4a755815f9cb19e1acc8565a0c2ac", "metadata":'{"name":"Updated"}'})
        .set('Cookie', TestCookies).expect(200)
        .end(function (err, res) {
          if (err) done (err);
          expect(res.text).to.equal('{"success":true}');
          TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
          api.get('/accounts/url/test@rezendi.com')
            .set('Cookie', TestCookies).expect(200)
            .end(function (err, res) {
              if (err) done (err);
              var acct = JSON.parse(res.text);
              expect(acct.metadata).to.equal('{"name":"Updated"}');
              expect(acct.userAddress).to.equal("0x123f681646d4a755815f9cb19e1acc8565a0c2ac");
              done();
            });
        });
    });
  });

  it('should send karma to another account', function (done) {
    api.get('/accounts/setUpTest').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.post('/accounts/give')
        .send({"amount":10, "recipient":"@testrecipient", "message":"Just a message"})
        .set('Cookie', TestCookies).expect(200)
        .end(function (err, res) {
          if (err) done (err);
          expect(res.text).to.equal('{"success":true}');
          api.get('/accounts/url/test@rezendi.com')
            .set('Cookie', TestCookies).expect(200)
            .end(function (err, res) {
              if (err) done (err);
              var acct = JSON.parse(res.text);
              expect(acct.givable).to.equal(90);
              done();
            });
        });
    });
  });

  it('should add and remove a URL', function (done) {
    api.get('/accounts/setUpTest').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      api.put('/accounts/addUrl')
        .send({"url":"@testrezendi"})
        .set('Cookie', TestCookies).expect(200)
        .end(function (err, res) {
          if (err) done (err);
          expect(res.text).to.equal('{"success":true}');
          TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
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
                  TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
                  api.get('/accounts/url/test@rezendi.com')
                    .set('Cookie', TestCookies).expect(200)
                    .end(function (err, res) {
                      if (err) done (err);
                      var acct = JSON.parse(res.text);
                      expect(acct.urls).to.equal("mailto:test@rezendi.com");
                      dont();
                    });
                });
            });
        });
    });
  });

});

describe('Account', function () {
  it('should add, get, update, and delete a reward', function (done) {
    api.get('/accounts/setUpTest').expect(200).end((err, res) => {
      if (err) done (err);
      TestCookies = (res.headers['set-cookie'] || ['']).pop().split(';');
      done();
    });
  });

});