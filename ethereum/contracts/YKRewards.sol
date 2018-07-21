pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./zeppelin/ownership/Ownable.sol";
import "./YKStructs.sol";

contract YKRewards is Ownable, YKStructs {
  mapping(uint256 => Reward) rewards;
  uint256 maxRewardId;

  function rewardForId(uint256 _id) public onlyOwner view returns (Reward) {
    return rewards[_id];
  }
  
  function addReward(Reward reward) public onlyOwner returns (uint256) {
    reward.id = maxRewardId + 1;
    rewards[reward.id] = reward;
    maxRewardId += 1;
    return reward.id;
  }
  
  function editReward(uint256 _id, uint256 _newCost, string _newTag, string _newMetadata, byte _newFlags) public onlyOwner returns (uint256) {
    rewards[_id].cost     = _newCost;
    rewards[_id].tag      = _newTag;
    rewards[_id].metadata = _newMetadata;
    rewards[_id].flags    = _newFlags;
  }
  
  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOwner {
    rewards[_rewardId].ownerId = _spenderId;
  }

  function deleteReward(uint256 _id) public onlyOwner returns (uint256) {
    delete rewards[_id];
  }
  
}
