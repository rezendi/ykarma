pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
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

  bool public loadMode;
  uint256 RewardCreationCost;

  constructor(YKTranches _tranches, YKAccounts _accounts, YKCommunities _communities, YKRewards _rewards) public Oracular() {
    trancheData = _tranches;
    accountData = _accounts;
    communityData = _communities;
    rewardData = _rewards;
    loadMode = true;
  }
  
  function updateContracts(YKTranches _tranches, YKAccounts _accounts, YKCommunities _communities, YKRewards _rewards) onlyOracle public {
    if (_tranches != address(0)) {
      trancheData = _tranches;
    }
    if (_accounts != address(0)) {
      accountData = _accounts;
    }
    if (_communities != address(0)) {
      communityData = _communities;
    }
    if (_rewards != address(0)) {
      rewardData = _rewards;
    }
  }

  function loadModeOff() onlyOracle public {
    loadMode = false;
  }

  function setRewardCreationCost(uint256 _cost) public onlyOracle {
    RewardCreationCost = _cost;
  }

  /**
   * Giving and purchasing
   */

  function give(uint256 _giverId, string _url, uint256 _amount, string _message) public onlyOracle {
    require (_giverId > 0);
    Account memory giver = accountData.accountForId(_giverId);
    uint256 available = trancheData.availableToGive(_giverId);
    require (available >= _amount);
    require (communityData.validateGive(giver, _url, _message));
    Community memory community = communityData.communityForId(giver.communityId);
    Account memory recipient = accountData.accountForId(accountData.accountIdForUrl(_url));
    if (recipient.id == 0) {
      recipient = accountData.accountForId(addNewAccount(community.id, 0, '', 0x1, _url)); // 0x1 to mark account created by giving
    }
    trancheData.performGive(giver, recipient, _amount, community.tags, _message);
  }

  function purchase(uint256 _buyerId, uint256 _rewardId) public onlyOracle {
    Reward memory reward = rewardData.rewardForId(_rewardId);
    require(_buyerId > 0 && reward.ownerId == 0); // for now
    Account memory buyer = accountData.accountForId(_buyerId);
    require (communityData.validatePurchase(buyer, reward));
    trancheData.spend(_buyerId, reward.cost, reward.tag);
    uint256 redeemedId = rewardData.redeem(_buyerId, reward.id);
    accountData.redeem(_buyerId, redeemedId, reward.vendorId, reward.quantity > 1);
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
  
  function addNewCommunity(address _adminAddress, bytes32 _flags, string _domain, string _metadata, string _tags) public onlyOracle {
    communityData.addCommunity(_adminAddress, _flags, _domain, _metadata, _tags);
  }
  
  function editExistingCommunity(uint256 _id, address _adminAddress, bytes32 _flags, string _domain, string _metadata, string _tags) public onlyOracle {
    require(_id > 0);
    communityData.editCommunity(_id, _adminAddress, _flags, _domain, _metadata, _tags);
  }
  
  function removeAccount(uint256 _communityId, uint256 _accountId) public onlyOracle {
    communityData.removeAccount(_communityId, _accountId);
  }
  
  function deleteCommunity(uint256 _id) public onlyOracle {
    communityData.deleteCommunity(_id);
  }
  
  function getAccountCount(uint256 _communityId) public view returns (uint256) {
    return communityData.communityForId(_communityId).accountIds.length;
  }
  
  function setCommunityValidator(uint256 _communityId, address _address) public onlyOracle {
    communityData.setValidator(_communityId, _address);
  }

  /**
   * Account methods
   */
  function replenish(uint256 _accountId) public onlyOracle {
    trancheData.replenish(_accountId, loadMode);
  }

  function recalculateBalances(uint256 _id) public onlyOracle {
    trancheData.recalculateBalances(_id);
  }

  function availableToSpend(uint256 _id, string _tag) public onlyOracle view returns (uint256) {
    return trancheData.availableToSpend(_id, _tag);
  }
  
  function accountForId(uint256 _id) public onlyOracle view returns (uint256, uint256, address, bytes32, string, string, uint256, uint256, string, string) {
    Account memory a = accountData.accountForId(_id);
    return (a.id, a.communityId, a.userAddress, a.flags, a.metadata, a.urls, a.rewardIds.length,
            trancheData.availableToGive(a.id), trancheData.givenToJSON(a.id), trancheData.receivedToJSON(a.id));
  }
  
  function trancheTotalsForId(uint256 _id) public onlyOracle view returns (uint256, uint256) {
    return trancheData.trancheTotalsForId(_id);
  }
  
  function tranchesForId(uint256 _id, uint256 _page, uint256 _size, bool _sender) public onlyOracle view returns (string) {
    return trancheData.tranchesToJSON(_id, _page, _size, _sender);
  }
  
  function accountWithinCommunity(uint256 _communityId, uint256 _idx) public view returns (uint256, uint256, address, bytes32, string, string, uint256, uint256, string, string) {
    Community memory community = communityData.communityForId(_communityId);
    return accountForId(community.accountIds[_idx]);
  }
  
  function accountForUrl(string _url) public view returns (uint256, uint256, address, bytes32, string, string, uint256, uint256, string, string) {
    return accountForId(accountData.accountIdForUrl(_url));
  }
  
  function addNewAccount(uint256 _communityId, address _address, string _metadata, bytes32 _flags, string _url) public onlyOracle returns (uint256) {
    uint256 newAccountId = accountData.addAccount(_communityId, _address, _metadata, _flags, _url);
    communityData.addAccount(_communityId, newAccountId);
    return newAccountId;
  }
  
  function editAccount(uint256 _id, address _newAddress, string _metadata, bytes32 _flags) public onlyOracle {
    require(_id > 0);
    accountData.editAccount(_id, _newAddress, _metadata, _flags);
  }
  
  function addUrlToExistingAccount(uint256 _id, string _newUrl) public onlyOracle returns (bool) {
    Account memory account = accountData.accountForId(_id);
    require (account.id > 0);
    require (communityData.validateUrl(account, _newUrl));
    return accountData.addUrlToAccount(_id, _newUrl);
  }
  
  function removeUrlFromExistingAccount(uint256 _id, string _oldUrl) public onlyOracle {
    accountData.removeUrlFromAccount(_id, _oldUrl);
  }
  
  function deleteAccount(uint256 _id) public onlyOracle {
    Account memory account = accountData.accountForId(_id);
    removeAccount(account.communityId, _id);
    accountData.deleteAccount(_id);
  }
  
  // only works if URL list has no common sources?
  function mergeAccounts(uint256 _id1, uint256 _id2) public onlyOracle {
    accountData.mergeAccounts(_id1, _id2);
    trancheData.mergeAccounts(_id1, _id2);
  }

  /**
   * Reward methods
   */
  function addNewReward(uint256 _vendorId, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags) public onlyOracle {
    Account memory vendor = accountData.accountForId(_vendorId);
    require(vendor.id > 0);
    if (RewardCreationCost > 0) {
      trancheData.consume(_vendorId, RewardCreationCost); // throws an error if not enough
    }
    uint256 rewardId = rewardData.addReward(_vendorId, _cost, _quantity, _tag, _metadata, _flags);
    accountData.addRewardToAccount(_vendorId, rewardId);
    communityData.addRewardToCommunity(vendor.communityId, rewardId);
  }
  
  
  function rewardForId(uint256 _id) public onlyOracle view returns (uint256, uint256, uint256, uint256, uint256, bytes32, string, string)  {
    Reward memory reward = rewardData.rewardForId(_id);
    return (reward.id, reward.vendorId, reward.ownerId, reward.cost, reward.quantity, reward.flags, reward.tag, reward.metadata);
  }
  
  function editExistingReward(uint256 _id, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags) public onlyOracle {
    Reward memory reward = rewardData.rewardForId(_id);
    require (reward.id > 0 && reward.ownerId == 0);
    rewardData.editReward(_id, _cost, _quantity, _tag, _metadata, _flags);
  }

  function deleteReward(uint256 _id) public onlyOracle {
    Reward memory reward = rewardData.rewardForId(_id);
    Account memory vendor = accountData.accountForId(reward.vendorId);
    require (reward.ownerId == 0);
    accountData.deleteRewardFromAccount(reward.vendorId, reward.id);
    rewardData.deleteRewardRecord(_id);
    communityData.deleteRewardFromCommunity(vendor.communityId, _id);
  }
  
  function getRewardsCount(uint256 _id, uint256 _idType) public view onlyOracle returns (uint256) {
    if (_idType > 0) {
      Account memory account = accountData.accountForId(_id);
      return _idType == 1 ? account.rewardIds.length : account.offerIds.length;
    }
    return communityData.communityForId(_id).rewardIds.length;
  }

  function rewardByIdx(uint256 _id, uint256 _idx, uint256 _idType) public view returns (uint256, uint256, uint256, uint256, uint256, bytes32, string, string) {
    if (_idType > 0) {
      uint256 accountRewardId = _idType == 1 ? accountData.accountForId(_id).rewardIds[_idx] : accountData.accountForId(_id).offerIds[_idx];
      return rewardForId(accountRewardId);
    }
    Community memory community = communityData.communityForId(_id);
    return rewardForId(community.rewardIds[_idx]);
  }
}