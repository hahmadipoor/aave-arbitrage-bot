const { ethers } = require("hardhat");
const { DAI_ON_ETHEREUM } = require("../constants/token-addresses");
require("dotenv").config();

const executeFlashloan = async (simpleFlashLoan, nonce, params, signer)=>{

    //const transactionResponse = await simpleFlashLoan.connect(signer).createFlashLoan(DAI_ON_ETHEREUM, 150000,{nonce:nonce}); // Borrow 150,000 DAI in a Flash Loan with no upfront collateral
    const tx=await simpleFlashLoan.connect(signer).createFlashLoan(
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
            // gasLimit:23376, 
            // gasPrice:13446636527,
            nonce:nonce
        }
    );
    return tx;
}

module.exports={executeFlashloan}

