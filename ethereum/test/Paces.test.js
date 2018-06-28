const YKarma = artifacts.require("YKarma");
const YKTranches = artifacts.require("YKTranches");
const YKAccounts = artifacts.require("YKAccounts");
const YKCommunities = artifacts.require("YKCommunities");
const YKVendors = artifacts.require("YKVendors");

contract('Paces', function(accounts) {
  const deployer = accounts[0];

  it('should be put through its paces', async function() {
    assert.equal(4*4, 16, "Test running");

    let trancheData = await YKTranches.new();
    let accountData = await YKAccounts.new();
    let communityData = await YKCommunities.new();
    let vendorData = await YKVendors.new();
    let ykarma = await YKarma.new(trancheData.address, accountData.address, communityData.address, vendorData.address);
    assert.notEqual(ykarma.address, 0, "Contract created");
    await trancheData.transferOwnership(ykarma.address);
    await accountData.transferOwnership(ykarma.address);
    await communityData.transferOwnership(ykarma.address);
    await vendorData.transferOwnership(ykarma.address);

    // add a little data
    await ykarma.addCommunity(accounts[1], false, 'rezendi.com', '{"name":"rezendi"}', 'cool');
    let count = await ykarma.getCommunityCount();
    assert.equal(count, 1, "Community created");
    var vals = await ykarma.communityForId(1);
    assert.equal(accounts[1], vals[1]);
    await ykarma.addVendor(1, '{"name":"Rezendivendor"', accounts[2]);
    await ykarma.addNewAccount(1, '', '{"name":"Jon"}', 'mailto:jon@rezendi.com', );
    vals = await ykarma.accountForId(1);
    assert.equal(vals[3], '{"name":"Jon"}', "Account metadata");
    assert.equal(vals[4], 'mailto:jon@rezendi.com', "Account metadata");
    assert.equal(""+vals[6], '0', "Account pre-replenish");
    await ykarma.replenish(1);
    await ykarma.recalculateBalances(1);
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[6], '100', "Account replenished");
    await ykarma.give(1, 'mailto:jay@rezendi.com', 40, "Just a message");
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[6], '60', "Giving happened");
    vals = await ykarma.accountForId(2);
    assert.equal(""+vals[8], '40', "Giving received");
    await ykarma.give(1, 'mailto:jay@rezendi.com', 20, "Another message");
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[6], '40', "Giving happened II");
    assert.equal(""+vals[7], '{\'recipients\':[2,2],\'amounts\':[40,20]}', "Giving recorded");
    vals = await ykarma.accountForId(2);
    assert.equal(""+vals[8], '60', "Giving received II");
    
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
