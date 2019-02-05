#! /usr/bin/env node

require('dotenv').config();

// Load all data from a YKarma dump file back into a brand new blockchain

const fs = require('fs');
const util = require('../routes/util');

doCompare();

function compareFiles() {
  // open the file from the command-line arg, parse the JSON, get the version
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
}
