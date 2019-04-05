#! /usr/bin/env node

require('dotenv').config();

const eth = require('../routes/eth');

var fromAccount, blockNumber;

console.log(new Date().toUTCString());
console.log("ykarma", process.env.YKARMA_ADDRESS);
eth.web3.eth.getAccounts().then((ethAccounts) => {
  fromAccount = ethAccounts[0];
  eth.web3.eth.getBlockNumber((error, bn) => {
    console.log("blockNumber", bn);
    blockNumber = bn;
    doTheThing();
    doTheOtherThing();
  });
});

function doTheThing() {
  //var method = eth.contract.methods.mergeAccounts(31,32);
  var method = eth.contract.methods.mergeAccounts(31,32);
  method.send({from:fromAccount, gas: eth.GAS}).on('error', (error) => {
    console.log('error running', method._method);
    console.log('send error', error);
  }).on('confirmation', (number, receipt) => {
    if (number === 1) {
      console.log('merged!');
    }
  });
}

function doTheOtherThing() {
  var method = eth.contract.methods.mergeAccounts(24,22);
  method.send({from:fromAccount, gas: eth.GAS}).on('error', (error) => {
    console.log('error running', method._method);
    console.log('send error', error);
  }).on('confirmation', (number, receipt) => {
    if (number === 1) {
      console.log('merged!');
    }
  });
}
