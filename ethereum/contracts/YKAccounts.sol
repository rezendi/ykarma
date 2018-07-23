pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./YKStructs.sol";

contract YKAccounts is Ownable, YKStructs {
  using strings for *;

  string DELIM = "||";
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
  
  function addAccount(uint256 _communityId, address _address, string _metadata, string _url) public onlyOwner returns (uint256) {
    require(urlIsValid(_url));
    Account memory account = Account({
      id:           maxAccountId + 1,
      communityId:  _communityId,
      userAddress:  _address,
      flags:        0x0,
      metadata:     _metadata,
      urls:         _url,
      rewardIds:    new uint256[](0),
      offerIds:    new uint256[](0)
    });
    addUrlToAccount(account.id, _url); // will fail if url invalid, without affecting storage
    accounts[account.id] = account;
    maxAccountId += 1;
    return maxAccountId;
  }
  
  function addUrlToAccount(uint256 _accountId, string _url) public onlyOwner returns (bool) {
    require(urlIsValid(_url));
    require(accountIdForUrl(_url)==0);
    string memory urls = accounts[_accountId].urls;
    if (bytes(urls).length > 0) {
      string memory commaUrl = DELIM.toSlice().concat(_url.toSlice());
      accounts[_accountId].urls = urls.toSlice().concat(commaUrl.toSlice());
    } else {
      accounts[_accountId].urls = _url;
    }
    accountsByUrl[_url] = _accountId;
    return true;
  }
  
  function editAccount(uint256 _id, address _newAddress, string _newMetadata, byte _newFlags) public onlyOwner {
    if (_newAddress != accounts[_id].userAddress) {
      if (accounts[_id].userAddress != 0) {
        delete accountsByAddress[accounts[_id].userAddress];
      }
      if (_newAddress != 0) {
        accountsByAddress[_newAddress] = _id;
      }
    }
    accounts[_id].userAddress = _newAddress;
    accounts[_id].metadata    = _newMetadata;
    accounts[_id].flags       = _newFlags;
  }

  function flagAccount(uint256 _id, byte _flags) public onlyOwner {
    accounts[_id].flags = _flags;
  }

  function removeUrlFromAccount(uint256 _id, string _oldUrl) public onlyOwner returns (bool) {
    strings.slice memory urls = accounts[_id].urls.toSlice();
    string[] memory separated = new string[](urls.count(DELIM.toSlice()) + 1);
    for(uint i = 0; i < separated.length; i++) {
      separated[i] = urls.split(DELIM.toSlice()).toString();
    }
    string memory newUrls = '';
    for (uint j = 0; j < separated.length; j++) {
      if (separated[j].toSlice().compare(_oldUrl.toSlice()) != 0) {
        newUrls = newUrls.toSlice().concat(separated[j].toSlice());
        if (j < separated.length-1 && separated[j+1].toSlice().compare(_oldUrl.toSlice()) != 0) {
        newUrls = newUrls.toSlice().concat(DELIM.toSlice());
        }
      }
    }
    accounts[_id].urls = newUrls;
    accountsByUrl[_oldUrl] = 0;
    return true;
  }

  function deleteAccount(uint256 _id) public onlyOwner {
    strings.slice memory urls = accounts[_id].urls.toSlice();
    string[] memory separated = new string[](urls.count(DELIM.toSlice()) + 1);
    for(uint i = 0; i < separated.length; i++) {
      separated[i] = urls.split(DELIM.toSlice()).toString();
    }
    for (uint j = 0; j < separated.length; j++) {
      delete accountsByUrl[separated[j]];
    }
    delete accounts[_id];
  }

  // TODO
  function urlIsValid(string _url) public pure returns (bool) {
    return bytes(_url).length > 0;
  }

  function addRewardToAccount(uint256 _vendorId, uint256 _rewardId) public onlyOwner {
    accounts[_vendorId].offerIds.push(_rewardId);
  }

  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOwner {
    accounts[_spenderId].rewardIds.push(_rewardId);
  }
  
  function deleteRewardFromAccount(uint256 _vendorId, uint256 _rewardId) public onlyOwner {
    Account storage vendor = accounts[_vendorId];
    bool found = false;
    for (uint i = 0; i < vendor.offerIds.length; i++) {
      if (vendor.offerIds[i] == _rewardId) {
        vendor.offerIds[i] = vendor.offerIds[vendor.offerIds.length - 1];
        delete vendor.offerIds[vendor.offerIds.length - 1];
        found = true;
      }
      if (found) {
        vendor.offerIds.length--;
      }
    }
  }
}

