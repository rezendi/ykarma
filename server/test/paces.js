
process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3001');

var TestCookies = [];

describe('Account', function () {

  it('should add a URL to an account', function (done) {
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
                  expect(acct.urls).to.equal("mailto:test@rezendi.com,https://twitter.com/testrezendi");
                  done();
                });
            });
        });
    });
  });

});