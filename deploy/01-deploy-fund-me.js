const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
  DEIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");
//const helperConfig = require("../helper-hardhat-config");
//const networkConfig = helperConfig.networkConfig;

const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => { // async(hre)
  // const { getNamedAccounts, deployments } = hre // module.exports = async(hre)
  // hre.getNamedAccounts()
  // hre.deployments
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts(); // mostRecentDeployer
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) { 
    const ethUsdAggregator = await deployments.get("MockV3Aggregator"); // await get("MockV3Aggregator");   const {deploy, log, get} = deployments;
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1, // network.config. means taking something
  });
  log("---------------------------------------");

  // const fundMeFactory = await ethers.getContractFactory("FundMe");
  // const fundMe = await fundMeFactory.deploy(ethUsdPriceFeedAddress);
  // log(fundMe.target);

  // const mock = await deployments.get("MockV3Aggregator");
  // log(mock);

  // verify on testnet
  // if (!developmentChains.includes(network.name)) {
  //   await verify(fundMe.target, args);
  // }
};

module.exports.tags = ["all", "fundme"]; // // yarn hardhat deploy --tags fundme --network sepolia

// yarn hardhat deploy

// control + f (searching for something)

