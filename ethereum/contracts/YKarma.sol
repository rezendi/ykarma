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
  
  function updateContract(address _address, uint256 idx) onlyOracle public {
    if (idx==1) {
      trancheData = YKTranches(_address);
    }
    if (idx==2) {
      accountData = YKAccounts(_address);
    }
    if (idx==3) {
      communityData = YKCommunities(_address);
    }
    if (idx==4) {
      rewardData = YKRewards(_address);
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

  function give(uint256 _giverId, uint256 _communityId, string _url, uint256 _amount, string _message) public onlyOracle {
    require (_giverId > 0 && _communityId > 0 && _amount > 0);
    Account memory giver = accountData.accountForId(_giverId);
    require (communityData.validateGive(giver, _communityId, _url, _message));
    uint256 available = trancheData.availableToGive(_giverId);
    require (available >= _amount);
    Community memory community = communityData.communityForId(_communityId);
    Account memory recipient = accountData.accountForId(accountData.accountIdForUrl(_url));
    if (recipient.id == 0) {
      recipient = accountData.accountForId(addNewAccount(community.id, 0, '', 0x1, _url)); // 0x1 to mark account created by giving
    }
    trancheData.performGive(giver, recipient, _amount, community.tags, _message);
  }

  function purchase(uint256 _buyerId, uint256 _rewardId, uint256 _communityId) public onlyOracle {
    Reward memory reward = rewardData.rewardForId(_rewardId);
    require(_buyerId > 0 && reward.ownerId == 0); // for now
    Account memory buyer = accountData.accountForId(_buyerId);
    require (communityData.validatePurchase(buyer, _communityId, reward));
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
  
  function addEditCommunity(uint256 _id, address _adminAddress, bytes32 _flags, string _domain, string _metadata, string _tags) public onlyOracle {
    if (_id == 0) {
      communityData.addCommunity(_adminAddress, _flags, _domain, _metadata, _tags);
    } else {
      communityData.editCommunity(_id, _adminAddress, _flags, _domain, _metadata, _tags);
    }
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
  
  function accountForId(uint256 _id) public onlyOracle view returns (uint256, string, address, bytes32, string, string, uint256, uint256, string, string) {
    Account memory a = accountData.accountForId(_id);
    return (a.id, accountData.communityIds(a.id), a.userAddress, a.flags, a.metadata, a.urls, a.rewardIds.length,
            trancheData.availableToGive(a.id), trancheData.givenToJSON(a.id), trancheData.receivedToJSON(a.id));
  }
  
  function trancheTotalsForId(uint256 _id) public onlyOracle view returns (uint256, uint256) {
    return trancheData.trancheTotalsForId(_id);
  }
  
  function tranchesForId(uint256 _id, uint256 _page, uint256 _size, bool _sender) public onlyOracle view returns (string) {
    return trancheData.tranchesToJSON(_id, _page, _size, _sender);
  }
  
  function accountWithinCommunity(uint256 _communityId, uint256 _idx) public view returns (uint256, string, address, bytes32, string, string, uint256, uint256, string, string) {
    Community memory community = communityData.communityForId(_communityId);
    return accountForId(community.accountIds[_idx]);
  }
  
  function accountForUrl(string _url) public view returns (uint256, string, address, bytes32, string, string, uint256, uint256, string, string) {
    return accountForId(accountData.accountIdForUrl(_url));
  }
  
  function addNewAccount(uint256 _communityId, address _address, string _metadata, bytes32 _flags, string _url) public onlyOracle returns (uint256) {
    uint256 newAccountId = accountData.addAccount(_communityId, _address, _metadata, _flags, _url);
    communityData.addAccount(_communityId, newAccountId);
    return newAccountId;
  }
  
  function editAccount(uint256 _id, address _newAddress, string _metadata, bytes32 _flags) public onlyOracle {
    accountData.editAccount(_id, _newAddress, _metadata, _flags);
  }
  
  function addUrlToExistingAccount(uint256 _id, string _newUrl) public onlyOracle returns (bool) {
    return accountData.addUrlToExistingAccount(_id, _newUrl);
  }
  
  function removeUrlFromExistingAccount(uint256 _id, string _oldUrl) public onlyOracle {
    accountData.removeUrlFromAccount(_id, _oldUrl);
  }
  
  function deleteAccount(uint256 _id) public onlyOracle {
    Account memory account = accountData.accountForId(_id);
    for (uint i=0; i< account.communityIds.length; i++) {
      communityData.removeAccount(account.communityIds[i], _id);
    }
    accountData.deleteAccount(_id);
  }
  
  // Merges account 1 into account 2, basically zeroes out account 1
  // only works if URL list has no common sources
  function mergeAccounts(uint256 _id1, uint256 _id2) public onlyOracle {
    accountData.merge(_id1, _id2);
    trancheData.mergeAccounts(_id1, _id2);
    rewardData.mergeAccounts(_id1, _id2);
  }

  /**
   * Reward methods
   */
  function addNewReward(uint256 _vendorId, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags) public onlyOracle {
    if (RewardCreationCost > 0) {
      trancheData.consume(_vendorId, RewardCreationCost); // throws an error if not enough
    }
    uint256 rewardId = rewardData.addReward(_vendorId, _cost, _quantity, _tag, _metadata, _flags);
    accountData.addRewardToAccount(_vendorId, rewardId);
  }
  
  function rewardForId(uint256 _id) public onlyOracle view returns (uint256, uint256, uint256, uint256, uint256, bytes32, string, string)  {
    Reward memory reward = rewardData.rewardForId(_id);
    return (reward.id, reward.vendorId, reward.ownerId, reward.cost, reward.quantity, reward.flags, reward.tag, reward.metadata);
  }
  
  function editExistingReward(uint256 _id, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags) public onlyOracle {
    rewardData.editReward(_id, _cost, _quantity, _tag, _metadata, _flags);
  }

  function deleteReward(uint256 _id) public onlyOracle {
    Reward memory reward = rewardData.rewardForId(_id);
    require (reward.ownerId == 0);
    accountData.deleteRewardFromAccount(reward.vendorId, reward.id);
    rewardData.deleteRewardRecord(_id);
  }
  
  // this has evolved to become very hack-y and should be refactored
  function getRewardsCount(uint256 _id, uint256 _idType) public view onlyOracle returns (uint256) {
    if (_idType > 0) {
      Account memory account = accountData.accountForId(_id);
      return _idType == 1 ? account.rewardIds.length : account.offerIds.length;
    }
    return rewardData.getMaxRewardId();
  }

  // this has evolved to become very hack-y and should be refactored
  function rewardByIdx(uint256 _id, uint256 _idx, uint256 _idType) public view returns (uint256, uint256, uint256, uint256, uint256, bytes32, string, string) {
    if (_idType > 0) {
      uint256 accountRewardId = _idType == 1 ? accountData.accountForId(_id).rewardIds[_idx] : accountData.accountForId(_id).offerIds[_idx];
      return rewardForId(accountRewardId);
    }
    return rewardForId(_id);
  }
}