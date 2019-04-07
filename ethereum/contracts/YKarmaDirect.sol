pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./Oracular.sol";
import "./YKStructs.sol";
import "./YKTranches.sol";
import "./YKAccounts.sol";
import "./YKCommunities.sol";
import "./YKRewards.sol";

// For direct on-chain access for sophisticated community admins and users

contract YKarmaDirect is Oracular, YKStructs {

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
  
  function give(string _url, uint256 _communityId, uint256 _amount, string _message) public {
    uint256 giverId = accountData.accountIdForAddress(msg.sender);
    Account memory giver = accountData.accountForId(giverId);
    uint256 available = trancheData.availableToGive(giverId);
    require (available >= _amount);
    Community memory community = communityData.communityForId(_communityId);
    Account memory recipient = accountData.accountForId(accountData.accountIdForUrl(_url));
    require (recipient.id != 0);
    trancheData.performGive(giver, recipient, _amount, community.tags, _message);
  }

  function buy(uint256 _rewardId) public {
    uint256 buyerId = accountData.accountIdForAddress(msg.sender);
    Reward memory reward = rewardData.rewardForId(_rewardId);
    require(reward.ownerId == 0); // for now
    trancheData.spend(buyerId, reward.cost, reward.tag);
    uint256 redeemedId = rewardData.redeem(buyerId, reward.id);
    accountData.redeem(buyerId, redeemedId, reward.vendorId, reward.quantity > 1);
  }

  function editExistingCommunity(uint256 _id, address _adminAddress, bytes32 _flags, string _domain, string _metadata, string _tags) public {
    Community memory community = communityData.communityForId(_id);
    require (community.adminAddress == msg.sender);
    communityData.editCommunity(_id, _adminAddress, _flags, _domain, _metadata, _tags);
  }

  function removeAccount(uint256 _communityId, uint256 _accountId) public {
    Community memory community = communityData.communityForId(_communityId);
    require (community.adminAddress == msg.sender);
    communityData.removeAccount(_communityId, _accountId);
  }
  
  function editAccount(uint256 _id, address _newAddress, string _metadata, bytes32 _flags) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender);
    accountData.editAccount(_id, _newAddress, _metadata, _flags);
  }
  
  function addUrlToExistingAccount(uint256 _id, string _newUrl) public returns (bool) {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender);
    return accountData.addUrlToAccount(_id, _newUrl);
  }
  
  function removeUrlFromExistingAccount(uint256 _id, string _oldUrl) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender);
    accountData.removeUrlFromAccount(_id, _oldUrl);
  }
  
  function deleteAccount(uint256 _id) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender);
    for (uint i=0; i< account.communityIds.length; i++) {
      removeAccount(account.communityIds[i], _id);
    }
    accountData.deleteAccount(_id);
  }
  
  function addNewReward(uint256 _vendorId, uint256 _communityId, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags) public {
    Account memory vendor = accountData.accountForId(_vendorId);
    require (vendor.userAddress == msg.sender);
    uint256 rewardId = rewardData.addReward(_vendorId, _cost, _quantity, _tag, _metadata, _flags);
    accountData.addRewardToAccount(_vendorId, rewardId);
    communityData.addRewardToCommunity(_communityId, rewardId);
  }
  
  function rewardForId(uint256 _id) public view returns (uint256, uint256, uint256, uint256, uint256, bytes32, string, string) {
    Reward memory reward = rewardData.rewardForId(_id);
    if (reward.ownerId != 0) {
      Account memory account = accountData.accountForId(reward.ownerId);
      require (account.userAddress == msg.sender);
    }
    return (reward.id, reward.vendorId, reward.ownerId, reward.cost, reward.quantity, reward.flags, reward.tag, reward.metadata);
  }
  
  function editExistingReward(uint256 _id, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags) public {
    Reward memory reward = rewardData.rewardForId(_id);
    require (reward.ownerId == 0);
    Account memory account = accountData.accountForId(reward.vendorId);
    require (account.userAddress == msg.sender);
    rewardData.editReward(_id, _cost, _quantity, _tag, _metadata, _flags);
  }

  function deleteReward(uint256 _id, uint256 _communityId) public {
    Reward memory reward = rewardData.rewardForId(_id);
    Account memory vendor = accountData.accountForId(reward.vendorId);
    require (reward.ownerId == 0 && (vendor.userAddress == msg.sender));
    accountData.deleteRewardFromAccount(reward.vendorId, reward.id);
    rewardData.deleteRewardRecord(_id);
    communityData.deleteRewardFromCommunity(_communityId, _id);
  }
  
}