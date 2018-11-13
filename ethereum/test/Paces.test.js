const YKarma = artifacts.require("YKarma");
const YKTranches = artifacts.require("YKTranches");
const YKAccounts = artifacts.require("YKAccounts");
const YKCommunities = artifacts.require("YKCommunities");
const YKRewards = artifacts.require("YKRewards");

contract('Paces', function(accounts) {
  const deployer = accounts[0];

  it('should be put through its paces', async function() {
    let trancheData = await YKTranches.new();
    let accountData = await YKAccounts.new();
    let communityData = await YKCommunities.new();
    let rewardData = await YKRewards.new();
    let ykarma = await YKarma.new(trancheData.address, accountData.address, communityData.address, rewardData.address);
    assert.notEqual(ykarma.address, 0, "Contract created");
    await trancheData.addOracle(ykarma.address);
    await accountData.addOracle(ykarma.address);
    await communityData.addOracle(ykarma.address);
    await rewardData.addOracle(ykarma.address);

    // add a little data
    await ykarma.addNewCommunity(accounts[1], '0x00', 'rezendi.com', '{"name":"rezendi"}', 'cool');
    var count = await ykarma.getCommunityCount();
    assert.equal(count, 1, "Community created");
    await ykarma.addNewCommunity(0, '0x00', 'asdf.com', '{"name":"asdf"}', 'asdf');
    count = await ykarma.getCommunityCount();
    assert.equal(count, 2, "Community created");
    var vals = await ykarma.communityForId(1);
    assert.equal(accounts[1], vals[1]);
    await ykarma.addNewAccount(1, '', '{"name":"Jon"}', '0x00', 'mailto:jon@rezendi.com', );
    vals = await ykarma.accountForId(1);
    assert.equal(vals[4], '{"name":"Jon"}', "Account metadata");
    assert.equal(vals[5], 'mailto:jon@rezendi.com', "Account URLs");
    assert.equal(""+vals[7], '0', "Account pre-replenish");
    assert.equal(vals[3], 0x0);
    await ykarma.replenish(1);
    await ykarma.recalculateBalances(1);
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[7], '100', "Account replenished");
    await ykarma.replenish(1);
    await ykarma.recalculateBalances(1);
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[7], '100', "Account replenished only once");
    
    // try giving to a new account, adding URLs to it
    await ykarma.give(1, 'mailto:jay@rezendi.com', 40, "Just a message");
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[7], '60', "Giving happened");
    vals = await ykarma.accountForId(2);
    assert.equal(JSON.parse(vals[9])[0]["amount"], 40, "Giving received");
    assert.equal(vals[3], 0x1);
    await ykarma.give(1, 'mailto:jay@rezendi.com', 20, 'Another "quote-unquote" message');
    vals = await ykarma.accountForId(1);
    assert.equal(""+vals[7], '40', "Giving happened II");
    dict = JSON.parse(vals[8]);
    assert.equal(dict[0].sender, 1, "Giving");
    assert.equal(dict[0].receiver, 2, "Giving");
    assert.equal(dict[0].message, "Just a message", "Giving");
    assert.equal(dict[1].sender, 1, "Giving");
    assert.equal(dict[1].receiver, 2, "Giving");
    assert.equal(dict[1].available, 20, "Giving");
    assert.equal(dict[1].amount, 20, "Giving");
    assert.equal(dict[1].message, "Another quote-unquote message", "Giving");
    assert.equal(dict[1].tags, "cool", "Giving");
    assert.equal(dict[1].block-1, dict[0].block, "Giving");
    vals = await ykarma.accountForId(2);
    assert.equal(JSON.parse(vals[9])[1]["message"], "Another quote-unquote message", "Giving received II");
    await ykarma.give(1, 'mailto:jay@rezendi.com', 40, 'Message Three');
    vals = await ykarma.accountForId(1);
    assert.equal(JSON.parse(vals[9])[0].amount, 10, "Got reward");
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
    
    // create a reward, update it, delete it
    vals = await ykarma.getRewardsCount(2, 2);
    assert.equal(""+vals, 0, "Vendor rewards count 0");
    await ykarma.addNewReward(2, 10, 1, "alpha", '{"name":"My Doomed Reward"}', '0x00');
    vals = await ykarma.rewardForId(1);
    assert.equal(vals[1], 2, "Created reward");
    assert.equal(vals[3], 10);
    assert.equal(vals[6], 'alpha');
    assert.equal(vals[7], '{"name":"My Doomed Reward"}');
    vals = await ykarma.getRewardsCount(2, 2);
    assert.equal(""+vals, 1, "Vendor rewards count 1");
    await ykarma.editExistingReward(1, 5, 1, "alpha?", '{"name":"My Dooomed Reward"}', '0x01');
    vals = await ykarma.rewardForId(1);
    assert.equal(vals[3], 5, "Updated reward");
    assert.equal(vals[6], 'alpha?');
    vals = await ykarma.getRewardsCount(2, 2);
    assert.equal(""+vals, 1, "Vendor rewards count still 1");
    await ykarma.deleteReward(1);
    vals = await ykarma.rewardForId(1);
    assert.equal(vals[1], 0);
    vals = await ykarma.getRewardsCount(2, 2);
    assert.equal(""+vals, 0, "Vendor rewards count 0 again");

    // create two new ones, fail purchase of wrong tag
    await ykarma.addNewReward(1, 10, 2, "cool", '{"name":"My Cool Reward"}', '0x00');
    await ykarma.addNewReward(1, 10, 1, "test", '{"name":"My Test Reward"}', '0x00');
    vals = await ykarma.getRewardsCount(1, 2);
    assert.equal(vals.toNumber(), 2, "Vendor rewards count 2");
    vals = await ykarma.rewardForId(2);
    assert.equal(vals[2], 0, "No owner");
    assert.equal(vals[4], 2, "Reward quantity");
    vals = await ykarma.rewardForId(3);
    assert.equal(vals[6], 'test', "Beta tag");
    var exc = null;
    try { await ykarma.purchase(2, 3); } catch(e){ exc = e; }
    assert.notEqual(exc, null, "Exception generated");
    
    // A successful purchase
    vals = await ykarma.accountForId(2);
    assert.equal(JSON.parse(vals[9])[0].available, 40, "Karma ready to spend");
    await ykarma.purchase(2, 2);
    vals = await ykarma.rewardForId(2);
    assert.equal(vals[2], 0, "No owner");
    assert.equal(vals[4], 1, "Reward quantity diminished");
    vals = await ykarma.rewardForId(4);
    assert.equal(vals[2], 2, "Newly created reward successfully transferred");
    assert.equal(vals[4], 1, "Reward quantity correct");
    vals = await ykarma.accountForId(2);
    assert.equal(JSON.parse(vals[9])[0].available, 30, "Karma spent");
    
    await ykarma.deleteAccount(2);
    vals = await ykarma.accountForId(2);
    assert.equal(vals[0], 0);

    vals = await ykarma.communityForId(2);
    assert.equal(vals[0], 2, "Community not deleted");
    await ykarma.deleteCommunity(2);
    vals = await ykarma.communityForId(2);
    assert.equal(vals[0], 0, "Community deleted");
  });
});
