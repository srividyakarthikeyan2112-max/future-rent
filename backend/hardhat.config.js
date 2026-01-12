





require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

/**
 * Shardeum network config
 * Uses SHARDEUM_RPC and PRIVATE_KEY from .env
 */

module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {},

    localhost: {
      url: process.env.RPC_URL || "http://127.0.0.1:8545",
    },

    shardeum: {
      url: process.env.SHARDEUM_RPC || "https://rpc-testnet.shardeum.org",
      chainId: 8082,
      accounts: process.env.PRIVATE_KEY
        ? [process.env.PRIVATE_KEY]
        : [],
    },
  },
};
