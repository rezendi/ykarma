const strings = artifacts.require('strings.sol');
const SafeMath = artifacts.require('SafeMath.sol');
const YKStructs = artifacts.require('YKStructs.sol');
const YKTranches = artifacts.require('YKTranches.sol');
const YKAccounts = artifacts.require('YKAccounts.sol');
const YKCommunities = artifacts.require('YKCommunities.sol');
const YKRewards = artifacts.require('YKRewards.sol');
const YKarma = artifacts.require('YKarma.sol');

module.exports = (deployer, network, accounts) => {
  const owner = accounts[0];
  deployer.deploy(strings, {from : owner}).then(() => {
    deployer.deploy(SafeMath, {from : owner}).then(() => {
      deployer.deploy(YKStructs, {from : owner}).then(() => {
        deployer.deploy(YKTranches, {from : owner}).then(() => {
          deployer.deploy(YKAccounts, {from : owner}).then(() => {
            deployer.link(strings, YKTranches, YKAccounts).then(() => {
              deployer.link(SafeMath, YKTranches).then(() => {
                deployer.deploy(YKCommunities, {from : owner}).then(() => {
                  deployer.deploy(YKRewards, {from : owner}).then(() => {
                    deployer.deploy(YKarma, YKTranches.address, YKAccounts.address, YKCommunities.address, YKRewards.address, {from : owner}).then(() => {
                      YKTranches.deployed().then((ykt) => {
                        ykt.transferOwnership(YKarma.address, {from: owner});
                        YKAccounts.deployed().then((yka) => {
                          yka.transferOwnership(YKarma.address, {from : owner});
                          YKCommunities.deployed().then((ykc) => {
                            ykc.transferOwnership(YKarma.address, {from : owner});
                            YKRewards.deployed().then((ykv) => {
                              ykv.transferOwnership(YKarma.address, {from : owner});
                              YKarma.deployed().then((yk) => {
                                yk.addNewCommunity(0, 0x0, 'ykarma.com', '{"name":"Alpha Karma"}', 'alpha').then(() => {
                                  yk.addNewAccount(1, 0, '{"name":"Jon"}', 'mailto:jon@rezendi.com').then(() => {
                                    yk.addNewAccount(1, 0, '{"name":"Test"}', 'mailto:test@rezendi.com').then(() => {
                                      yk.accountForId(1).then(() => {
                                        yk.replenish(1);
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
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
