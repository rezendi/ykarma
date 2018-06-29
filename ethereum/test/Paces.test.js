const YKarma = artifacts.require("YKarma");
const YKTranches = artifacts.require("YKTranches");
const YKAccounts = artifacts.require("YKAccounts");
const YKCommunities = artifacts.require("YKCommunities");

contract('Paces', function(accounts) {
  const deployer = accounts[0];

  it('should be put through its paces', async function() {
    assert.equal(4*4, 16, "Test running");

    let trancheData = await YKTranches.new();
    let accountData = await YKAccounts.new();
    let communityData = await YKCommunities.new();
    let rewardData = await YKCommunities.new();
    let ykarma = await YKarma.new(trancheData.address, accountData.address, communityData.address, rewardData.address);
    assert.notEqual(ykarma.address, 0, "Contract created");
    await trancheData.transferOwnership(ykarma.address);
    await accountData.transferOwnership(ykarma.address);
    await communityData.transferOwnership(ykarma.address);
    await rewardData.transferOwnership(ykarma.address);

    // add a little data
    await ykarma.addNewCommunity(accounts[1], '0x00', 'rezendi.com', '{"name":"rezendi"}', 'cool');
    let count = await ykarma.getCommunityCount();
    assert.equal(count, 1, "Community created");
    await ykarma.addNewCommunity(0, '0x00', 'asdf.com', '{"name":"asdf"}', 'asdf');
    let count2 = await ykarma.getCommunityCount();
    assert.equal(count2, 2, "Community created");
    var vals = await ykarma.communityForId(1);
    assert.equal(accounts[1], vals[1]);
    await ykarma.addNewAccount(1, '', '{"name":"Jon"}', 'mailto:jon@rezendi.com', );
    vals = await ykarma.accountForId(1);
    assert.equal(vals[4], '{"name":"Jon"}', "Account metadata");
    assert.equal(vals[5], 'mailto:jon@rezendi.com', "Account metadata");
    assert.equal(""+vals[7], '0', "Account pre-replenish");
    await ykarma.replenish(1);
    await ykarma.recalculateBalances(1);
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[7], '100', "Account replenished");
    await ykarma.give(1, 'mailto:jay@rezendi.com', 40, "Just a message");
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[7], '60', "Giving happened");
    vals = await ykarma.accountForId(2);
    assert.equal(JSON.parse(vals[9])["amounts"][0], 40, "Giving received");
    await ykarma.give(1, 'mailto:jay@rezendi.com', 20, "Another message");
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[7], '40', "Giving happened II");
    assert.equal(""+vals[8], '{"recipients":[2,2],"amounts":[40,20]}', "Giving recorded");
    vals = await ykarma.accountForId(2);
    assert.equal(JSON.parse(vals[9])["messages"][1], "Another message", "Giving received II");
    
    // check the data is there
  });
});
    
    // admin adds a user
    
    // admin adds another user
    
    // users' giving accounts are replenished
    
    // user A sends to user B
    
    // user A sends to user C, not yet on system
    
    // oracle adds user C, tokens transferred
    
    // admin adds a vendor
    
    // oracle adds another vendor
    
    // vendor adds an item
    
    // user buys item from vendor
    
    // time travel, recalculate, test demurrage
