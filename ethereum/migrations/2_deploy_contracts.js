const strings = artifacts.require('strings.sol');
const Oracular = artifacts.require('Oracular.sol');
const YKStructs = artifacts.require('YKStructs.sol');
const YKTranches = artifacts.require('YKTranches.sol');
const YKAccounts = artifacts.require('YKAccounts.sol');
const YKCommunities = artifacts.require('YKCommunities.sol');
const YKVendors = artifacts.require('YKVendors.sol');
const YKarma = artifacts.require('YKarma.sol');

module.exports = (deployer, network, accounts) => {
  deployer.deploy(strings, {from : accounts[0]}).then(() => {
    deployer.deploy(YKStructs, {from : accounts[0]}).then(() => {
      deployer.deploy(YKTranches, {from : accounts[0]}).then(() => {
        deployer.link(strings, YKTranches).then(() => {
          deployer.deploy(YKAccounts, {from : accounts[0]}).then(() => {
            deployer.deploy(YKCommunities, {from : accounts[0]}).then(() => {
              deployer.deploy(YKVendors, {from : accounts[0]}).then(() => {
                deployer.deploy(YKarma, YKTranches.address, YKAccounts.address, YKCommunities.address, YKVendors.address, {from : accounts[0]}).then(() => {
                  YKTranches.deployed().then((instance) => {
                    instance.transferOwnership(YKarma.address, {from: accounts[0]});
                  });
                  YKAccounts.deployed().then((instance) => {
                    instance.transferOwnership(YKarma.address, {from : accounts[0]});
                  });
                  YKCommunities.deployed().then((instance) => {
                    instance.transferOwnership(YKarma.address, {from : accounts[0]});
                  });
                  YKVendors.deployed().then((instance) => {
                    instance.transferOwnership(YKarma.address, {from : accounts[0]});
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};
