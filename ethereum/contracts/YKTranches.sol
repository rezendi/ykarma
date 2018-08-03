pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;

import "./math/SafeMath.sol";
import "./arachnid/strings.sol";
import "./Oracular.sol";
import "./YKStructs.sol";

//TODO SafeMath
contract YKTranches is Oracular, YKStructs {
  using strings for *;
  using SafeMath for uint256;

  uint256 EXPIRY_WINDOW = 20 * 60 * 24 * 120;
  uint256 REFRESH_WINDOW = 20 * 60 * 24 * 7;
  uint256 GIVING_AMOUNT = 100;

  mapping(uint256 => Giving) giving;
  mapping(uint256 => Tranche) tranches;
  mapping(uint256 => uint256[]) given;
  mapping(uint256 => uint256[]) received;
  uint256 maxTrancheId = 1;
  
  function availableToGive(uint256 _id) public view onlyOracle returns (uint256) {
    uint256 total = 0;
    for (uint256 i=0 ; i<giving[_id].amounts.length; i++) {
      total = total.add(giving[_id].amounts[i]);
    }
    return total;
  }
  
  function performGive(Account sender, Account recipient, uint256 _amount, string _tags, string _message) public onlyOracle {
    require (recipient.id > 0);
    uint256 accumulated;
    uint256[] storage amounts = giving[sender.id].amounts;
    for (uint256 i=0; i < amounts.length; i++) {
      if (accumulated.add(amounts[i]) >= _amount) {
        amounts[i] = amounts[i].sub(_amount.sub(accumulated));
        accumulated = _amount;
        break;
      } else {
        accumulated = accumulated.add(amounts[i]);
        amounts[i] = 0;
      }
    }
    
    Tranche memory tranche = Tranche({
      sender: sender.id,
      recipient: recipient.id,
      amount: _amount,
      available: _amount,
      tags: _tags,
      message: _message
    });
    tranches[maxTrancheId] = tranche;
    given[sender.id].push(maxTrancheId);
    received[recipient.id].push(maxTrancheId);
    maxTrancheId += 1;
  }
  
  function availableToSpend(uint256 _id, string _tag) public view onlyOracle returns (uint256) {
    uint256 total = 0;
    uint256[] storage trancheIds = received[_id];
    for (uint256 i=0; i < trancheIds.length; i++) {
      Tranche storage tranche = tranches[trancheIds[i]];
      if (tagsIncludesTag(tranche.tags, _tag)) {
        total = total.add(tranche.available);
      }
    }
    return total;
  }
  
  function spend(uint256 _spenderId, uint256 _amount, string _tag) public onlyOracle {
    require (availableToSpend(_spenderId, _tag) >= _amount);
    uint256 accumulated;
    uint256[] storage trancheIds = received[_spenderId];
    for (uint256 i=0; i < trancheIds.length; i++) {
      Tranche storage tranche = tranches[trancheIds[i]];
      if (!tagsIncludesTag(tranche.tags, _tag)) {
        continue;
      }
      if (accumulated.add(tranche.available) >= _amount) {
        tranche.available = tranche.available.sub(_amount.sub(accumulated));
        accumulated = _amount;
        break;
      } else {
        accumulated = accumulated.add(tranche.available);
        tranche.available = 0;
      }
    }
  }
  
  function lastReplenished(uint256 _id) public view returns (uint256) {
    Giving storage recipient = giving[_id];
    if (recipient.blocks.length == 0) {
      return 0;
    }
    return recipient.blocks[recipient.blocks.length-1];
  }
  
  function replenish(uint256 _id) public onlyOracle {
    uint256 mostRecent = lastReplenished(_id);
    if (mostRecent > 0 && block.number - mostRecent < REFRESH_WINDOW) {
      return;
    }
    Giving storage recipient = giving[_id];
    recipient.blocks.push(block.number);
    recipient.amounts.push(GIVING_AMOUNT);
  }
  
  function recalculateBalances(uint256 _id) public onlyOracle {
    Giving storage available = giving[_id];
    if (available.blocks.length == 0 || block.number < EXPIRY_WINDOW) {
      return;
    }
    uint256 cutoffBlock = block.number.sub(EXPIRY_WINDOW);
    for (uint256 i=0; i < available.blocks.length; i++ ) {
      if (available.blocks[i] < cutoffBlock) {
        available.amounts[i] = 0;
      }
    }

    // catch up on any replenish calls we might have missed, basically
    uint256 lastBlock = available.blocks[available.blocks.length.sub(1)];
    while (block.number.sub(lastBlock) > REFRESH_WINDOW) {
      available.blocks.push(lastBlock.add(REFRESH_WINDOW));
      available.amounts.push(GIVING_AMOUNT);
      lastBlock = lastBlock.add(REFRESH_WINDOW);
    }
  }
  
  function tagsIncludesTag(string _tags, string _tag) public pure returns (bool) {
    strings.slice memory s1 = _tag.toSlice();
    if (s1.empty()) {
      return true;
    }
    strings.slice memory s2 = _tags.toSlice();
    strings.slice memory s3 = s2.find(s1);
    return !s3.empty();
  }
  
  function givenToJSON(uint256 _id) public view onlyOracle returns (string) {
    return tranchesToJSON(_id, true);
  }

  function receivedToJSON(uint256 _id) public view onlyOracle returns (string) {
    return tranchesToJSON(_id, false);
  }

  function tranchesToJSON(uint256 _id, bool sender) internal view returns (string) {
    uint256[] memory trancheIds = sender ? given[_id] : received[_id];
    string memory json = "[";
    for (uint i = 0; i < trancheIds.length; i++) {
      string memory trancheString = trancheToJSON(trancheIds[i]);
      json = json.toSlice().concat(trancheString.toSlice());
      if (i < trancheIds.length - 1) {
        json = json.toSlice().concat(",".toSlice());
      }
    }
    json = json.toSlice().concat("]".toSlice());
    return json;
  }

  function trancheToJSON(uint256 _trancheId) internal view returns (string) {
    Tranche memory tranche = tranches[_trancheId];
    string memory out = '{"sender":';
    string memory s = uint2str(tranche.sender);
    out = out.toSlice().concat(s.toSlice());
    out = out.toSlice().concat(',"receiver":'.toSlice());
    s = uint2str(tranche.recipient);
    out = out.toSlice().concat(s.toSlice());
    out = out.toSlice().concat(',"amount":'.toSlice());
    s = uint2str(tranche.amount);
    out = out.toSlice().concat(s.toSlice());
    out = out.toSlice().concat(',"available":'.toSlice());
    s = uint2str(tranche.available);
    out = out.toSlice().concat(s.toSlice());
    //TODO handle quotes obv.
    out = out.toSlice().concat(',"message":"'.toSlice());
    out = out.toSlice().concat(tranche.message.toSlice());
    out = out.toSlice().concat('","tags":"'.toSlice());
    out = out.toSlice().concat(tranche.tags.toSlice());
    out = out.toSlice().concat('"}'.toSlice());
    return out;
  }

  function uint2str(uint i) internal pure returns (string) {
    if (i == 0) return "0";
    uint j = i;
    uint len;
    while (j != 0){
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint k = len - 1;
    while (i != 0){
      bstr[k--] = byte(48 + i % 10);
      i /= 10;
    }
    return string(bstr);
  }
  
  function sendMessageOk(Account sender, Account recipient) internal view returns (bool) {
    if (sender.communityId == recipient.communityId) {
      return !(sender.flags & FLAG_NO_MESSAGES == FLAG_NO_MESSAGES);
    }
    return !(sender.flags & FLAG_NO_EXTERNAL_MESSAGES == FLAG_NO_EXTERNAL_MESSAGES);
  }
}
