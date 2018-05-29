pragma solidity 0.4.23;
pragma experimental ABIEncoderV2;

import "./Oracular.sol";
import "./YKOracle.sol";
import "./zeppelin/ownership/Ownable.sol";

contract YKStructs {
  struct Tranches {
    uint256[] amounts;
    uint256[] blocks;
    string[] tags;
    uint256 lastRecalculated;
    uint256 firstNonzero;
  }

  struct Account {
    uint256 id;
    uint256 communityId;
    address userAddress;
    string metadata;
    string[] urls;
    uint256[] rewardIds;
  }

  struct Community {
    uint256 id;
    bool isClosed;
    string domain;
    address admin;
    string metadata;
    string tags;
    uint256[] accountIds;
  }
  
  struct Vendor {
    uint256 id;
    uint256 communityId;
    address vendorAddress;
    string metadata;
    uint256[] rewardIds;
  }
  
  struct Reward {
    uint256 id;
    uint256 vendorId;
    uint256 ownerId;
    uint256 cost;
    string tag;
    string metadata;
  }
}

contract YKTranches is Ownable, YKStructs {
  mapping(uint256 => Tranches) giving;
  mapping(uint256 => Tranches) spending;
  uint256 EXPIRY_WINDOW = 691200;
  uint256 REFRESH_WINDOW = 40320;
  uint256 GIVING_AMOUNT = 100;

  function availableToGive(uint256 _id) public returns (uint256) {
    uint256 total = 0;
    recalculateGivingTranches(_id, '');
    for (uint256 i = giving[_id].firstNonzero ; i<giving[_id].amounts.length; i++) {
      total += giving[_id].amounts[i];
    }
    return total;
  }
  
  function give(uint256 _amount, uint256 _sender, uint256 _recipient, string _tags) public {
    require (_recipient > 0);
    uint256 accumulated;
    // recalculateGivingTranches(_sender, ''); always called in availableToGive
    Tranches storage available = giving[_sender];
    for (uint256 i = available.firstNonzero; i < available.amounts.length; i++) {
      if (accumulated + available.amounts[i] >= _amount) {
        available.amounts[i] = available.amounts[i] - accumulated - _amount;
        accumulated = _amount;
        break;
      } else {
        accumulated = accumulated + available.amounts[i];
        available.amounts[i] = 0;
      }
    }
    Tranches storage toAppend = spending[_recipient];
    toAppend.amounts.push(accumulated);
    toAppend.blocks.push(block.number);
    toAppend.tags.push(_tags);
  }
  
  function availableToSpend(uint256 _id, string _tag) public returns (uint256) {
    uint256 total = 0;
    recalculateSpendingTranches(_id);
    for (uint256 i = spending[_id].firstNonzero; i < spending[_id].amounts.length; i++) {
      if (tagsIncludesTag(spending[_id].tags[i], _tag)) {
        total = spending[_id].amounts[i];
      }
    }
    return total;
  }
  
  function spend(uint256 _amount, uint256 _spender, string _tag) public onlyOwner {
    uint256 accumulated;
    // recalculateSpendingTranches(_spender); always called by availableToSpend first
    Tranches storage available = spending[_spender];
    for (uint i = available.firstNonzero; i < available.amounts.length; i++) {
      if (!tagsIncludesTag(available.tags[i], _tag)) {
        continue;
      }
      if (accumulated + available.amounts[i] >= _amount) {
        available.amounts[i] = available.amounts[i] - accumulated - _amount;
        accumulated = _amount;
        break;
      } else {
        accumulated = accumulated + available.amounts[i];
        available.amounts[i] = 0;
      }
    }
  }
  
  function replenish(uint256 _accountId) public onlyOwner {
    Tranches storage recipient = giving[_accountId];
    recipient.blocks.push(block.number);
    recipient.amounts.push(100);
  }
  
  function recalculateGivingTranches(uint256 _id, string _tags) public onlyOwner {
    Tranches storage available = giving[_id];
    if (available.blocks.length == 0) {
      return;
    }
    uint256 cutoffBlock = block.number - EXPIRY_WINDOW;
    for (uint256 i = available.firstNonzero; i < available.blocks.length; i++ ) {
      if (available.blocks[i] < cutoffBlock) {
        available.amounts[i] = 0;
        available.firstNonzero = i;
      }
    }
    uint256 lastBlock = available.blocks[available.blocks.length - 1];
    // only add new giving coins when we know their tags
    if (bytes(_tags).length > 0 && block.number - lastBlock > REFRESH_WINDOW) {
      available.blocks.push(lastBlock + REFRESH_WINDOW);
      available.amounts.push(GIVING_AMOUNT);
      available.tags.push(_tags);
    }
    available.lastRecalculated = block.number;
  }

  function recalculateSpendingTranches(uint256 _id) public onlyOwner {
    Tranches storage available = spending[_id];
    if (available.blocks.length == 0) {
      return;
    }
    for (uint256 i = available.firstNonzero; i < available.blocks.length;  i++ ) {
      uint256 age = available.blocks[i];
      if (available.lastRecalculated - age < EXPIRY_WINDOW && block.number - age >= EXPIRY_WINDOW) {
        if (available.amounts[i] == 1) {
          available.amounts[i] = 0;
        } else {
          available.amounts[i] = available.amounts[i] / uint256(2);
        }
        if (available.amounts[i] == 0 && i == available.firstNonzero + 1) {
          available.firstNonzero = i;
        }
      }
    }
    available.lastRecalculated = block.number;
  }
  
  function tagsIncludesTag(string _tags, string _tag) public pure returns (bool) {
    // TODO
    return true;
  }
}

