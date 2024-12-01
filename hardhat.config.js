require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
require("hardhat-gas-reporter"); // yarn add hardhat-gas-reporter --save-dev
require("solidity-coverage"); // yarn add solidity-coverage --save-dev

const RPC_URL_SEPOLIA = process.env.RPC_URL_SEPOLIA;
const PRIVATE_KEY_MINE = process.env.PRIVATE_KEY_MINE;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

module.exports = {
  // solidity: "0.8.8",
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  networks: {
    sepolia: {
      url: RPC_URL_SEPOLIA,
      accounts: [PRIVATE_KEY_MINE],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [PRIVATE_KEY],
      chainId: 31337,
    },
    // Add other network configurations if needed
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    offline: true,
    // token: "MATIC",
  },
  coverage: {
    enabled: true,
    outputFile: "coverage-report.txt",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};
