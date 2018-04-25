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
    string email;
    string phone;
    string metadata;
  }

  struct Community {
    uint256 id;
    string domain;
    address admin;
    string metadata;
    string tags;
    address[] accountAddresses;
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
  mapping(address => Account) accounts;
  mapping(string => address) accountsByUrl;
  mapping(string => Account) newAccounts;
  mapping(uint256 => uint256) personas;
  uint256 maxAccountId;
  
  function accountForAddress(address _address) public onlyOwner view returns (Account) {
    return accounts[_address];
  }

  function accountForUrl(string _url) public onlyOwner returns (Account) {
    address accountAddress = accountsByUrl[_url];
    if (accountAddress > 0) {
      // is this an account in the system?
      return accounts[accountAddress];
    } else {
      // is this a new account who's already received coins?
      Account memory existingRecipient = newAccounts[_url];
      if (existingRecipient.id > 0) {
        return existingRecipient;
      }
      // no, this account is brand new
      Account memory newAccount = Account({id: maxAccountId + 1, metadata:_url, communityId:0, email:"", phone:""});
      newAccounts[_url] = newAccount;
      maxAccountId += 1;
      return newAccount;
    }
  }
}

contract YKCommunities is Ownable, YKStructs {
  mapping(uint256 => Community) communities;
  uint256 maxCommunityId;
  
  function communityForId(uint256 _id) public onlyOwner view returns (Community) {
    return communities[_id];
  }
}

contract Oracular {
  address[] oracles;

  modifier onlyOracle() {
    bool found = false;
    for (uint i; i < oracles.length; i++) {
      if (msg.sender == oracles[i]) {
        found = true;
      }
    }
    require(found);
    _;
  }

  constructor() public {
    oracles.push(msg.sender);
  }

  event OracleAdded(address indexed oracleAddress);

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

  // after YKarma is created, ownership of these contracts must be transferred to it, obviously
  constructor(YKTranches _tranches, YKAccounts _accounts, YKCommunities _communities) public Oracular() {
    trancheData = _tranches;
    accountData = _accounts;
    communityData = _communities;
  }

  function giveToUrl(uint256 _amount, string _url) public {
    Account memory giver = accountData.accountForAddress(msg.sender);
    uint256 available = trancheData.availableToGive(giver.id);
    require (available >= _amount);
    Community memory community = communityData.communityForId(giver.communityId);
    Account memory receiver = accountData.accountForUrl(_url);
    trancheData.transfer(_amount, giver.id, receiver.id, community.tags);
  }
  
}
