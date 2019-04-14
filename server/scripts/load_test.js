
process.env.NODE_ENV = 'test';
require('dotenv').config();

const eth = require('../routes/eth');
var expect = require('chai').expect;
var load = require('./load');

// To be run only after an initial `truffle deploy`
describe('Load', function () {
  this.timeout(30000);
  it('should load from a test file', async function () {
    await load.loadIfNotAlreadyLoaded();
    while (!load.isDone()) {
      await sleep(1000);
    }
    await eth.getFromAccount();
    var result = await eth.contract.methods.getCommunityCount().call();
    let communityCount = parseInt(result);
    expect(parseInt(communityCount)).to.equal(2);
    result = await eth.contract.methods.getAccountCount(1).call();
    let accountCount = parseInt(result);
    expect(parseInt(accountCount)).to.equal(5);
    result = await eth.contract.methods.accountWithinCommunity(1, 0).call();
    var account = eth.getAccountFromResult(result);
    expect(account.id).to.equal(1);
    expect(account.communityIds.length).to.equal(1);
    expect(account.communityIds[0]).to.equal(1);
    expect(account.urls).to.equal("mailto:jon@rezendi.com");
    expect(account.metadata.name).to.equal("Jon");
    expect(account.givable).to.equal(80);
    result = await eth.contract.methods.rewardByIdx(0, 0, 0).call();
    var reward = eth.getRewardFromResult(result);
    expect(reward.cost).to.equal(10);
    expect(reward.quantity).to.equal(2);
    expect(reward.tag).to.equal('alpha');
    expect(reward.vendorId).to.equal(2);
    expect(reward.metadata.name).to.equal("A Test Reward");
    result = await eth.contract.methods.accountWithinCommunity(2, 0).call();
    account = eth.getAccountFromResult(result);
    expect(account.id).to.equal(6);
    expect(account.communityIds.length).to.equal(1);
    expect(account.communityIds[0]).to.equal(2);
    expect(account.urls).to.equal("mailto:admin@test.com slack:TEAM2-USER1");
    expect(account.metadata.name).to.equal("Admin User");
    expect(account.givable).to.equal(0);
    return true;
  });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

