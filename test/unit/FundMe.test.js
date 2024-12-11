const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe, deployer, mockV3Aggregator;
      const sendValue = ethers.parseEther("1");  //1000000000000000000n; 
      const deploy = deployments;
      beforeEach(async function () {
        //const accounts = await ethers.getSigners(); // return account section from helper config
        //const accountZero = accounts[0];
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]); // allowes us to run entire deploy folder with as many tags as we want 
        fundMe = await ethers.getContract("FundMe", deployer); // get most recent deployment / from deployer // fundMe contract will be deployed by deployer
        mockV3Aggregator = await ethers.getContract( // get most recent deployment / from deployer
          "MockV3Aggregator",
          deployer,
        );
      });
      describe("storage variables", async function(){
        it("s_funders variable sets correctly", async function(){
          await fundMe.fund({ value: sendValue.toString() });
          const getterFunder = await fundMe.getFunder(0);
          assert.equal(getterFunder, deployer);
        });
        it("s_addressToAmountFunded variable sets correctly", async function(){
          await fundMe.fund({ value: sendValue.toString() });
          const gettersAddressToAmountFunded = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(gettersAddressToAmountFunded, sendValue.toString());
        });
      });

      describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
          if (network.chainId === 31337) {
            const response = await fundMe.priceFeed();
            assert.equal(response, mockV3Aggregator.target);
          }
        });
        it("sets the owner correctly", async function(){
          const getterOwner = await fundMe.getOwner();
          assert.equal(getterOwner, deployer);
        });
      });

      // fund(); //
      describe("fund function", async function () {
        it("fails if you dont send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWithCustomError(
            fundMe,
            "FundMe__NotEnoughETH",
          ); // to.be.reverted
        });
        beforeEach(async function(){
          await fundMe.fund({ value: sendValue.toString() });
        })
        it("updated the amount funded data structure", async function () {
          //await fundMe.fund({ value: sendValue.toString() }); // if we dont have beforeEach
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("adds funder to array of funders", async function () {
          //await fundMe.fund({ value: sendValue.toString() });  // if we dont have beforeEach
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      })


      // withdraw(); //
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
            const fundMeConnectedContract = await fundMe.connect(accounts[i]); // to be deployed not from deployer but from another accounts
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target
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
          await attackerConnectedContract.fund({ value: sendValue });
          await expect(
            attackerConnectedContract.withdraw(),
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
      });
    });

// 33,37,64,69,81


// yarn hardhat test test/unit/FundMe.test.js



