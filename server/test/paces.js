
process.env.NODE_ENV = 'test';

var should = require('chai').should();
var expect = require('chai').expect;
var supertest = require('supertest');
var api = supertest('http://localhost:3001');

var TestCookies = [];

describe('Account', function () {

  it('should get the account', function (done) {
    api.get('/accounts/setUpTest').expect(200).end((err, res) => {
      console.log("test set up");
      if (err) done (err);
      api.get('/accounts/url/test@rezendi.com')
        .set('Cookie', TestCookies)
        .expect(200)
        .end(function (err, res) {
          var cookies = res.headers['set-cookie'] || [];
          TestCookies = cookies.length > 0 ? cookies.pop().split(';') : [];
          if (err) done (err);
          var acct = JSON.parse(res.text);
          expect(acct.urls).to.equal("mailto:test@rezendi.com");
          done();
        });
    });

  });

});