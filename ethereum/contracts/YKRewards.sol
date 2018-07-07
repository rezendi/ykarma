pragma solidity 0.4.23;
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
  
  function editReward(Reward reward) public onlyOwner returns (uint256) {
    rewards[reward.id].cost     = reward.cost;
    rewards[reward.id].tag      = reward.tag;
    rewards[reward.id].metadata = reward.metadata;
  }
  
  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOwner {
    rewards[_rewardId].ownerId = _spenderId;
  }

  function deleteReward(uint256 _id) public onlyOwner returns (uint256) {
    delete rewards[_id];
  }
  
}
