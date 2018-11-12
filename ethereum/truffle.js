module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
    },
    production: {
      host: 'eth',
      port: 32769,
      network_id: '*',
    }
  },
};
