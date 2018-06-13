const strings = artifacts.require('strings.sol');
const Oracular = artifacts.require('Oracular.sol');
const YKStructs = artifacts.require('YKStructs.sol');
const YKTranches = artifacts.require('YKTranches.sol');
const YKAccounts = artifacts.require('YKAccounts.sol');
const YKCommunities = artifacts.require('YKCommunities.sol');
const YKVendors = artifacts.require('YKVendors.sol');
const YKarma = artifacts.require('YKarma.sol');

module.exports = (deployer, network, accounts) => {
  const owner = accounts[0];
  deployer.deploy(strings, {from : owner}).then(() => {
    deployer.deploy(YKStructs, {from : owner}).then(() => {
      deployer.deploy(YKTranches, {from : owner).then(() => {
        deployer.link(strings, YKTranches).then(() => {
          deployer.deploy(YKAccounts, {from : owner}).then(() => {
            deployer.deploy(YKCommunities, {from : owner}).then(() => {
              deployer.deploy(YKVendors, {from : owner}).then(() => {
                deployer.deploy(YKarma, YKTranches.address, YKAccounts.address, YKCommunities.address, YKVendors.address, {from : owner}).then(() => {
                  YKTranches.deployed().then((instance) => {
                    instance.transferOwnership(YKarma.address, {from: owner});
                  });
                  YKAccounts.deployed().then((instance) => {
                    instance.transferOwnership(YKarma.address, {from : owner});
                  });
                  YKCommunities.deployed().then((instance) => {
                    instance.transferOwnership(YKarma.address, {from : owner});
                  });
                  YKVendors.deployed().then((instance) => {
                    instance.transferOwnership(YKarma.address, {from : owner});
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
