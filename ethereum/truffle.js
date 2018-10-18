module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    production: {
      host: 'eth',
      port: 8545,
      network_id: '*',
      gas: 4712388,
      gasPrice: 20000000000,
      from: "00aa39d30f0d20ff03a22ccfc30b7efbfca597c2"
    }
  },
  optimizer: {
    "enabled": true,
    "runs": 1
  }
};
