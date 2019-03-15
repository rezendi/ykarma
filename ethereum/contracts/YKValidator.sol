pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./YKStructs.sol";

contract YKValidator is YKStructs {

  function validateGive(Account giver, string _url, string _message) public pure returns (bool) {
    return giver.id > 0 && bytes(_url).length > 0 && bytes(_message).length >= 0;
  }
  
  function validatePurchase(Account buyer, Reward reward) public pure returns (bool) {
    return buyer.id > 0 && reward.id > 0;
  }

  function validateUrl(Account account, string _url) public pure returns (bool) {
    return account.id > 0 && bytes(_url).length > 0;
  }


}