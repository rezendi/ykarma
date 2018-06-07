pragma solidity 0.4.23;
pragma experimental ABIEncoderV2;

import "./zeppelin/ownership/Ownable.sol";
import "./YKStructs.sol";

contract YKVendors is Ownable, YKStructs {
  mapping(uint256 => Vendor) vendors;
  mapping(address => uint256) vendorsByAddress;
  uint256 maxVendorId;
  
  mapping(uint256 => Reward) rewards;
  uint256 maxRewardId;

  function vendorForId(uint256 _id) public onlyOwner view returns (Vendor) {
    return vendors[_id];
  }
  
  function addVendor(Vendor vendor) public onlyOwner {
    vendor.id = maxVendorId + 1;
    vendors[vendor.id] = vendor;
    if (vendor.vendorAddress > 0) {
      vendorsByAddress[vendor.vendorAddress] = vendor.id;
    }
    maxVendorId += 1;
  }
  
  function rewardForId(uint256 _id) public onlyOwner view returns (Reward) {
    return rewards[_id];
  }
  
  function addReward(Reward reward) public onlyOwner {
    reward.id = maxRewardId + 1;
    rewards[reward.id] = reward;
    maxRewardId += 1;
    vendors[reward.vendorId].rewardIds.push(reward.id);
  }
  
  function redeem(uint256 _spenderId, uint256 _rewardId) public onlyOwner {
    rewards[_rewardId].ownerId = _spenderId;
  }
}

