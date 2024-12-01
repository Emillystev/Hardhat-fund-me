// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; // yarn add --dev @chainlink/contracts
import "./PriceConverter.sol";

error FundMe__NotOwner();
error FundMe__NotEnoughETH();
error FundMe__CallFailed();

contract FundMe {
    using PriceConverter for uint256;

    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;

    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface private s_priceFeed;
    
    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    modifier onlyOwner {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        if(msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD){
            revert FundMe__NotEnoughETH();
        } 
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    
    // function getVersion() public view returns (uint256){
    //     // ETH/USD price feed address of Sepolia Network.
    //     AggregatorV3Interface s_priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    //     return s_priceFeed.version();
    // }
    
    function withdraw() public onlyOwner {
        uint256 fundersLength = s_funders.length;
        for (uint256 funderIndex= 0; funderIndex < fundersLength; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        if(!callSuccess){
            revert FundMe__CallFailed();
        }
    }

    function getOwner() external view returns(address){
        return i_owner;
    }

    function getFunder(uint256 index) external view returns(address){
        return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) external view returns(uint256){
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() external view returns(AggregatorV3Interface){
        return s_priceFeed;
    }

}


// yarn add -D hardhat-deploy     yarn add hardhat-deploy --dev
// yarn add --dev hardhat-deploy-ethers     npm install --save-dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers