const { ethers } = require("hardhat");
require("dotenv").config();

const executeFlashloan = async (params)=>{

    //const transactionResponse = await simpleFlashLoan.connect(signer).createFlashLoan(DAI_ON_ETHEREUM, 150000,{nonce:nonce}); // Borrow 150,000 DAI in a Flash Loan with no upfront collateral
    const Flashloan= new ethers.Contract(params.simpleFlashLoanAddress, params.simpleFlashLoanJson.abi, params.signer);
    const tx=await Flashloan.createFlashLoan(
        {
            loanAmount: params.loanAmount, 
            routes: [
                {
                    hops: params.hops,
                    part: 10000
                }
            ]
        }, 
        {
            // gasLimit: params.gasLimit, 
            // gasPrice: params.gasPrice,
            nonce:params.nonce
        }
    );
    return tx;
}

module.exports={executeFlashloan}

