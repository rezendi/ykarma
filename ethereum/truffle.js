module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      gas: 6721975,
    },
    production: {
      host: 'eth',
      port: 8545,
      network_id: '*'
    }
  },
  optimizer: {
    "enabled": true,
    "runs": 1
  }
};
