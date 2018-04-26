pragma solidity 0.4.23;
pragma experimental ABIEncoderV2;

import "./YKOracle.sol";
import "./zeppelin/ownership/Ownable.sol";

contract YKStructs {
  struct Tranches {
    uint256[] amounts;
    uint256[] blocks;
    string[] tags;
    uint256 lastRecalculated;
  }

  struct Account {
    uint256 id;
    uint256 communityId;
    address userAddress;
    string email;
    string phone;
    string metadata;
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
    string name;
    string metadata;
  }
  
  struct Reward {
    uint256 id;
    uint256 vendorId;
    uint256 cost;
    string name;
    string metadata;
  }
}

contract YKTranches is Ownable, YKStructs {
  mapping(uint256 => Tranches) giving;
  mapping(uint256 => Tranches) spending;

  function transfer(uint256 _amount, uint256 _sender, uint256 _recipient, string _tags) public {
    require (_recipient > 0);
    uint256 accumulated;
    recalculateGivingTranches(_sender);
    Tranches storage available = giving[_sender];
    for (uint i; i < available.amounts.length; i++) {
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
    recalculateSpendingTranches(_recipient);
  }
  
  function availableToGive(uint256 _id) public returns (uint256) {
    recalculateGivingTranches(_id);
    uint256 total = 0;
    for (uint256 i; i<giving[_id].amounts.length; i++) {
      total += giving[_id].amounts[i];
    }
    return total;
  }
  
  function replenish(uint256 _accountId) external onlyOwner {
    Tranches storage recipient = giving[_accountId];
    recipient.blocks.push(block.number);
    recipient.amounts.push(100);
  }
  
  function recalculateGivingTranches(uint256 _id) public onlyOwner {
    // Tranches storage available = giving[_address];
    // expire old ones if lastRecalculated is old enough
  }

  function recalculateSpendingTranches(uint256 _id) public onlyOwner {
    // Tranches storage available = spending[_address];
    // make the demurrage happen if lastRecalculated is old enough
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
      // TODO check url, if it's email or phone ascribe accordingly
      Account memory newAccount = Account({id: maxAccountId + 1, metadata:_url, userAddress:0, communityId:0, email:"", phone:""});
      accounts[newAccount.id] = newAccount;
      accountsByUrl[_url] = newAccount.id;
      maxAccountId += 1;
      return newAccount;
    }
  }
  
  function addAccount(Account account) {
    account.id = maxAccountId + 1;
    accounts[account.id] = account;
    if (bytes(account.email).length > 0) { // TODO check well-formed email URL
      accountsByUrl[account.email] = account.id;
    }
    if (bytes(account.phone).length > 0) { // TODO check well-formed phone URL
      accountsByUrl[account.phone] = account.id;
    }
    maxAccountId += 1;
  }
}

contract YKCommunities is Ownable, YKStructs {
  mapping(uint256 => Community) communities;
  uint256 maxCommunityId;
  
  function communityForId(uint256 _id) public onlyOwner view returns (Community) {
    return communities[_id];
  }
  
  function addCommunity(Community community) public onlyOwner {
    community.id = maxCommunityId + 1;
    communities[community.id] = community;
    maxCommunityId += 1;
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
  mapping(uint256 => Reward) redeemedRewards;
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
  
  function addReward(Reward reward) public onlyOwner {
    reward.id = maxRewardId + 1;
    rewards[reward.id] = reward;
    maxRewardId += 1;
  }
}

contract Oracular {
  address[] oracles;

  modifier onlyOracle() {
    require (senderIsOracle());
    _;
  }

  constructor() public {
    oracles.push(msg.sender);
  }

  event OracleAdded(address indexed oracleAddress);

  function senderIsOracle() public view returns (bool){
    for (uint i; i < oracles.length; i++) {
      if (msg.sender == oracles[i]) {
        return true;
      }
    }
    return false;
  }

  function addOracle(address newOracle) public onlyOracle {
    require(newOracle != address(0));
    oracles.push(newOracle);
    emit OracleAdded(newOracle);
  }

}

contract YKarma is Oracular, YKStructs {

  YKTranches trancheData;
  YKAccounts accountData;
  YKCommunities communityData;
  YKVendors vendorData;

  // after YKarma is created, ownership of these contracts must be transferred to it, obviously
  constructor(YKTranches _tranches, YKAccounts _accounts, YKCommunities _communities, YKVendors _vendors) public Oracular() {
    trancheData = _tranches;
    accountData = _accounts;
    communityData = _communities;
    vendorData = _vendors;
  }

  function give(uint256 _amount, string _url) public {
    Account memory giver = accountData.accountForAddress(msg.sender);
    uint256 available = trancheData.availableToGive(giver.id);
    require (available >= _amount);
    Community memory community = communityData.communityForId(giver.communityId);
    Account memory receiver = accountData.accountForUrl(_url);
    trancheData.transfer(_amount, giver.id, receiver.id, community.tags);
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
  
  function addAccount(uint256 _communityId, string _email, string _phone, string _metadata) public {
    Community memory community = communityData.communityForId(_communityId);
    require (community.admin == msg.sender || senderIsOracle());
    Account memory account = Account({id:0, metadata:_metadata, userAddress:0, communityId:_communityId, email:_email, phone:_phone});
    accountData.addAccount(account);
  }
  
  function addVendor(uint256 _communityId, string _name, string _metadata, address _address) {
    Vendor memory vendor = Vendor({id:0, communityId:_communityId, name:_name, metadata:_metadata, vendorAddress:_address});
    vendorData.addVendor(vendor);
  }

  function addReward(uint256 _vendorId, uint256 _cost, string _name, string _metadata) {
    Vendor memory vendor = vendorData.vendorForId(_vendorId);
    require (vendor.vendorAddress == msg.sender || senderIsOracle());
    Reward memory reward = Reward({id:0, vendorId:_vendorId, cost:_cost, name:_name, metadata:_metadata});
    vendorData.addReward(reward);
  }

  // TODO:
  // redeeming
  // replenishment
  // demurrage
  // web interface
  // deploy to rinkeby
  
}
