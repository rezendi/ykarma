pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./Oracular.sol";
import "./YKStructs.sol";

contract YKRewards is Oracular, YKStructs {
  mapping(uint256 => Reward) rewards;
  uint256 maxRewardId;

  function getMaxRewardId() public view returns (uint256) {
    return maxRewardId;
  }

  function rewardForId(uint256 _id) public onlyOracle view returns (Reward) {
    return rewards[_id];
  }
  
  function addReward(uint256 _vendorId, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags)  public onlyOracle returns (uint256) {
    Reward memory reward = Reward({
      id:       maxRewardId + 1,
      vendorId: _vendorId,
      ownerId:  0,
      flags:    _flags,
      cost:     _cost,
      quantity: _quantity,
      tag:      _tag,
      metadata: _metadata
    });
    rewards[reward.id] = reward;
    maxRewardId += 1;
    return reward.id;
  }
  
  function editReward(uint256 _id, uint256 _cost, uint256 _quantity, string _tag, string _metadata, bytes32 _flags) public onlyOracle returns (uint256) {
    rewards[_id].cost     = _cost;
    rewards[_id].quantity = _quantity;
    rewards[_id].tag      = _tag;
    rewards[_id].metadata = _metadata;
    rewards[_id].flags    = _flags;
  }
  
  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOracle {
    rewards[_rewardId].ownerId = _spenderId;
  }

  function deleteRewardRecord(uint256 _id) public onlyOracle returns (uint256) {
    delete rewards[_id];
  }
  
}
