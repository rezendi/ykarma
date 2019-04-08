pragma solidity 0.5.0;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./Oracular.sol";
import "./YKStructs.sol";

contract YKAccounts is Oracular, YKStructs {
  using strings for *;

  string DELIM = " ";

  uint256 maxAccountId;
  mapping(uint256 => Account) accounts;
  mapping(string => uint256) accountsByUrl;
  mapping(address => uint256) accountsByAddress;
  
  function getMaxAccountId() public view returns (uint256) {
    return maxAccountId;
  }

  function accountForId(uint256 _id) public onlyOracle view returns (Account memory) {
    return accounts[_id];
  }

  function accountIdForAddress(address _address) public onlyOracle view returns (uint256) {
    return accountsByAddress[_address];
  }

  function accountIdForUrl(string memory _url) public onlyOracle view returns (uint256) {
    return accountsByUrl[_url];
  }
  
  function addAccount(uint256 _communityId, address _address, string memory _metadata, bytes32 _flags, string memory _url) public onlyOracle returns (uint256) {
    require(urlIsValid(_url));
    require (_metadata.toSlice()._len < 8192);
    Account memory account = Account({
      id:           maxAccountId + 1,
      communityIds: new uint256[](0),
      userAddress:  _address,
      flags:        _flags,
      metadata:     _metadata,
      urls:         _url,
      rewardIds:    new uint256[](0),
      offerIds:    new uint256[](0)
    });
    addUrlToAccount(account.id, _url); // will fail if url invalid, without affecting storage
    accounts[account.id] = account;
    accounts[account.id].communityIds.push(_communityId);
    maxAccountId += 1;
    return maxAccountId;
  }
  
  function addUrlToAccount(uint256 _accountId, string memory _url) public onlyOracle returns (bool) {
    require(_accountId > 0);
    require(urlIsValid(_url));
    require(accountIdForUrl(_url)==0);
    string memory urls = accounts[_accountId].urls;
    if (bytes(urls).length > 0) {
      string memory delimUrl = DELIM.toSlice().concat(_url.toSlice());
      accounts[_accountId].urls = urls.toSlice().concat(delimUrl.toSlice());
    } else {
      accounts[_accountId].urls = _url;
    }
    accountsByUrl[_url] = _accountId;
    return true;
  }
  
  function addUrlToExistingAccount(uint256 _accountId, string memory _url) public onlyOracle returns (bool) {
    Account memory account = accountForId(_accountId);
    require(account.id != 0);
    return addUrlToAccount(_accountId, _url);
  }

  function editAccount(uint256 _id, address _newAddress, string memory _newMetadata, bytes32 _newFlags) public onlyOracle {
    require (_id > 0);
    if (_newAddress != accounts[_id].userAddress) {
      if (accounts[_id].userAddress != 0x0000000000000000000000000000000000000000) {
        delete accountsByAddress[accounts[_id].userAddress];
      }
      if (_newAddress != 0x0000000000000000000000000000000000000000) {
        accountsByAddress[_newAddress] = _id;
      }
    }
    accounts[_id].userAddress = _newAddress;
    accounts[_id].metadata    = _newMetadata;
    accounts[_id].flags       = _newFlags;
  }

  function removeUrlFromAccount(uint256 _id, string memory _oldUrl) public onlyOracle returns (bool) {
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

  function deleteAccount(uint256 _id) public onlyOracle {
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
  
  function communityIds(uint256 _accountId) public view onlyOracle returns (string memory) {
    string memory out = '[';
    Account memory account = accountForId(_accountId);
    for(uint i = 0; i < account.communityIds.length; i++) {
      string memory s = uint2str(account.communityIds[i]);
      out = out.toSlice().concat(s.toSlice());
      if (i < account.communityIds.length -1) {
        out = out.toSlice().concat(','.toSlice());
      }
    }
    out = out.toSlice().concat(']'.toSlice());
    return out;
  }

  function urlIsValid(string memory _url) public pure returns (bool) {
    // TODO more than this
    return bytes(_url).length > 0 && _url.toSlice()._len < 256 && _url.toSlice().copy().find(":".toSlice())._len != 0;
  }

  function addRewardToAccount(uint256 _vendorId, uint256 _rewardId) public onlyOracle {
    Account memory vendor = accountForId(_vendorId);
    require(vendor.id > 0);
    accounts[_vendorId].offerIds.push(_rewardId);
  }

  function redeem(uint256 _spenderId, uint256 _rewardId, uint256 _vendorId, bool assignToVendor) public onlyOracle {
    accounts[_spenderId].rewardIds.push(_rewardId);
    if (assignToVendor) {
      accounts[_vendorId].offerIds.push(_rewardId);
    }
  }
  
  function deleteRewardFromAccount(uint256 _vendorId, uint256 _rewardId) public onlyOracle {
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

  function merge(uint256 _id1, uint256 _id2) public onlyOracle {
    // basiclly we zero out account 1 and move it all to account 2
    // don't change communityId, userAddress, flags, or metadata
    
    //first, merge URLs
    Account storage account1 = accounts[_id1];
    Account storage account2 = accounts[_id2];

    strings.slice memory urls1 = account1.urls.toSlice();
    strings.slice memory delimUrls = DELIM.toSlice().concat(urls1).toSlice();
    account2.urls = account2.urls.toSlice().concat(delimUrls);
    for(uint256 i = 0; i <= urls1.count(DELIM.toSlice()); i++) {
      string memory url = urls1.split(DELIM.toSlice()).toString();
      removeUrlFromAccount(_id1, url);
      accountsByUrl[url] = _id2;
    }

    // then, merge rewards
    for (uint256 j = 0; j < account1.rewardIds.length; j++) {
      account2.rewardIds.push(account1.rewardIds[j]);
    }
    delete account1.rewardIds;
    for (uint256 k = 0; k < account1.offerIds.length; k++) {
      account2.offerIds.push(account1.offerIds[k]);
    }
    delete account1.offerIds;
    account1.flags = 0x0000000000000000000000000000000000000000000000000000000000000001; // mark as never logged in
    
    // finally, merge community IDs
    for (uint256 l = 0; l < account1.communityIds.length; l++) {
      uint256 communityId = account1.communityIds[l];
      if (!uintArrayContains(account2.communityIds, communityId)) {
        account2.communityIds.push(communityId);
      }
    }
  }

}

