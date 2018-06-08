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

  function getCommunityCount() public view returns (uint256) {
    return communityData.maxCommunityId();
  }
  
  function communityForId(uint256 _id) public view returns (Community) {
    return communityData.communityForId(_id);
  }
  
  function addCommunity(address _adminAddress, bool _isClosed, string _domain, string _metadata, string _tags) onlyOracle public returns (uint256) {
    Community memory community = Community({
      id: 0,
      isClosed: _isClosed,
      adminAddress: _adminAddress,
      domain: _domain,
      metadata: _metadata,
      tags: _tags,
      accountIds: new uint256[](0)
    });
    return communityData.addCommunity(community);
  }
  
  function setTags(uint256 _communityId, string _tags) public {
    Community memory community = communityData.communityForId(_communityId);
    require (community.adminAddress == msg.sender || senderIsOracle());
    communityData.setTags(_communityId, _tags);
  }
  
  function addAccount(uint256 _communityId, string _url, string _metadata) public {
    Community memory community = communityData.communityForId(_communityId);
    require (community.adminAddress == msg.sender || senderIsOracle());
    Account memory account = Account({
      id:0,
      metadata:_metadata,
      userAddress:0,
      communityId:_communityId,
      urls:new string[](0),
      rewardIds: new uint256[](0)
    });
    uint256 newAccountId = accountData.addAccount(account);
    accountData.addUrlToAccount(newAccountId, _url);
    if (_communityId > 0 ) {
      communityData.addAccount(_communityId, newAccountId);
    }
  }
  
  function addVendor(uint256 _communityId, string _metadata, address _address) onlyOracle public {
    Vendor memory vendor = Vendor({
      id:0,
      communityId:_communityId,
      metadata:_metadata,
      vendorAddress:_address,
      rewardIds: new uint256[](0)
    });
    vendorData.addVendor(vendor);
  }

  function addReward(uint256 _vendorId, uint256 _cost, string _tag, string _metadata) public {
    Vendor memory vendor = vendorData.vendorForId(_vendorId);
    require (vendor.vendorAddress == msg.sender || senderIsOracle());
    Reward memory reward = Reward({id:0, vendorId:_vendorId, ownerId:0, cost:_cost, tag:_tag, metadata:_metadata});
    vendorData.addReward(reward);
  }
  
  // TODO:
  // deploy to rinkeby
  
}
