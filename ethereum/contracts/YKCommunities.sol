pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./zeppelin/ownership/Ownable.sol";
import "./YKStructs.sol";

contract YKCommunities is Ownable, YKStructs {
  mapping(uint256 => Community) communities;
  uint256 public maxCommunityId;
  
  function communityForId(uint256 _id) public onlyOwner view returns (Community) {
    return communities[_id];
  }
  
  function addCommunity(Community community) public onlyOwner returns (uint256) {
    community.id = maxCommunityId + 1;
    communities[community.id] = community;
    maxCommunityId += 1;
    return community.id;
  }
  
  function addAccount(uint256 _communityId, uint256 _accountId) public onlyOwner {
    communities[_communityId].accountIds.push(_accountId);
  }
  
  function editCommunity(uint256 _id, Community _newValues) public onlyOwner {
    communities[_id].adminAddress  = _newValues.adminAddress;
    communities[_id].flags         = _newValues.flags;
    communities[_id].domain        = _newValues.domain;
    communities[_id].metadata      = _newValues.metadata;
    communities[_id].tags          = _newValues.tags;
  }

  function removeAccount(uint256 _communityId, uint256 _accountId) public onlyOwner {
    for (uint i = 0; i < communities[_communityId].accountIds.length; i++) {
      if (communities[_communityId].accountIds[i] == _accountId) {
        delete communities[_communityId].accountIds[i];
      }
    }
  }

  function deleteCommunity(uint256 _id) public onlyOwner {
    delete communities[_id];
  }

  function isClosed(uint256 _id) public view returns (bool) {
    return communities[_id].flags & 0x01 == 0x01;
  }
  
}

