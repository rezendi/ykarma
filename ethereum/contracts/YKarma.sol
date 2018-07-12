pragma solidity 0.4.23;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./Oracular.sol";
import "./YKOracle.sol";
import "./YKStructs.sol";
import "./YKTranches.sol";
import "./YKAccounts.sol";
import "./YKCommunities.sol";
import "./YKRewards.sol";

contract YKarma is Oracular, YKStructs {

  YKTranches trancheData;
  YKAccounts accountData;
  YKCommunities communityData;
  YKRewards rewardData;

  constructor(YKTranches _tranches, YKAccounts _accounts, YKCommunities _communities, YKRewards _rewards) public Oracular() {
    trancheData = _tranches;
    accountData = _accounts;
    communityData = _communities;
    rewardData = _rewards;
  }
  
  function updateTrancheContract(YKTranches _tranches) onlyOracle public {
    trancheData = _tranches;
  }

  function updateAccountsContract(YKAccounts _accounts) onlyOracle public {
    accountData = _accounts;
  }

  function updateCommunitiesContract(YKCommunities _communities) onlyOracle public {
    communityData = _communities;
  }

  function updateRewardsContract(YKRewards _rewards) onlyOracle public {
    rewardData = _rewards;
  }

  function giveTo(string _url, uint256 _amount, string _message) public {
    uint256 giverId = accountData.accountIdForAddress(msg.sender);
    doGive(giverId, _url, _amount, _message);
  }

  function give(uint256 _giverId, string _url, uint256 _amount, string _message) public onlyOracle {
    doGive(_giverId, _url, _amount, _message);
  }
  
  function doGive(uint256 _giverId, string _url, uint256 _amount, string _message) internal {
    Account memory giver = accountData.accountForId(_giverId);
    uint256 available = trancheData.availableToGive(_giverId);
    require (available >= _amount);
    Community memory community = communityData.communityForId(giver.communityId);
    uint256 receiverId = accountData.accountIdForUrl(_url);
    if (receiverId == 0) {
      receiverId = addNewAccount(community.id, 0, '', _url);
    }
    trancheData.performGive(_giverId, receiverId, _amount, community.tags, _message);
  }

  function buy(uint256 _rewardId) public {
    uint256 spenderId = accountData.accountIdForAddress(msg.sender);
    doPurchase(spenderId, _rewardId);
  }

  function purchase(uint256 _buyerId, uint256 _rewardId) public onlyOracle {
    doPurchase(_buyerId, _rewardId);
  }

  function doPurchase(uint256 _buyerId, uint256 _rewardId) internal {
    Reward memory reward = rewardData.rewardForId(_rewardId);
    require(reward.ownerId == 0); // for now
    uint256 available = trancheData.availableToSpend(_buyerId, reward.tag);
    require (available >= reward.cost);
    trancheData.spend(_buyerId, reward.cost, reward.tag);
    rewardData.redeem(_buyerId, reward.id);
    accountData.redeem(_buyerId, reward.id);
  }

  function lastReplenished(uint256 _accountId) public view returns (uint256) {
    return trancheData.lastReplenished(_accountId);
  }

  function replenish(uint256 _accountId) public onlyOracle {
    trancheData.replenish(_accountId);
  }

  /**
   * Community methods
   */
  function getCommunityCount() public view returns (uint256) {
    return communityData.maxCommunityId();
  }
  
  function communityForId(uint256 _id) public view returns (uint256, address, byte, string, string, string, uint256) {
    Community memory c = communityData.communityForId(_id);
    return (c.id, c.adminAddress, c.flags, c.domain, c.metadata, c.tags, c.accountIds.length);
  }
  
  function addNewCommunity(address _adminAddress, byte _flags, string _domain, string _metadata, string _tags) onlyOracle public {
    Community memory community = Community({
      id:           0,
      adminAddress: _adminAddress,
      flags:        _flags,
      domain:       _domain,
      metadata:     _metadata,
      tags:         _tags,
      accountIds:   new uint256[](0)
    });
    communityData.addCommunity(community);
  }
  
  function editExistingCommunity(uint256 _id, address _adminAddress, byte _flags, string _domain, string _metadata, string _tags) public {
    Community memory community = communityData.communityForId(_id);
    require (community.adminAddress == msg.sender || senderIsOracle());
    Community memory newCommunity = Community({
      id:           0,
      adminAddress: _adminAddress,
      flags:        _flags,
      domain:       _domain,
      metadata:     _metadata,
      tags:         _tags,
      accountIds:   new uint256[](0)
    });
    communityData.editCommunity(_id, newCommunity);
  }
  
  function removeAccount(uint256 _communityId, uint256 _accountId) public {
    Community memory community = communityData.communityForId(_communityId);
    require (community.adminAddress == msg.sender || senderIsOracle());
    communityData.removeAccount(_communityId, _accountId);
  }
  
  function deleteCommunity(uint256 _id) public {
    Community memory community = communityData.communityForId(_id);
    require (community.adminAddress == msg.sender || senderIsOracle());
    communityData.deleteCommunity(_id);
  }
  
  /**
   * Account methods
   */
  function getAccountCount(uint256 _communityId) public view returns (uint256) {
    Community memory c = communityData.communityForId(_communityId);
    return c.accountIds.length;
  }

  function recalculateBalances(uint256 _id) public onlyOracle {
    trancheData.recalculateBalances(_id);
  }

  //TODO: move JSON data to separate pageable function
  function accountForId(uint256 _id) public view returns (uint256, uint256, address, byte, string, string, uint256, uint256, string, string) {
    Account memory a = accountData.accountForId(_id);
    Community memory community = communityData.communityForId(a.communityId);
    require (community.adminAddress == msg.sender || senderIsOracle());
    return (a.id, a.communityId, a.userAddress, a.flags, a.metadata, a.urls, a.rewardIds.length,
            trancheData.availableToGive(a.id), trancheData.givenToJSON(a.id), trancheData.spendingToJSON(a.id));
  }
  
  function accountWithinCommunity(uint256 _communityId, uint256 _idx) public view returns (uint256, uint256, address, byte, string, string, uint256, uint256, string, string) {
    Community memory community = communityData.communityForId(_communityId);
    uint256 accountId = community.accountIds[_idx];
    return accountForId(accountId);
  }
  
  function accountForUrl(string _url) public view returns (uint256, uint256, address, byte, string, string, uint256, uint256, string, string) {
    uint256 id = accountData.accountIdForUrl(_url);
    return accountForId(id);
  }
  
  function addNewAccount(uint256 _communityId, address _address, string _metadata, string _url) public returns (uint256) {
    Community memory community = communityData.communityForId(_communityId);
    require (community.adminAddress == msg.sender || senderIsOracle());
    Account memory account = Account({
      id:           0,
      communityId:  _communityId,
      userAddress:  _address,
      flags:        0x0,
      metadata:     _metadata,
      urls:         '',
      rewardIds:    new uint256[](0),
      offerIds:    new uint256[](0)
    });
    uint256 newAccountId = accountData.addAccount(account, _url);
    if (_communityId > 0 ) {
      communityData.addAccount(_communityId, newAccountId);
    }
    return newAccountId;
  }
  
  function editAccount(uint256 _id, address _newAddress, string _metadata) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender || senderIsOracle());
    Account memory newAccount = Account({
      id:           _id,
      communityId:  account.communityId, // edited elsewhere
      userAddress:  _newAddress,
      flags:        account.flags,
      metadata:     _metadata,
      urls:         account.urls,  // edited elsewhere
      rewardIds:    new uint256[](0),
      offerIds:    new uint256[](0)
    });
    accountData.editAccount(_id, newAccount);
  }
  
  function flagAccount(uint256 _id, byte _flags) public {
    accountData.flagAccount(_id, _flags);
  }

  function addUrlToExistingAccount(uint256 _id, string _newUrl) public returns (bool) {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender || senderIsOracle());
    return accountData.addUrlToAccount(_id, _newUrl);
  }
  
  function removeUrlFromExistingAccount(uint256 _id, string _oldUrl) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender || senderIsOracle());
    accountData.removeUrlFromAccount(_id, _oldUrl);
  }
  
  function deleteAccount(uint256 _id) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender || senderIsOracle());
    removeAccount(account.communityId, _id);
    accountData.deleteAccount(_id);
  }
  
  /**
   * Reward methods
   */
  function addNewReward(uint256 _vendorId, uint256 _cost, string _tag, string _metadata, byte _flags) public {
    Account memory account = accountData.accountForId(_vendorId);
    require (account.userAddress == msg.sender || senderIsOracle());
    Reward memory reward = Reward({id:0, vendorId:_vendorId, ownerId:0, flags:_flags, cost:_cost, tag:_tag, metadata:_metadata});
    uint256 rewardId = rewardData.addReward(reward);
    accountData.addReward(_vendorId, rewardId);
  }
  
  function rewardForId(uint256 _id) public view returns (uint256, uint256, uint256, uint256, byte, string, string) {
    Reward memory reward = rewardData.rewardForId(_id);
    if (reward.ownerId != 0) {
      Account memory account = accountData.accountForId(reward.ownerId);
      require (account.userAddress == msg.sender || senderIsOracle());
    }
    return (reward.id, reward.vendorId, reward.ownerId, reward.cost, reward.flags, reward.tag, reward.metadata);
  }
  
  function getRewardsOwnedCount(uint256 _id) public view onlyOracle returns (uint256) {
    Account memory account = accountData.accountForId(_id);
    return account.rewardIds.length;
  }

  function rewardByOwner(uint256 _ownerId, uint256 _idx) public view onlyOracle returns (uint256, uint256, uint256, uint256, byte, string, string) {
    Account memory account = accountData.accountForId(_ownerId);
    uint256 rewardId = account.rewardIds[_idx];
    return rewardForId(rewardId);
  }
  
  function getRewardsVendedCount(uint256 _id) public view onlyOracle returns (uint256) {
    Account memory account = accountData.accountForId(_id);
    return account.offerIds.length;
  }

  function rewardByVendor(uint256 _vendorId, uint256 _idx) public view returns (uint256, uint256, uint256, uint256, byte, string, string) {
    Account memory account = accountData.accountForId(_vendorId);
    uint256 rewardId = account.offerIds[_idx];
    return rewardForId(rewardId);
  }
  
  function editExistingReward(uint256 _id, uint256 _cost, string _tag, string _metadata, byte _flags) public {
    Reward memory reward = rewardData.rewardForId(_id);
    require (reward.ownerId == 0);
    Account memory account = accountData.accountForId(reward.vendorId);
    require (account.userAddress == msg.sender || senderIsOracle());
    Reward memory newReward = Reward({
      id:           _id,
      vendorId:     reward.vendorId,
      ownerId:      reward.ownerId,
      flags:        _flags,
      metadata:     _metadata,
      tag:          _tag,
      cost:         _cost
    });
    rewardData.editReward(newReward);
  }

  function deleteReward(uint256 _id) public {
    Reward memory reward = rewardData.rewardForId(_id);
    require (reward.ownerId == 0);
    Account memory account = accountData.accountForId(reward.vendorId);
    require (account.userAddress == msg.sender || senderIsOracle());
    accountData.deleteReward(reward.vendorId, reward.id);
    rewardData.deleteReward(_id);
  }
  
}
