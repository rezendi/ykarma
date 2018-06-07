pragma solidity 0.4.23;

contract YKStructs {
  struct Tranches {
    uint256[] amounts;
    uint256[] blocks;
    string[] tags;
    uint256 lastRecalculated;
    uint256 firstNonzero;
  }

  struct Account {
    uint256 id;
    uint256 communityId;
    address userAddress;
    string metadata;
    string[] urls;
    uint256[] rewardIds;
  }

  struct Community {
    uint256 id;
    bool isClosed;
    string domain;
    address admin;
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

