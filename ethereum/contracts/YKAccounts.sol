pragma solidity 0.4.23;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./YKStructs.sol";

contract YKAccounts is Ownable, YKStructs {
  using strings for *;
  uint256 maxAccountId;
  mapping(uint256 => Account) accounts;
  mapping(string => uint256) accountsByUrl;
  mapping(address => uint256) accountsByAddress;
  
  function accountForId(uint256 _id) public onlyOwner view returns (Account) {
    return accounts[_id];
  }

  function accountIdForAddress(address _address) public onlyOwner view returns (uint256) {
    return accountsByAddress[_address];
  }

  function accountIdForUrl(string _url) public onlyOwner view returns (uint256) {
    return accountsByUrl[_url];
  }
  
  function addAccount(Account account, string _url) public onlyOwner returns (uint256) {
    account.id = maxAccountId + 1;
    require(urlIsValid(_url));
    accounts[account.id] = account;
    addUrlToAccount(account.id, _url); // will fail if url invalid, without affecting storage
    maxAccountId += 1;
    return maxAccountId;
  }
  
  function addUrlToAccount(uint256 _accountId, string _url) public onlyOwner returns (bool) {
    require(urlIsValid(_url));
    string memory urls = accounts[_accountId].urls;
    if (bytes(urls).length > 0) {
      string memory commaUrl = ",".toSlice().concat(_url.toSlice());
      accounts[_accountId].urls = urls.toSlice().concat(commaUrl.toSlice());
    } else {
      accounts[_accountId].urls = _url;
    }
    accountsByUrl[_url] = _accountId;
    return true;
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
    // TODO FIXME delete other mappings
  }

  // TODO
  function urlIsValid(string _url) public pure returns (bool) {
    return bytes(_url).length > 0;
  }

  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOwner {
    accounts[_spenderId].rewardIds.push(_rewardId);
  }
}