contract YKAccounts is Ownable, YKStructs {
  mapping(uint256 => Account) accounts;
  mapping(string => uint256) accountsByUrl;
  mapping(address => uint256) accountsByAddress;
  mapping(uint256 => uint256) personas;
  uint256 maxAccountId;
  
  function accountForAddress(address _address) public onlyOwner view returns (Account) {
    uint256 accountId = accountsByAddress[_address];
    return accounts[accountId];
  }

  function accountForUrl(string _url) public onlyOwner returns (Account) {
    uint256 accountId = accountsByUrl[_url];
    if (accountId > 0) {
      // is this an account in the system?
      return accounts[accountId];
    } else {
      // this is a new account
      // TODO check valid and well-formed URL
      Account memory newAccount = Account({
        id: maxAccountId + 1,
        metadata:'',
        userAddress:0,
        communityId:0,
        urls:new string[](0),
        rewardIds: new uint256[](0)
      });
      addUrlToAccount(newAccount.id, _url);
      maxAccountId += 1;
      return newAccount;
    }
  }
  
  function addAccount(Account account) public onlyOwner returns (uint256) {
    account.id = maxAccountId + 1;
    accounts[account.id] = account;
    for (uint256 i; i< account.urls.length; i++) {
      // TODO check well-formed / valid URL
      accountsByUrl[account.urls[i]] = account.id;
    }
    maxAccountId += 1;
    return maxAccountId;
  }
  
  function addUrlToAccount(uint256 _accountId, string _url) public onlyOwner {
    accounts[_accountId].urls.push(_url);
    accountsByUrl[_url] = _accountId;
  }

  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOwner {
    accounts[_spenderId].rewardIds.push(_rewardId);
  }
}

contract YKCommunities is Ownable, YKStructs {
  mapping(uint256 => Community) communities;
  uint256 public maxCommunityId;
  
  function communityForId(uint256 _id) public onlyOwner view returns (Community) {
    return communities[_id];
  }
  
  function addCommunity(Community community) public onlyOwner {
    community.id = maxCommunityId + 1;
    communities[community.id] = community;
    maxCommunityId += 1;
  }
  
  function addAccount(uint256 _communityId, uint256 _accountId) public onlyOwner {
    communities[_communityId].accountIds.push(_accountId);
  }
  
  function setTags(uint256 _communityId, string _tags) public onlyOwner {
    communities[_communityId].tags = _tags;
  }
}

contract YKVendors is Ownable, YKStructs {
  mapping(uint256 => Vendor) vendors;
  mapping(address => uint256) vendorsByAddress;
  uint256 maxVendorId;
  
  mapping(uint256 => Reward) rewards;
  uint256 maxRewardId;

  function vendorForId(uint256 _id) public onlyOwner view returns (Vendor) {
    return vendors[_id];
  }
  
  function addVendor(Vendor vendor) public onlyOwner {
    vendor.id = maxVendorId + 1;
    vendors[vendor.id] = vendor;
    if (vendor.vendorAddress > 0) {
      vendorsByAddress[vendor.vendorAddress] = vendor.id;
    }
    maxVendorId += 1;
  }
  
  function rewardForId(uint256 _id) public onlyOwner view returns (Reward) {
    return rewards[_id];
  }
  
  function addReward(Reward reward) public onlyOwner {
    reward.id = maxRewardId + 1;
    rewards[reward.id] = reward;
    maxRewardId += 1;
    vendors[reward.vendorId].rewardIds.push(reward.id);
  }
  
  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOwner {
    rewards[_rewardId].ownerId = _spenderId;
  }
}

contract YKarma is Oracular, YKStructs {

  YKTranches trancheData;
  YKAccounts accountData;
  YKCommunities communityData;
  YKVendors vendorData;

  constructor() public Oracular() {
  }
  
  function updateTrancheContract(YKTranches _tranches) onlyOracle external {
    trancheData = _tranches;
  }

  function updateAccountsContract(YKAccounts _accounts) onlyOracle external {
    accountData = _accounts;
  }

  function updateCommunitiesContract(YKCommunities _communities) onlyOracle external {
    communityData = _communities;
  }

  function updateVendorsContract(YKVendors _vendors) onlyOracle external {
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

  function addCommunity(address _admin, string _domain, string _metadata) onlyOracle public {
    Community memory community = Community({
      id: 0,
      admin: _admin,
      domain: _domain,
      metadata: _metadata,
      tags: "",
      isClosed: true,
      accountIds: new uint256[](0)
    });
    communityData.addCommunity(community);
  }
  
  function setTags(uint256 _communityId, string _tags) public {
    Community memory community = communityData.communityForId(_communityId);
    require (community.admin == msg.sender || senderIsOracle());
    communityData.setTags(_communityId, _tags);
  }
  
  function addAccount(uint256 _communityId, string _url, string _metadata) public {
    Community memory community = communityData.communityForId(_communityId);
    require (community.admin == msg.sender || senderIsOracle());
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
