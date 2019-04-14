pragma solidity 0.5.0;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./Oracular.sol";
import "./YKStructs.sol";

contract YKRewards is Oracular, YKStructs {
  using strings for *;

  mapping(uint256 => Reward) rewards;
  uint256 maxRewardId;

  function getMaxRewardId() public view returns (uint256) {
    return maxRewardId;
  }

  function rewardForId(uint256 _id) public onlyOracle view returns (Reward memory) {
    return rewards[_id];
  }
  
  function addReward(uint256 _vendorId, uint256 _cost, uint256 _quantity, string memory _tag, string memory _metadata, bytes32 _flags)  public onlyOracle returns (uint256) {
    require (_metadata.toSlice()._len < 2048);
    require (_tag.toSlice()._len < 128);
    Reward memory reward = Reward({
      id:       maxRewardId + 1,
      parentId: 0,
      vendorId: _vendorId,
      ownerId:  0,
      created:  block.number,
      sold:     0,
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
  
  function editReward(uint256 _id, uint256 _cost, uint256 _quantity, string memory _tag, string memory _metadata, bytes32 _flags) public onlyOracle returns (uint256) {
    require (rewards[_id].id > 0 && rewards[_id].ownerId == 0);
    rewards[_id].cost     = _cost;
    rewards[_id].quantity = _quantity;
    rewards[_id].tag      = _tag;
    rewards[_id].metadata = _metadata;
    rewards[_id].flags    = _flags;
  }
  
  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOracle returns (uint256) {
    Reward storage reward = rewards[_rewardId];
    require (reward.quantity > 0);
    if (reward.quantity == 1) {
      reward.ownerId = _spenderId;
      reward.sold = block.number;
      return _rewardId;
    }
    
    // create a new reward, allocate it, decrement quantity
    Reward memory newReward = Reward({
      id:       maxRewardId + 1,
      parentId: reward.id,
      vendorId: reward.vendorId,
      ownerId:  _spenderId,
      created:  reward.created,
      sold:     block.number,
      flags:    reward.flags,
      cost:     reward.cost,
      quantity: 1,
      tag:      reward.tag,
      metadata: reward.metadata
    });
    rewards[newReward.id] = newReward;
    reward.quantity -= 1;
    maxRewardId += 1;
    return newReward.id;
  }

  function deleteRewardRecord(uint256 _id) public onlyOracle returns (uint256) {
    delete rewards[_id];
  }
  
  // TODO: replace with something far more efficient!
  function mergeAccounts(uint256 _id1, uint256 _id2) public onlyOracle {
    for (uint256 i = 1; i <= maxRewardId; i++) {
      if (rewards[i].ownerId == _id1) {
        rewards[i].ownerId = _id2;
      }
      if (rewards[i].vendorId == _id1) {
        rewards[i].vendorId = _id2;
      }
    }
  }
}
