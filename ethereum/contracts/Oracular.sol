pragma solidity 0.5.0;

contract Oracular {
  address[] oracles;

  modifier onlyOracle() {
    require (senderIsOracle());
    _;
  }

  constructor() public {
    oracles.push(msg.sender);
  }

  event OracleAdded(address indexed oracleAddress);

  function senderIsOracle() public view returns (bool){
    for (uint i; i < oracles.length; i++) {
      if (msg.sender == oracles[i]) {
        return true;
      }
    }
    return false;
  }

  function addOracle(address newOracle) public onlyOracle {
    require(newOracle != address(0));
    oracles.push(newOracle);
    emit OracleAdded(newOracle);
  }
  
  // ganked from https://github.com/pipermerriam/ethereum-string-utils and should probably be moved elsewhere
  // along with its subsequent methods
  function uintToBytes(uint v) pure public returns (bytes32 ret) {
    if (v == 0) {
        ret = '0';
    }
    else {
        while (v > 0) {
            ret = bytes32(uint(ret) / (2 ** 8));
            ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
            v /= 10;
        }
    }
    return ret;
  }
  
  function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
      if (_i == 0) {
          return "0";
      }
      uint j = _i;
      uint len;
      while (j != 0) {
          len++;
          j /= 10;
      }
      bytes memory bstr = new bytes(len);
      uint k = len - 1;
      while (_i != 0) {
          bstr[k--] = byte(uint8(48 + _i % 10));
          _i /= 10;
      }
      return string(bstr);
  }

  function uintArrayContains(uint[] memory array, uint val) pure public returns (bool) {
    for (uint i=0; i<array.length; i++) {
      if (array[i]==val) {
        return true;
      }
    }
    return false;
  }
}

