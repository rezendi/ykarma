module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '4',
      gas: 6721975,
    }
  },
  optimizer: {
    "enabled": true,
    "runs": 1
  }
};
