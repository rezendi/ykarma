pragma solidity 0.4.23;

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
  function uintToBytes(uint v) constant returns (bytes32 ret) {
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
}

