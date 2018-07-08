const YKarma = artifacts.require("YKarma");
const YKTranches = artifacts.require("YKTranches");
const YKAccounts = artifacts.require("YKAccounts");
const YKCommunities = artifacts.require("YKCommunities");
const YKRewards = artifacts.require("YKRewards");

contract('Paces', function(accounts) {
  const deployer = accounts[0];

  it('should be put through its paces', async function() {
    assert.equal(4*4, 16, "Test running");

    let trancheData = await YKTranches.new();
    let accountData = await YKAccounts.new();
    let communityData = await YKCommunities.new();
    let rewardData = await YKRewards.new();
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
    assert.equal(vals[5], 'mailto:jon@rezendi.com', "Account URLs");
    assert.equal(""+vals[7], '0', "Account pre-replenish");
    await ykarma.replenish(1);
    await ykarma.recalculateBalances(1);
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[7], '100', "Account replenished");
    
    // try giving to a new account, adding URLs to it
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
    vals = await ykarma.accountForUrl("mailto:jay@rezendi.com");
    assert.equal(vals[0], 2, "Getting an account by URL");
    await ykarma.addUrlToExistingAccount(2, "https://twitter.com/jayrezendi");
    vals = await ykarma.accountForId(2);
    assert.equal(vals[5], 'mailto:jay@rezendi.com||https://twitter.com/jayrezendi', "Adding an URL");
    vals = await ykarma.accountForUrl("https://twitter.com/jayrezendi");
    assert.equal(vals[0], 2, "Getting an account by an added URL");
    await ykarma.removeUrlFromExistingAccount(2, "https://twitter.com/jayrezendi");
    vals = await ykarma.accountForId(2);
    assert.equal(vals[5], 'mailto:jay@rezendi.com', "Removing a URL");
    
    // create a reward, update it, delete it, create two new ones, fail purchase of wrong tag
    await ykarma.addNewReward(2, 10, "alpha", '{"name":"My Doomed Reward"}', '0x00');
    vals = await ykarma.rewardForId(1);
    assert.equal(vals[1], 2, "Created reward");
    assert.equal(vals[3], 10);
    assert.equal(vals[5], 'alpha');
    assert.equal(vals[6], '{"name":"My Doomed Reward"}');
    await ykarma.editExistingReward(1, 5, "alpha?", '{"name":"My Dooomed Reward"}', '0x01');
    vals = await ykarma.rewardForId(1);
    assert.equal(vals[3], 5, "Updated reward");
    assert.equal(vals[5], 'alpha?');
    await ykarma.deleteReward(1);
    vals = await ykarma.rewardForId(1);
    assert.equal(vals[1], 0);
    await ykarma.addNewReward(1, 10, "cool", '{"name":"My Cool Reward"}', '0x00');
    await ykarma.addNewReward(1, 10, "test", '{"name":"My Test Reward"}', '0x00');
    vals = await ykarma.rewardForId(2);
    assert.equal(vals[2], 0, "No owner");
    vals = await ykarma.rewardForId(3);
    assert.equal(vals[5], 'test', "Beta tag");
    var exc = null;
    try { await ykarma.purchase(2, 3); } catch(e){ exc = e; }
    assert.notEqual(exc, null, "Exception generated");
    
    // A successful purchase
    vals = await ykarma.accountForId(2);
    assert.equal(JSON.parse(vals[9]).amounts[0], 40, "Karma ready to spend");
    await ykarma.purchase(2, 2);
    vals = await ykarma.rewardForId(2);
    assert.equal(vals[2], 2, "Reward successfully transferred");
    vals = await ykarma.accountForId(2);
    assert.equal(JSON.parse(vals[9]).amounts[0], 30, "Karma spent");
  });
});
