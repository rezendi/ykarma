pragma solidity 0.4.23;
pragma experimental ABIEncoderV2;

import "./arachnid/strings.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./YKStructs.sol";

contract YKTranches is Ownable, YKStructs {
  using strings for *;
  mapping(uint256 => Tranches) giving;
  mapping(uint256 => Tranches) spending;
  uint256 EXPIRY_WINDOW = 691200;
  uint256 REFRESH_WINDOW = 40320;
  uint256 GIVING_AMOUNT = 100;

  function availableToGive(uint256 _id) public returns (uint256) {
    uint256 total = 0;
    recalculateGivingTranches(_id, '');
    for (uint256 i = giving[_id].firstNonzero ; i<giving[_id].amounts.length; i++) {
      total += giving[_id].amounts[i];
    }
    return total;
  }
  
  function give(uint256 _amount, uint256 _sender, uint256 _recipient, string _tags) public {
    require (_recipient > 0);
    uint256 accumulated;
    // recalculateGivingTranches(_sender, ''); always called in availableToGive
    Tranches storage available = giving[_sender];
    for (uint256 i = available.firstNonzero; i < available.amounts.length; i++) {
      if (accumulated + available.amounts[i] >= _amount) {
        available.amounts[i] = available.amounts[i] - accumulated - _amount;
        accumulated = _amount;
        break;
      } else {
        accumulated = accumulated + available.amounts[i];
        available.amounts[i] = 0;
      }
    }
    Tranches storage toAppend = spending[_recipient];
    toAppend.amounts.push(accumulated);
    toAppend.blocks.push(block.number);
    toAppend.tags.push(_tags);
  }
  
  function availableToSpend(uint256 _id, string _tag) public returns (uint256) {
    uint256 total = 0;
    recalculateSpendingTranches(_id);
    for (uint256 i = spending[_id].firstNonzero; i < spending[_id].amounts.length; i++) {
      if (tagsIncludesTag(spending[_id].tags[i], _tag)) {
        total = spending[_id].amounts[i];
      }
    }
    return total;
  }
  
  function spend(uint256 _amount, uint256 _spender, string _tag) public onlyOwner {
    uint256 accumulated;
    // recalculateSpendingTranches(_spender); always called by availableToSpend first
    Tranches storage available = spending[_spender];
    for (uint i = available.firstNonzero; i < available.amounts.length; i++) {
      if (!tagsIncludesTag(available.tags[i], _tag)) {
        continue;
      }
      if (accumulated + available.amounts[i] >= _amount) {
        available.amounts[i] = available.amounts[i] - accumulated - _amount;
        accumulated = _amount;
        break;
      } else {
        accumulated = accumulated + available.amounts[i];
        available.amounts[i] = 0;
      }
    }
  }
  
  function replenish(uint256 _accountId) public onlyOwner {
    Tranches storage recipient = giving[_accountId];
    recipient.blocks.push(block.number);
    recipient.amounts.push(100);
  }
  
  function recalculateGivingTranches(uint256 _id, string _tags) public onlyOwner {
    Tranches storage available = giving[_id];
    if (available.blocks.length == 0) {
      return;
    }
    uint256 cutoffBlock = block.number - EXPIRY_WINDOW;
    for (uint256 i = available.firstNonzero; i < available.blocks.length; i++ ) {
      if (available.blocks[i] < cutoffBlock) {
        available.amounts[i] = 0;
        available.firstNonzero = i;
      }
    }
    uint256 lastBlock = available.blocks[available.blocks.length - 1];
    // only add new giving coins when we know their tags
    if (bytes(_tags).length > 0 && block.number - lastBlock > REFRESH_WINDOW) {
      available.blocks.push(lastBlock + REFRESH_WINDOW);
      available.amounts.push(GIVING_AMOUNT);
      available.tags.push(_tags);
    }
    available.lastRecalculated = block.number;
  }

  function recalculateSpendingTranches(uint256 _id) public onlyOwner {
    Tranches storage available = spending[_id];
    if (available.blocks.length == 0) {
      return;
    }
    for (uint256 i = available.firstNonzero; i < available.blocks.length;  i++ ) {
      uint256 age = available.blocks[i];
      if (available.lastRecalculated - age < EXPIRY_WINDOW && block.number - age >= EXPIRY_WINDOW) {
        if (available.amounts[i] == 1) {
          available.amounts[i] = 0;
        } else {
          available.amounts[i] = available.amounts[i] / uint256(2);
        }
        if (available.amounts[i] == 0 && i == available.firstNonzero + 1) {
          available.firstNonzero = i;
        }
      }
    }
    available.lastRecalculated = block.number;
  }
  
  function tagsIncludesTag(string _tags, string _tag) public pure returns (bool) {
    strings.slice memory s1 = _tags.toSlice();
    strings.slice memory s2 = s1.find(_tag.toSlice());
    return !s2.empty();
  }
}
