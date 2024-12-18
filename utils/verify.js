const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("verifyin contract.....");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("already verified");
    } else {
      console.log(e);
    }
  }
}

module.exports = { verify };

// npm install --save-dev @nomiclabs/hardhat-etherscan
