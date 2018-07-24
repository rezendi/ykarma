pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./Oracular.sol";
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

  /**
   * Community methods
   */

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
    Account memory recipient = accountData.accountForId(accountData.accountIdForUrl(_url));
    if (recipient.id == 0) {
      recipient = accountData.accountForId(addNewAccount(community.id, 0, '', _url));
    }
    trancheData.performGive(giver, recipient, _amount, community.tags, _message);
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
    trancheData.spend(_buyerId, reward.cost, reward.tag);
    rewardData.redeem(_buyerId, reward.id);
    accountData.redeem(_buyerId, reward.id);
  }

  function lastReplenished(uint256 _accountId) public view returns (uint256) {
    return trancheData.lastReplenished(_accountId);
  }

  /**
   * Community methods
   */
  function getCommunityCount() public view returns (uint256) {
    return communityData.maxCommunityId();
  }
  
  function communityForId(uint256 _id) public view returns (uint256, address, bytes32, string, string, string, uint256) {
    Community memory c = communityData.communityForId(_id);
    return (c.id, c.adminAddress, c.flags, c.domain, c.metadata, c.tags, c.accountIds.length);
  }
  
  function addNewCommunity(address _adminAddress, bytes32 _flags, string _domain, string _metadata, string _tags) onlyOracle public {
    communityData.addCommunity(_adminAddress, _flags, _domain, _metadata, _tags);
  }
  
  function editExistingCommunity(uint256 _id, address _adminAddress, bytes32 _flags, string _domain, string _metadata, string _tags) public {
    Community memory community = communityData.communityForId(_id);
    require (community.adminAddress == msg.sender || senderIsOracle());
    communityData.editCommunity(_id, _adminAddress, _flags, _domain, _metadata, _tags);
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

  function replenish(uint256 _accountId) public onlyOracle {
    trancheData.replenish(_accountId);
  }

  function recalculateBalances(uint256 _id) public onlyOracle {
    trancheData.recalculateBalances(_id);
  }

  //TODO: move JSON data to separate pageable function
  function accountForId(uint256 _id) public view returns (uint256, uint256, address, bytes32, string, string, uint256, uint256, string, string) {
    Account memory a = accountData.accountForId(_id);
    Community memory community = communityData.communityForId(a.communityId);
    require (community.adminAddress == msg.sender || senderIsOracle());
    return (a.id, a.communityId, a.userAddress, a.flags, a.metadata, a.urls, a.rewardIds.length,
            trancheData.availableToGive(a.id), trancheData.givenToJSON(a.id), trancheData.spendingToJSON(a.id));
  }
  
  function accountWithinCommunity(uint256 _communityId, uint256 _idx) public view returns (uint256, uint256, address, bytes32, string, string, uint256, uint256, string, string) {
    Community memory community = communityData.communityForId(_communityId);
    uint256 accountId = community.accountIds[_idx];
    return accountForId(accountId);
  }
  
  function accountForUrl(string _url) public view returns (uint256, uint256, address, bytes32, string, string, uint256, uint256, string, string) {
    uint256 id = accountData.accountIdForUrl(_url);
    return accountForId(id);
  }
  
  function addNewAccount(uint256 _communityId, address _address, string _metadata, string _url) public returns (uint256) {
    Community memory community = communityData.communityForId(_communityId);
    require (community.adminAddress == msg.sender || senderIsOracle());
    uint256 newAccountId = accountData.addAccount(_communityId, _address, _metadata, _url);
    communityData.addAccount(_communityId, newAccountId);
    return newAccountId;
  }
  
  function editAccount(uint256 _id, address _newAddress, string _metadata, bytes32 _flags) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender || senderIsOracle());
    accountData.editAccount(_id, _newAddress, _metadata, _flags);
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
  function addNewReward(uint256 _vendorId, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags) public {
    Account memory vendor = accountData.accountForId(_vendorId);
    require (vendor.userAddress == msg.sender || senderIsOracle());
    uint256 rewardId = rewardData.addReward(_vendorId, _cost, _quantity, _tag, _metadata, _flags);
    accountData.addRewardToAccount(_vendorId, rewardId);
    communityData.addRewardToCommunity(vendor.communityId, rewardId);
  }
  
  function rewardForId(uint256 _id) public view returns (uint256, uint256, uint256, uint256, uint256, bytes32, string, string) {
    Reward memory reward = rewardData.rewardForId(_id);
    if (reward.ownerId != 0) {
      Account memory account = accountData.accountForId(reward.ownerId);
      require (account.userAddress == msg.sender || senderIsOracle());
    }
    return (reward.id, reward.vendorId, reward.ownerId, reward.cost, reward.quantity, reward.flags, reward.tag, reward.metadata);
  }
  
  function editExistingReward(uint256 _id, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags) public {
    Reward memory reward = rewardData.rewardForId(_id);
    require (reward.ownerId == 0);
    Account memory account = accountData.accountForId(reward.vendorId);
    require (account.userAddress == msg.sender || senderIsOracle());
    rewardData.editReward(_id, _cost, _quantity, _tag, _metadata, _flags);
  }

  function deleteReward(uint256 _id) public {
    Reward memory reward = rewardData.rewardForId(_id);
    Account memory vendor = accountData.accountForId(reward.vendorId);
    require (reward.ownerId == 0 && (vendor.userAddress == msg.sender || senderIsOracle()));
    accountData.deleteRewardFromAccount(reward.vendorId, reward.id);
    rewardData.deleteRewardRecord(_id);
    communityData.deleteRewardFromCommunity(vendor.communityId, _id);
  }
  
  function getRewardsCount(uint256 _id, uint256 _idType) public view onlyOracle returns (uint256) {
    if (_idType > 0) {
      Account memory account = accountData.accountForId(_id);
      return _idType == 1 ? account.rewardIds.length : account.offerIds.length;
    }
    Community memory community = communityData.communityForId(_id);
    return community.rewardIds.length;
  }

  function rewardByIdx(uint256 _id, uint256 _idx, uint256 _idType) public view returns (uint256, uint256, uint256, uint256, uint256, bytes32, string, string) {
    if (_idType > 0) {
      uint256 accountRewardId = _idType == 1 ? accountData.accountForId(_id).rewardIds[_idx] : accountData.accountForId(_id).offerIds[_idx];
      return rewardForId(accountRewardId);
    }
    Community memory community = communityData.communityForId(_id);
    uint256 rewardId = community.rewardIds[_idx];
    return rewardForId(rewardId);
  }
}