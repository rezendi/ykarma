pragma solidity 0.5.0;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./YKStructs.sol";

contract YKValidator is YKStructs {

  function validateGive(Account memory giver, string memory _url, string memory _message) public pure returns (bool) {
    return giver.id > 0 && bytes(_url).length > 0 && bytes(_message).length >= 0;
  }
  
}