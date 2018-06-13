pragma solidity 0.4.23;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./YKStructs.sol";

contract YKAccounts is Ownable, YKStructs {
  using strings for *;
  mapping(uint256 => Account) accounts;
  mapping(string => uint256) accountsByUrl;
  mapping(address => uint256) accountsByAddress;
  mapping(uint256 => uint256) personas;
  uint256 maxAccountId;
  
  function accountForId(uint256 _id) public onlyOwner view returns (Account) {
    return accounts[_id];
  }

  function accountForAddress(address _address) public onlyOwner view returns (Account) {
    uint256 accountId = accountsByAddress[_address];
    return accounts[accountId];
  }

  function accountForUrl(string _url) public onlyOwner view returns (Account) {
    uint256 accountId = accountsByUrl[_url];
    if (accountId > 0) {
      // is this an account in the system?
      return accounts[accountId];
    } else {
      return accounts[0];
    }
  }
  
  // TODO address mapping, handling
  function addAccount(Account account, string _url) public onlyOwner returns (uint256) {
    account.id = maxAccountId + 1;
    require(addUrlToAccount(account.id, _url)); // will fail if url invalid, without affecting storage 
    accounts[account.id] = account;
    maxAccountId += 1;
    return maxAccountId;
  }
  
  function addUrlToAccount(uint256 _accountId, string _url) public onlyOwner returns (bool) {
    require(urlIsValid(_url));
    strings.slice[] memory slices = new strings.slice[](2);
    slices[0] = accounts[_accountId].urls.toSlice();
    slices[1] = _url.toSlice();
    strings.slice memory delimiter = ",".toSlice();
    accounts[_accountId].urls = delimiter.join(slices);
    accountsByUrl[_url] = _accountId;
  }
  
  function editAccount(uint256 _id, Account _newValues) public onlyOwner {
    accounts[_id].userAddress = _newValues.userAddress;
    accounts[_id].metadata    = _newValues.metadata;
  }

  function removeUrlFromAccount(uint256 _id, string _newUrl) public onlyOwner returns (bool) {
    // TODO FIXME remove only selected url!
    accounts[_id].urls = '';
    accountsByUrl[_newUrl] = 0;
    return true;
  }

  function deleteAccount(uint256 _id) public onlyOwner {
    delete accounts[_id];
    // TODO delete other mappings
  }

  // TODO
  function urlIsValid(string _url) public pure returns (bool) {
    return bytes(_url).length > 0;
  }

  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOwner {
    accounts[_spenderId].rewardIds.push(_rewardId);
  }
}

