pragma solidity 0.4.24;

contract YKStructs {

  struct Giving {
    uint256[] amounts;
    uint256[] blocks;
  }

  struct Tranche {
    uint256 sender;
    uint256 recipient;
    uint256 block;
    uint256 amount;
    uint256 available;
    string message;
    string tags;
  }

  struct Account {
    uint256 id;
    uint256[] communityIds;
    address userAddress;
    bytes32 flags;
    string metadata;
    string urls;
    uint256[] rewardIds;
    uint256[] offerIds;
  }

  struct Community {
    uint256 id;
    address adminAddress;
    bytes32 flags;
    string domain;
    string metadata;
    string tags;
    uint256[] accountIds;
  }
  
  struct Reward {
    uint256 id;
    uint256 parentId;
    uint256 vendorId;
    uint256 ownerId;
    uint256 cost;
    uint256 quantity;
    uint256 created; // block
    uint256 sold; // block
    bytes32 flags;
    string tag;
    string metadata;
  }
  
  bytes32 FLAG_NO_MESSAGES = 0x0000000000000000000000000000000000000000000000000000000000000010;
  bytes32 FLAG_NO_EXTERNAL_MESSAGES = 0x0000000000000000000000000000000000000000000000000000000000000100;
}

