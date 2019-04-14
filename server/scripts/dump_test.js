
process.env.NODE_ENV = 'test';
require('dotenv').config();

const fs = require('fs');
var should = require('chai').should();
var expect = require('chai').expect;
var dump = require('./dump');

// To be run only after an initial `TRUFFLE_ENV=test truffle deploy`
describe('Dump', function () {
  this.timeout(10000);
  it('should dump to a test file', async function () {
    await dump.doDump();
    let file = process.env.NODE_ENV=='test' ? 'test.json' : process.argv[2];
    let fileToLoad = __dirname + "/" + file;
    expect(fs.existsSync(fileToLoad)).to.equal(true);
  });
});
