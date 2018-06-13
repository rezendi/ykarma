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
import "./YKVendors.sol";

contract YKarma is Oracular, YKStructs {

  YKTranches trancheData;
  YKAccounts accountData;
  YKCommunities communityData;
  YKVendors vendorData;

  constructor(YKTranches _tranches, YKAccounts _accounts, YKCommunities _communities, YKVendors _vendors) public Oracular() {
    trancheData = _tranches;
    accountData = _accounts;
    communityData = _communities;
    vendorData = _vendors;
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

  function updateVendorsContract(YKVendors _vendors) onlyOracle public {
    vendorData = _vendors;
  }

  function give(uint256 _amount, string _url) public {
    Account memory giver = accountData.accountForAddress(msg.sender);
    uint256 available = trancheData.availableToGive(giver.id);
    require (available >= _amount);
    Community memory community = communityData.communityForId(giver.communityId);
    Account memory receiver = accountData.accountForUrl(_url);
    trancheData.give(_amount, giver.id, receiver.id, community.tags);
  }

  // TODO make rewards resellable?
  function spend(uint256 _rewardId) public {
    Reward memory reward = vendorData.rewardForId(_rewardId);
    require(reward.ownerId == 0); // reward can't already have been redeemed, for now at least
    Account memory spender = accountData.accountForAddress(msg.sender);
    uint256 available = trancheData.availableToSpend(spender.id, reward.tag);
    require (available >= reward.cost);
    trancheData.spend(spender.id, reward.cost, reward.tag);
    vendorData.redeem(spender.id, reward.id);
    accountData.redeem(spender.id, reward.id);
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
  
  function communityForId(uint256 _id) public view returns (uint256, address, bool, string, string, uint256) {
    Community memory c = communityData.communityForId(_id);
    return (c.id, c.adminAddress, c.isClosed, c.domain, c.metadata, c.accountIds.length);
  }
  
  function addCommunity(address _adminAddress, bool _isClosed, string _domain, string _metadata, string _tags) onlyOracle public {
    Community memory community = Community({
      id:           0,
      isClosed:     _isClosed,
      adminAddress: _adminAddress,
      domain:       _domain,
      metadata:     _metadata,
      tags:         _tags,
      accountIds:   new uint256[](0)
    });
    communityData.addCommunity(community);
  }
  
  function editCommunity(uint256 _id, address _adminAddress, bool _isClosed, string _domain, string _metadata, string _tags) public {
    Community memory community = communityData.communityForId(_id);
    require (community.adminAddress == msg.sender || senderIsOracle());
    Community memory newCommunity = Community({
      id: 0,
      isClosed: _isClosed,
      adminAddress: _adminAddress,
      domain: _domain,
      metadata: _metadata,
      tags: _tags,
      accountIds: new uint256[](0)
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
  
  function accountForId(uint256 _id) public view returns (uint256, uint256, address, string, string, uint256) {
    Account memory a = accountData.accountForId(_id);
    return (a.id, a.communityId, a.userAddress, a.metadata, a.urls, a.rewardIds.length);
  }
  
  function addNewAccount(uint256 _communityId, address _address, string _metadata, string _url) public {
    Community memory community = communityData.communityForId(_communityId);
    require (community.adminAddress == msg.sender || senderIsOracle());
    Account memory account = Account({
      id:           0,
      communityId:  _communityId,
      userAddress:  _address,
      metadata:     _metadata,
      urls:         '',
      rewardIds:    new uint256[](0)
    });
    uint256 newAccountId = accountData.addAccount(account, _url);
    if (_communityId > 0 ) {
      communityData.addAccount(_communityId, newAccountId);
    }
  }
  
  function editAccount(uint256 _id, address _newAddress, string _metadata) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender || senderIsOracle());
    Account memory newAccount = Account({
      id:           _id,
      communityId:  account.communityId, // edited elsewhere
      userAddress:  _newAddress,
      metadata:     _metadata,
      urls:         account.urls,  // edited elsewhere
      rewardIds:    new uint256[](0)
    });
    accountData.editAccount(_id, newAccount);
  }
  
  function addUrlToAccount(uint256 _id, string _newUrl) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender || senderIsOracle());
    accountData.addUrlToAccount(_id, _newUrl);
  }
  
  function removeUrlFromAccount(uint256 _id, string _newUrl) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender || senderIsOracle());
    accountData.removeUrlFromAccount(_id, _newUrl);
  }
  
  function deleteAccount(uint256 _id) public {
    Account memory account = accountData.accountForId(_id);
    require (account.userAddress == msg.sender || senderIsOracle());
    removeAccount(account.communityId, _id);
    accountData.deleteAccount(_id);
  }
  
  /**
   * Vendor methods
   */
  function addVendor(uint256 _communityId, string _metadata, address _address) onlyOracle public {
    Vendor memory vendor = Vendor({
      id: 0,
      communityId:_communityId,
      metadata:_metadata,
      vendorAddress:_address,
      rewardIds: new uint256[](0)
    });
    vendorData.addVendor(vendor);
  }

  /**
   * Reward methods
   */
  function addReward(uint256 _vendorId, uint256 _cost, string _tag, string _metadata) public {
    Vendor memory vendor = vendorData.vendorForId(_vendorId);
    require (vendor.vendorAddress == msg.sender || senderIsOracle());
    Reward memory reward = Reward({id:0, vendorId:_vendorId, ownerId:0, cost:_cost, tag:_tag, metadata:_metadata});
    vendorData.addReward(reward);
  }
}
