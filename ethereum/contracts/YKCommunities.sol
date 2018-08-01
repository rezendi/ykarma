pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./Oracular.sol";
import "./YKStructs.sol";

contract YKCommunities is Oracular, YKStructs {
  mapping(uint256 => Community) communities;
  uint256 public maxCommunityId;
  
  function communityForId(uint256 _id) public onlyOracle view returns (Community) {
    return communities[_id];
  }
  
  function addCommunity(address _adminAddress, bytes32 _flags, string _domain, string _metadata, string _tags) public onlyOracle returns (uint256) {
    Community memory community = Community({
      id:           maxCommunityId + 1,
      adminAddress: _adminAddress,
      flags:        _flags,
      domain:       _domain,
      metadata:     _metadata,
      tags:         _tags,
      accountIds:   new uint256[](0),
      rewardIds:    new uint256[](0)
    });
    communities[community.id] = community;
    maxCommunityId += 1;
    return community.id;
  }
  
  function addAccount(uint256 _communityId, uint256 _accountId) public onlyOracle {
    communities[_communityId].accountIds.push(_accountId);
  }
  
  function editCommunity(uint256 _id, address _adminAddress, bytes32 _flags, string _domain, string _metadata, string _tags) public onlyOracle {
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
    return communities[_id].flags & 0x01 == 0x01;
  }
  
  function addRewardToCommunity(uint256 _communityId, uint256 _rewardId) public onlyOracle {
    communities[_communityId].rewardIds.push(_rewardId);
  }
  
  function deleteRewardFromCommunity(uint256 _communityId, uint256 _rewardId) public onlyOracle {
    uint256[] storage rewardIds = communities[_communityId].rewardIds;
    bool found = false;
    for (uint i = 0; i < rewardIds.length; i++) {
      if (rewardIds[i] == _rewardId) {
        rewardIds[i] = rewardIds[rewardIds.length - 1];
        delete rewardIds[rewardIds.length - 1];
        found = true;
      }
      if (found) {
        rewardIds.length--;
      }
    }
  }

}

