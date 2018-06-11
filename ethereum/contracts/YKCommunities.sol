pragma solidity 0.4.23;
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
  
  function editCommunity(uint256 _communityId, Community _newValues) public onlyOwner {
    communities[_communityId].adminAddress  = _newValues.adminAddress;
    communities[_communityId].isClosed      = _newValues.isClosed;
    communities[_communityId].domain        = _newValues.domain;
    communities[_communityId].metadata      = _newValues.metadata;
    communities[_communityId].tags          = _newValues.tags;
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
}

