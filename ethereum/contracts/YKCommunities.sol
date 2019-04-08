pragma solidity 0.5.0;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./Oracular.sol";
import "./YKStructs.sol";
import "./YKValidator.sol";

contract YKCommunities is Oracular, YKStructs {
  using strings for *;

  mapping(uint256 => Community) communities;
  mapping(uint256 => address) validators;
  uint256 public maxCommunityId;
  
  function getMaxCommunityId() public view returns (uint256) {
    return maxCommunityId;
  }

  function communityForId(uint256 _id) public onlyOracle view returns (Community memory) {
    return communities[_id];
  }
  
  function addCommunity(address _adminAddress, bytes32 _flags, string memory _domain, string memory _metadata, string memory _tags) public onlyOracle returns (uint256) {
    require (_metadata.toSlice()._len < 2048);
    require (_domain.toSlice()._len < 256);
    require (_tags.toSlice()._len < 256);
    Community memory community = Community({
      id:           maxCommunityId + 1,
      adminAddress: _adminAddress,
      flags:        _flags,
      domain:       _domain,
      metadata:     _metadata,
      tags:         _tags,
      accountIds:   new uint256[](0)
    });
    communities[community.id] = community;
    maxCommunityId += 1;
    return community.id;
  }
  
  function addAccount(uint256 _communityId, uint256 _accountId) public onlyOracle {
    communities[_communityId].accountIds.push(_accountId);
  }
  
  function editCommunity(uint256 _id, address _adminAddress, bytes32 _flags, string memory _domain, string memory _metadata, string memory _tags) public onlyOracle {
    require(_id > 0);
    communities[_id].adminAddress  = _adminAddress;
    communities[_id].flags         = _flags;
    communities[_id].domain        = _domain;
    communities[_id].metadata      = _metadata;
    communities[_id].tags          = _tags;
  }

  function removeAccount(uint256 _communityId, uint256 _accountId) public onlyOracle {
    for (uint i = 0; i < communities[_communityId].accountIds.length; i++) {
      if (communities[_communityId].accountIds[i] == _accountId) {
        delete communities[_communityId].accountIds[i];
      }
    }
  }

  function deleteCommunity(uint256 _id) public onlyOracle {
    delete communities[_id];
  }

  function isClosed(uint256 _id) public view returns (bool) {
    return communities[_id].flags & 0x0000000000000000000000000000000000000000000000000000000000000001 == 0x0000000000000000000000000000000000000000000000000000000000000001;
  }
  
  function setValidator(uint256 _id, address _address) public onlyOracle {
    validators[_id] = _address;
  }

  function validateGive(Account memory giver, uint256 _communityId, string memory _url, string memory _message) public view onlyOracle returns (bool) {
    require(uintArrayContains(giver.communityIds, _communityId));
    address validatorAddress = validators[_communityId];
    if (validatorAddress == 0x0000000000000000000000000000000000000000) {
      return true;
    }
    YKValidator validator = YKValidator(validatorAddress);
    return validator.validateGive(giver, _url, _message);
  }
  
  function validatePurchase(Account memory buyer, uint256 _communityId, Reward memory reward) public view onlyOracle returns (bool) {
    require(uintArrayContains(buyer.communityIds, _communityId));
    address validatorAddress = validators[_communityId];
    if (validatorAddress == 0x0000000000000000000000000000000000000000) {
      return true;
    }
    YKValidator validator = YKValidator(validatorAddress);
    return validator.validatePurchase(buyer, reward);
  }
  
}

