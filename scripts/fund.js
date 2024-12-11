const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("funding contract...");
  const transactionResponse = await fundMe.fund({
    value: 1000000000000000000n,
  });
  await transactionResponse.wait(1);
  console.log("funded");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// yarn hardhat run scripts/fund.js --network localhost 