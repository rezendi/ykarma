pragma solidity 0.4.23;
pragma experimental ABIEncoderV2;

import "./zeppelin/ownership/Ownable.sol";
import "./YKStructs.sol";

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

