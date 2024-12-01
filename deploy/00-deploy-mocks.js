const { network } = require("hardhat");
const {
  developmentChains,
  DEIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    // chainId === 31337 // developmentChains.includes(network.name)
    log("local network...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DEIMALS, INITIAL_ANSWER],
    });
    log("mock deployed");
    log("----------------------------------");
  }
};

module.exports.tags = ["all", "mocks"]; // not necessary for deploying

// yarn hardhat deploy
