pragma solidity 0.5.0;
pragma experimental ABIEncoderV2;

import "./math/SafeMath.sol";
import "./arachnid/strings.sol";
import "./Oracular.sol";
import "./YKStructs.sol";

contract YKTranches is Oracular, YKStructs {
  using strings for *;
  using SafeMath for uint256;

  uint256 ExpiryBlocks  = 20 * 60 * 24 * 30;
  uint256 RefreshBlocks = 20 * 60 * 24 * 7;
  uint256 Replenish     = 100;
  uint256 Bonus         = 10;

  mapping(uint256 => Giving) giving;
  mapping(uint256 => Tranche) tranches;
  mapping(uint256 => uint256[]) given;
  mapping(uint256 => uint256[]) received;
  uint256 maxTrancheId = 1;
  
  constructor(uint256 _expiry, uint256 _refresh, uint256 _replenish, uint256 _bonus) public Oracular() {
    if (_expiry  > 0) { ExpiryBlocks = _expiry; }
    if (_refresh  > 0) { RefreshBlocks = _refresh; }
    if (_replenish  > 0) { Replenish = _replenish; }
    if (_bonus  > 0) { Bonus = _bonus; }
  }
  
  function setExpiry(uint256 _expiry) public onlyOracle {
    if (_expiry > 0) { ExpiryBlocks = _expiry; }
  }
  function setRefresh(uint256 _refresh) public onlyOracle {
    if (_refresh > 0) { RefreshBlocks = _refresh; }
  }
  function setReplenish(uint256 _replenish) public onlyOracle {
    if (_replenish > 0) { Replenish = _replenish; }
  }
  function setBonus(uint256 _bonus) public onlyOracle {
    if (_bonus > 0) { Bonus = _bonus; }
  }
  
  function availableToGive(uint256 _id) public view onlyOracle returns (uint256) {
    uint256 total = 0;
    for (uint256 i=0 ; i<giving[_id].amounts.length; i++) {
      total = total.add(giving[_id].amounts[i]);
    }
    return total;
  }
  
  function consume(uint256 _accountId, uint256 _amount) public onlyOracle {
    if (_amount == 0) {
      return;
    }
    require (availableToGive(_accountId) >= _amount);
    uint256[] storage amounts = giving[_accountId].amounts;
    uint256 accumulated;
    for (uint256 i=0; i < amounts.length; i++) {
      if (amounts[i] <= 0) {
        continue;
      }
      if (accumulated.add(amounts[i]) >= _amount) {
        amounts[i] = amounts[i].sub(_amount.sub(accumulated));
        accumulated = _amount;
        break;
      } else {
        accumulated = accumulated.add(amounts[i]);
        amounts[i] = 0;
      }
    }
  }
  
  function performGive(Account memory sender, Account memory recipient, uint256 _amount, string memory _tags, string memory _message) public onlyOracle {
    require (recipient.id > 0);
    require (sender.id != recipient.id);
    require (_message.toSlice()._len < 256);
    require (_tags.toSlice()._len < 256);

    uint256 accumulated;
    uint256[] storage amounts = giving[sender.id].amounts;
    uint256 rewardsToGive = 0;
    for (uint256 i=0; i < amounts.length; i++) {
      if (amounts[i] <= 0) {
        continue;
      }
      if (accumulated.add(amounts[i]) >= _amount) {
        amounts[i] = amounts[i].sub(_amount.sub(accumulated));
        accumulated = _amount;
        rewardsToGive += (amounts[i] == 0 ? 1 : 0);
        break;
      } else {
        accumulated = accumulated.add(amounts[i]);
        amounts[i] = 0;
        rewardsToGive += 1;
      }
    }
    
    Tranche memory tranche = Tranche({
      sender:     sender.id,
      recipient:  recipient.id,
      block:      block.number,
      amount:     _amount,
      available:  _amount,
      tags:       _tags,
      message:    _message
    });
    tranches[maxTrancheId] = tranche;
    given[sender.id].push(maxTrancheId);
    received[recipient.id].push(maxTrancheId);
    maxTrancheId += 1;
    for (uint256 j=0; j < rewardsToGive; j++) {
      giveReward(sender.id, _tags);
    }
  }
  
  function giveReward(uint256 _id, string memory _tags) internal {
    Tranche memory tranche = Tranche({
      sender:     _id,
      recipient:  _id,
      amount:     Bonus,
      available:  Bonus,
      block:      block.number,
      tags:       _tags,
      message:    ''
    });
    tranches[maxTrancheId] = tranche;
    received[_id].push(maxTrancheId);
    maxTrancheId += 1;
  }
  
  function availableToSpend(uint256 _id, string memory _tag) public view onlyOracle returns (uint256) {
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
  
  function spend(uint256 _spenderId, uint256 _amount, string memory _tag) public onlyOracle {
    require (availableToSpend(_spenderId, _tag) >= _amount);
    uint256 accumulated;
    uint256[] storage trancheIds = received[_spenderId];
    for (uint256 i=0; i < trancheIds.length; i++) {
      Tranche storage tranche = tranches[trancheIds[i]];
      if (tranche.available <= 0) {
        continue;
      }
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
  
  function replenish(uint256 _id, bool _override) public onlyOracle {
    uint256 mostRecent = lastReplenished(_id);
    
    //override should only be for reloading the whole blockchain; worst case, stops working at block 131072
    if ((mostRecent > 0 && block.number - mostRecent < RefreshBlocks && !_override) || (_override && block.number > 131072)) {
      return;
    }
    Giving storage recipient = giving[_id];
    recipient.blocks.push(block.number);
    recipient.amounts.push(Replenish);
  }
  
  function recalculateBalances(uint256 _id) public onlyOracle {
    Giving storage available = giving[_id];
    if (available.blocks.length == 0 || block.number < ExpiryBlocks) {
      return;
    }
    uint256 cutoffBlock = block.number.sub(ExpiryBlocks);
    for (uint256 i=0; i < available.blocks.length; i++ ) {
      if (available.blocks[i] < cutoffBlock) {
        available.amounts[i] = 0;
      }
    }

    // catch up on any replenish calls we might have missed, basically
    uint256 lastBlock = available.blocks[available.blocks.length.sub(1)];
    while (block.number.sub(lastBlock) > RefreshBlocks) {
      available.blocks.push(lastBlock.add(RefreshBlocks));
      available.amounts.push(Replenish);
      lastBlock = lastBlock.add(RefreshBlocks);
    }
  }
  
  // you lose the merged-in account's givable, but keep its spendable
  // the merged-in account's txns are prepended to your pile
  function mergeAccounts(uint256 _id1, uint256 _id2) public onlyOracle {

    //given: move them from id2 to id1, then reassign
    uint256[] memory tranches2 = given[_id1];
    uint256 trancheId;
    Tranche storage tranche = tranches[0];
    for (uint256 i=0; i < tranches2.length; i++) {
      trancheId = tranches2[i];
      tranche = tranches[trancheId];
      tranche.sender = _id2;
      if (tranche.recipient != _id2) {
        given[_id2].push(trancheId);
      }
    }
    delete given[_id1];

    //received
    tranches2 = received[_id1];
    for (uint256 j=0; j < tranches2.length; j++) {
      trancheId = tranches2[j];
      tranche = tranches[trancheId];
      tranche.recipient = _id2;
      if (tranche.sender == _id1) {
        tranche.sender = _id2;
      }
      received[_id2].push(trancheId);
    }
    delete received[_id1];
  }
  
  function tagsIncludesTag(string memory _tags, string memory _tag) public pure returns (bool) {
    strings.slice memory s1 = _tag.toSlice();
    if (s1.empty()) {
      return true;
    }
    strings.slice memory s2 = _tags.toSlice();
    strings.slice memory s3 = s2.find(s1);
    return !s3.empty();
  }
  
  function trancheTotalsForId(uint256 _id) public view onlyOracle returns (uint256, uint256) {
    return (given[_id].length, received[_id].length);
  }

  function givenToJSON(uint256 _id) public view onlyOracle returns (string memory) {
    return tranchesToJSON(_id, 1, 10, true);
  }

  function receivedToJSON(uint256 _id) public view onlyOracle returns (string memory) {
    return tranchesToJSON(_id, 1, 10, false);
  }

  function tranchesToJSON(uint256 _id, uint256 _page, uint256 _size, bool sender) public view onlyOracle returns (string memory) {
    uint256[] memory trancheIds = sender ? given[_id] : received[_id];
    uint256 tStart = trancheIds.length < _page * _size ? 0 : trancheIds.length - _page * _size; // page 1 = most recent
    uint256 tEnd = trancheIds.length < tStart + _size ? trancheIds.length : tStart + _size;
    string memory json = "[";
    for (uint256 i = tStart; i < tEnd; i++) {
      string memory trancheString = trancheToJSON(trancheIds[i]);
      json = json.toSlice().concat(trancheString.toSlice());
      if (i < tEnd - 1) {
        json = json.toSlice().concat(",".toSlice());
      }
    }
    json = json.toSlice().concat("]".toSlice());
    return json;
  }

  function trancheToJSON(uint256 _trancheId) internal view returns (string memory) {
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
    out = out.toSlice().concat(',"block":'.toSlice());
    s = uint2str(tranche.block);
    out = out.toSlice().concat(s.toSlice());
    out = out.toSlice().concat(',"message":"'.toSlice());
    s = getMessageJSONFrom(tranche.message);
    out = out.toSlice().concat(s.toSlice());
    out = out.toSlice().concat('","tags":"'.toSlice());
    out = out.toSlice().concat(tranche.tags.toSlice());
    out = out.toSlice().concat('"}'.toSlice());
    return out;
  }

  /**
   * Handle quotes in messages, very clumsily, by stripping them out
   *
   * TODO don't just strip them out, replace them with something
   */
  function getMessageJSONFrom(string memory _s) internal pure returns (string memory) {
    strings.slice memory s = _s.toSlice();
    strings.slice memory part;
    s.split('"'.toSlice(), part);
    if (part._len == 0 || s._len == 0) {
      return _s;
    }
    string memory s2 = '';
    while (part._len > 0 && s._len > 0) {
      s2 = s2.toSlice().concat(part);
      s.split('"'.toSlice(), part);
    }
    s2 = s2.toSlice().concat(part);
    return s2;
  }

}
