#! /usr/bin/env node

require('dotenv').config();

// Load all data from a YKarma dump file back into a brand new blockchain

const fs = require('fs');
const util = require('../routes/util');

var reasons = 0;

compareFiles();

function compareFiles() {
  const file1 = process.argv[2];
  const fileToLoad1 = __dirname + "/" + file1;
  if (!fs.existsSync(fileToLoad1)) {
    console.log("file does not exist:", fileToLoad1);
    return;
  }

  const file2 = process.argv[3];
  const fileToLoad2 = __dirname + "/" + file2;
  if (!fs.existsSync(fileToLoad2)) {
    console.log("file does not exist:", fileToLoad2);
    return;
  }

  fs.readFile(fileToLoad1, "utf8", (err, data) => {
    if (err) throw err;
    fs.readFile(fileToLoad2, "utf8", (err2, data2) => {
      if (err2) throw err2;
      var vals = JSON.parse(data);
      var vals2 = JSON.parse(data2);
      doCompare(vals, vals2);
    });
  });
}

function doCompare(v1, v2) {
  console.log("comparing");
  var cs1 = v1.communities.sort((a,b) => { return a.id - b.id});
  var cs2 = v2.communities.sort((a,b) => { return a.id - b.id});
  cs1.length === cs2.length ? noop() : nope("Community length mismatch");
  for (var i=0; i<cs1.length; i++) {
    var c1 = cs1[i];
    var c2 = cs2[i];
    c1.domain       === c2.domain ? noop() : nope("Community domain mismatch");
    c1.tags         === c2.tags ? noop() : nope("Community tags mismatch");
    c1.adminAddress === c2.adminAddress ? noop() : nope("Community adminAddress mismatch");
    c1.flags        === c2.flags ? noop() : nope("Community flags mismatch");
    JSON.stringify(c1.metadata) === JSON.stringify(c2.metadata) ? noop() : nope("Community metadata mismatch");
    
    var as1 = c1.accounts.sort((a,b) => { return a.id - b.id});;
    var as2 = c2.accounts.sort((a,b) => { return a.id - b.id});;
    as1.length === as2.length ? noop() : nope("Account length mismatch", c1, c2);
    for (var j=0; j<as1.length; j++) {
      var a1 = as1[j];
      var a2 = as2[j];
      // console.log("Comparing", a1.metadata);
      a1.communityId  === a2.communityId ? noop() : nope("Account community mismatch", a1, a2);
      a1.tags         === a2.tags ? noop() : nope("Account tags mismatch", a1, a2);
      a1.userAddress  === a2.userAddress ? noop() : nope("Account userAddress mismatch", a1, a2);
      a1.flags        === a2.flags ? noop() : nope("Account flags mismatch", a1, a2);
      a1.urls         === a2.urls ? noop() : nope("Account urls mismatch", a1, a2);
      a1.givable      === a2.givable ? noop() : nope("userAddress givable mismatch", a1, a2);
      JSON.stringify(a1.metadata) === JSON.stringify(a2.metadata) ? noop() : nope("Account metadata mismatch", a1, a2);

      var gs1 = a1.given.sort((a,b) => { return a.block - b.block}).filter((a,b) => { return a.sender != a.receiver });
      var gs2 = a2.given.sort((a,b) => { return a.block - b.block}).filter((a,b) => { return a.sender != a.receiver });
      for (var k=0; k<gs1.length; k++) {
        var t1 = gs1[k];
        var t2 = gs2[k];
        t1.amount     === t2.amount ? noop() : nope("Tranche given amount mismatch", t1, t2);
        t1.available  === t2.available ? noop() : nope("Tranche given available mismatch", t1, t2);
        t1.message    === t2.message ? noop() : nope("Tranche given message mismatch", t1, t2);
        t1.tags       === t2.tags ? noop() : nope("Tranchegiven  tags mismatch", t1, t2);
      }

      var rs1 = a1.received.sort((a,b) => { return a.block - b.block}).filter((a,b) => { return a.sender != a.receiver });
      var rs2 = a2.received.sort((a,b) => { return a.block - b.block}).filter((a,b) => { return a.sender != a.receiver });
      for (var k=0; k<rs1.length; k++) {
        var t1 = rs1[k];
        var t2 = rs2[k];
        t1.amount     === t2.amount ? noop() : nope("Tranche received amount mismatch", t1, t2);
        t1.available  === t2.available ? noop() : nope("Tranche received available mismatch", t1, t2);
        t1.message    === t2.message ? noop() : nope("Tranche received message mismatch", t1, t2);
        t1.tags       === t2.tags ? noop() : nope("Tranche received tags mismatch", t1, t2);
      }

      var os1 = a1.rewards.sort((a,b) => { return a.created - b.created});
      var os2 = a2.rewards.sort((a,b) => { return a.created - b.created});
      for (var k=0; k<os1.length; k++) {
        var r1 = os1[k];
        var r2 = os2[k];
        r1.cost     === r2.cost ? noop() : nope("Reward offered cost mismatch", r1, r2);
        r1.quantity === r2.quantity ? noop() : nope("Reward offered quantity mismatch", r1, r2);
        r1.flags    === r2.flags ? noop() : nope("Reward offered flags mismatch", r1, r2);
        r1.tag      === r2.tag ? noop() : nope("Reward offered tag mismatch", r1, r2);
        JSON.stringify(r1.metadata) === JSON.stringify(r2.metadata) ? noop() : nope("Reward offered metadata mismatch", r1, r2);
      }

      var rws1 = a1.rewards.sort((a,b) => { return a.created - b.created});
      var rws2 = a2.rewards.sort((a,b) => { return a.created - b.created});
      for (var k=0; k<rws1.length; k++) {
        var r1 = rws1[k];
        var r2 = rws2[k];
        r1.cost     === r2.cost ? noop() : nope("Reward owned cost mismatch", r1, r2);
        r1.quantity === r2.quantity ? noop() : nope("Reward owned quantity mismatch", r1, r2);
        r1.flags    === r2.flags ? noop() : nope("Reward owned flags mismatch", r1, r2);
        r1.tag      === r2.tag ? noop() : nope("Reward owned tag mismatch", r1, r2);
        JSON.stringify(r1.metadata) === JSON.stringify(r2.metadata) ? noop() : nope("Reward owned metadata mismatch", r1, r2);
      }
    }
  }
  
  console.log("mismatches", reasons);
}

function noop() {
  
}

function nope(reason, first, second) {
  if (reasons == 0) {
    console.log(reason, first);
    console.log(reason, second);
  } else {
    console.log(reason);
  }
  reasons++;
}
