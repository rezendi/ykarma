pragma solidity 0.4.23;

contract YKStructs {

  struct Giving {
    uint256[] amounts;
    uint256[] blocks;
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
    string metadata;
    string urls;
    uint256[] rewardIds;
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
  
  struct Vendor {
    uint256 id;
    uint256 communityId;
    address vendorAddress;
    string metadata;
    uint256[] rewardIds;
  }
  
  struct Reward {
    uint256 id;
    uint256 vendorId;
    uint256 ownerId;
    uint256 cost;
    string tag;
    string metadata;
  }
}

