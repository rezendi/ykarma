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
  
  function addCommunity(Community community) public onlyOwner {
    community.id = maxCommunityId + 1;
    communities[community.id] = community;
    maxCommunityId += 1;
  }
  
  function addAccount(uint256 _communityId, uint256 _accountId) public onlyOwner {
    communities[_communityId].accountIds.push(_accountId);
  }
  
  function setTags(uint256 _communityId, string _tags) public onlyOwner {
    communities[_communityId].tags = _tags;
  }
}

