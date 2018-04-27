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
    let ykarma = await YKarma.new();
    assert.notEqual(ykarma.address, 0, "Contract created");
    await ykarma.updateTrancheContract(trancheData.address);
    await trancheData.transferOwnership(ykarma.address);
    await ykarma.updateAccountsContract(accountData.address);
    await accountData.transferOwnership(ykarma.address);
    await ykarma.updateCommunitiesContract(communityData.address);
    await communityData.transferOwnership(ykarma.address);
    await ykarma.updateVendorsContract(vendorData.address);
    await vendorData.transferOwnership(ykarma.address);

    // add a little data
    await ykarma.addCommunity(accounts[1], 'rezendi.com', '{"name":"rezendi"');
    await ykarma.addVendor(1, '{"name":"Rezendivendor"', accounts[2]);
    await ykarma.addAccount(1, 'mailto:jon@rezendi.com', '{"name":"Jon"');
    await ykarma.replenish(1);
    
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
