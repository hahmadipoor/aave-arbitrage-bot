const { ethers } = require("hardhat");
const hre=require("hardhat");
const { POOL_ADDRESS_PROVIDER } = require("../constants/pool-addressesProvider");
const {getProvider, getSigner}=require("../utils/network-utils");
require("dotenv").config();


let provider, signer,simpleFlashLoanAddress;

const deploy=async()=>{

    const networkName=hre.network.name;    
    provider=getProvider(networkName);
    const signer=getSigner(network);
    const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
    simpleFlashLoan = await SimpleFlashLoan.deploy(
      POOL_ADDRESS_PROVIDER, 
      // {
      //   maxFeePerGas:14235692859,
      //   gasLimit: 30000000
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
