const strings = artifacts.require('strings.sol');
const SafeMath = artifacts.require('SafeMath.sol');
const YKStructs = artifacts.require('YKStructs.sol');
const YKTranches = artifacts.require('YKTranches.sol');
const YKAccounts = artifacts.require('YKAccounts.sol');
const YKCommunities = artifacts.require('YKCommunities.sol');
const YKRewards = artifacts.require('YKRewards.sol');
const YKarma = artifacts.require('YKarma.sol');
const YKarmaDirect = artifacts.require('YKarma.sol');

const fs = require('fs');
const envFile = '../server/.env';

const isTestArg = process.argv.slice(-1)[0] === 'test';
const isTestEnv = process.env.TRUFFLE_ENV === 'test';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
const BYTES_ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000';

module.exports = (deployer, network, accounts) => {
  const owner = accounts[0];
  var adminEmail = '';
  deployer.then(async () => {

    var data = await checkEnvFile();
    adminEmail = getAdminEmail(data);
    // if we already have a YKarma, don't deploy
    if (process.env.TRUFFLE_ENV === 'production') {
      if (process.env.YKARMA_ADDRESS) return;
      if (data.indexOf("YKARMA_ADDRESS=") >= 0) return;
    }

    console.log("deploying new contracts");
    await deployer.deploy(strings, {from : owner});
    await deployer.deploy(SafeMath, {from : owner});
    await deployer.deploy(YKStructs, {from : owner});
    await deployer.deploy(YKTranches, 0, 0, 0, 0, {from : owner});
    await deployer.deploy(YKAccounts, {from : owner});
    await deployer.link(strings, YKTranches, YKAccounts);
    await deployer.link(SafeMath, YKTranches);
    await deployer.deploy(YKCommunities, {from : owner});
    await deployer.deploy(YKRewards, {from : owner});
    await deployer.deploy(YKarmaDirect, YKTranches.address, YKAccounts.address, YKCommunities.address, YKRewards.address, {from : owner});
    await deployer.deploy(YKarma, YKTranches.address, YKAccounts.address, YKCommunities.address, YKRewards.address, {from : owner});
    const ykt = await YKTranches.deployed();
    await ykt.addOracle(YKarma.address, {from: owner});
    const yka = await YKAccounts.deployed();
    await yka.addOracle(YKarma.address, {from : owner});
    const ykc = await YKCommunities.deployed();
    await ykc.addOracle(YKarma.address, {from : owner});
    const ykv = await YKRewards.deployed();
    await ykv.addOracle(YKarma.address, {from : owner});
    const yk = await YKarma.deployed();
    const yk2 = await YKarmaDirect.deployed();
    if (!isTestArg) {
      setEnvAddress(YKarma.address);
    }
    if (!isTestEnv) {
      return;
    }

    // set up initial values
    console.log("adding test data...")
    await yk.addEditCommunity(0, ADDRESS_ZERO, BYTES_ZERO, 'ykarma.com', '{"name":"Alpha Karma", "description":"An initial test community, probably ephemeral"}', 'alpha,test');
    await yk.addNewAccount(1, ADDRESS_ZERO, '{"name":"Jon"}', BYTES_ZERO, 'mailto:' + adminEmail);
    await yk.replenish(1);
    await yk.addNewAccount(1, ADDRESS_ZERO, '{"name":"Test"}', BYTES_ZERO, 'mailto:test@example.com');
    await yk.addNewAccount(1, ADDRESS_ZERO, '{"name":"Test Two"}', BYTES_ZERO, 'mailto:test2@example.com');
    await yk.replenish(2);
    await yk.give(2, 1, 'mailto:'+adminEmail, 60, "Just a message");
    await yk.give(1, 1, 'mailto:test@example.com', 20, "Another message");
    await yk.addNewAccount(1, ADDRESS_ZERO, '{"name":"Test Three"}', BYTES_ZERO, 'slack:TEAM1-USER1');
    await yk.addNewAccount(1, ADDRESS_ZERO, '{"name":"Test Four"}', BYTES_ZERO, 'slack:TEAM1-USER2');
    await yk.replenish(4);
    await yk.addNewReward(2, 10, 2, "alpha", '{"name":"A Test Reward"}', BYTES_ZERO);
    await yk.addEditCommunity(1, ADDRESS_ZERO, BYTES_ZERO, 'ykarma.com', '{"name":"Alpha Karma", "description":"An initial test community, probably ephemeral", "slackTeams":["TEAM1"]}', 'alpha,test');
    await yk.addEditCommunity(0, ADDRESS_ZERO, BYTES_ZERO, 'test.com', '{"name":"One To Many", "description":"Just a test comm", "slackTeams":["TEAM2"]}', 'test');
    await yk.addNewAccount(2, ADDRESS_ZERO, '{"name":"Admin User", "teamIds":["TEAM2"]}', BYTES_ZERO, 'mailto:admin@test.com');
    await yk.addUrlToExistingAccount(6, "slack:TEAM2-USER3");
    await yk.replenish(6);
    await yk.addNewReward(6, 2, 10, "test", '{"name":"Another Test Reward"}', BYTES_ZERO);
    await yk.addNewAccount(2, ADDRESS_ZERO, '{"name":"Test User", "teamIds":["TEAM2"]}', BYTES_ZERO, 'mailto:test@test.com');
    await yk.addUrlToExistingAccount(7, "slack:TEAM2-USER4");
    await yk.replenish(7);
    await yk.addNewAccount(1, ADDRESS_ZERO, '{"name":"Merge Test"}', BYTES_ZERO, 'slack:TEAM1-USER3');
    await yk.addUrlToExistingAccount(8, "mailto:merged@example.com");
    await yk.addNewAccount(2, ADDRESS_ZERO, '{"name":"Merged Test"}', BYTES_ZERO, 'slack:TEAM2-USER5');
    await yk.mergeAccounts(9, 8);
    await yk.replenish(8);
  });
};

function checkEnvFile() {
  return new Promise(function(resolve, reject){
    fs.readFile(envFile, "utf-8", (err, data) => {
        err ? resolve('') : resolve(data);
    });
  });
}

function getAdminEmail(data) {
  if (process.env.ADMIN_EMAIL) {
    console.log("admin email " + process.env.ADMIN_EMAIL);
    return process.env.ADMIN_EMAIL;
  }
  var idx = data.indexOf('ADMIN_EMAIL');
  if (idx > 0) {
    var start = data.indexOf('=', idx+1);
    var end = data.indexOf('\n', start+1);
    var addr = data.substring(start+1, end);
    console.log("admin email " + addr);
    return addr;
  }
  console.log("admin email not found");
  return "n/a";
}

function setEnvAddress(address) {
  // update .env if appropriate
  console.log("setting env address in", envFile);
  if (!fs.existsSync(envFile)) {
    console.log("file does not exist:", envFile);
    return;
}
  fs.readFile(envFile, "utf8", (err, data) => {
    if (err) throw err;
    var s = ""+data;
    var idx = s.indexOf('YKARMA_ADDRESS=');
    if (idx > 0) {
      var start = s.indexOf('=', idx+1);
      var end = s.indexOf('\n', start+1);
      var addr = s.substring(start+1, end);
      s = s.replace(addr, ""+address);
    } else {
      s = s +`\nYKARMA_ADDRESS=${address}\n`;
    }
    fs.writeFile(envFile, s, 'utf8', (err2) => {
      if (err2) throw err2;
      console.log("Address written", address);
    });
  });
}