module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      from: "0x0000000000000000000000000000000000000001"
    },
    production: {
      host: 'eth',
      port: 8545,
      network_id: '*',
      from: "0x00bd138abd70e2f00903268f3db08f2d25677c9e"
    }
  },
  optimizer: {
    "enabled": true,
    "runs": 1
  }
};
