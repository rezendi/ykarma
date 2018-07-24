pragma solidity 0.4.24;

contract YKStructs {

  struct Giving {
    uint256[] amounts;
    uint256[] blocks;
  }

  struct Given {
    uint256[] recipients;
    uint256[] amounts;
  }

  struct Spending {
    uint256[] senders;
    uint256[] amounts;
    string[] tags;
    string[] messages;
  }
  
  struct Account {
    uint256 id;
    uint256 communityId;
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
    uint256[] rewardIds;
  }
  
  struct Reward {
    uint256 id;
    uint256 vendorId;
    uint256 ownerId;
    uint256 cost;
    uint256 quantity;
    bytes32 flags;
    string tag;
    string metadata;
  }
}

