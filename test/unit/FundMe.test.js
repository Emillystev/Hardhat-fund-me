const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe, deployer, mockV3Aggregator;
      const sendValue = 1000000000000000000n; //ethers.utils.parseEther("1");
      const deploy = deployments;
      beforeEach(async function () {
        //const accounts = await ethers.getSigners(); // return account section from helper config
        //const accountzERO = ACCOUNTS[0];
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer); // most recent deployment // from deployer
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer,
        );
      });
      describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
          if (network.chainId === 31337) {
            const response = await fundMe.priceFeed();
            assert.equal(response, mockV3Aggregator.target);
          }
        });
      });
      describe("fund function", async function () {
        it("fails if you dont send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWithCustomError(
            fundMe,
            "FundMe__NotEnoughETH",
          ); // to.be.reverted
        });
        it("updated the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue.toString() });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue.toString() });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("withdraw function", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue.toString() });
        });
        it("fails if owner is not the msg.sender", async function () {
          expect(fundMe.withdraw()).to.be.revertedWithCustomError(
            fundMe,
            "FundMe__NotOwner",
          );
        });
        it("withdraw ETH from a single function", async function () {
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const startingDeployerBalance =
            await ethers.provider.getBalance(deployer);

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait();

          const { gasUsed, gasPrice } = transactionReceipt;

          const gasCost = gasUsed * gasPrice;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const endingDeployerBalance =
            await ethers.provider.getBalance(deployer);

          assert.equal(endingFundMeBalance.toString(), 0);
          assert.equal(
            (startingFundMeBalance + startingDeployerBalance).toString(),
            (endingDeployerBalance + gasCost).toString(),
          );
        });
        it("allows us to withdraw with multiple funders", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            // 0 is deployer
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const startingDeployerBalance =
            await ethers.provider.getBalance(deployer);

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait();
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasUsed * gasPrice;

          await expect(fundMe.getFunder(0)).to.be.reverted;
          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0,
            );
          }
        });
        it("only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(
            attackerConnectedContract.withdraw(),
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
      });
    });
