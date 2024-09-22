const { ethers } = require("hardhat");
const hre=require("hardhat");
const { POOL_ADDRESS_PROVIDER_ON_ETHEREUM } = require("../constants/pool-addresses");
const {getProvider, getSigner}=require("../utils/utilities");
require("dotenv").config();


let provider, signer,simpleFlashLoanAddress;

const deploy=async()=>{

    const networkName=hre.network.name;    
    provider=getProvider(networkName);
    const signer=getSigner(network);
    
    
    const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
    simpleFlashLoan = await SimpleFlashLoan.deploy(
      POOL_ADDRESS_PROVIDER_ON_ETHEREUM, 
      // {
      //   maxFeePerGas:11691908503,
      //   gasLimit: 2208390
      // }
    );
    const transactionReceipt = await simpleFlashLoan.deploymentTransaction().wait(1);
    return transactionReceipt;
}


// deploy().then((txReceipt)=>{  
//   console.log("contract deployed: ", txReceipt);
//   simpleFlashLoanAddress=txReceipt.contractAddress;
//   const {gasPrice, gasUsed}=txReceipt;
//   const transactionFee=gasPrice * gasUsed;
//   console.log("transaction fee spend for deploying the contract : ", transactionFee,"wei= ", ethers.formatEther(transactionFee), "ETH");  
// })


module.exports={
  deploy
}