pragma solidity 0.4.23;

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
    byte flags;
    string metadata;
    string urls;
    uint256[] rewardIds;
    uint256[] offerIds;
  }

  struct Community {
    uint256 id;
    address adminAddress;
    byte flags;
    string domain;
    string metadata;
    string tags;
    uint256[] accountIds;
  }
  
  struct Reward {
    uint256 id;
    uint256 vendorId;
    uint256 ownerId;
    uint256 cost;
    byte flags;
    string tag;
    string metadata;
  }
}

