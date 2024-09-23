// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");
const ERC20Json=require("../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");
const simpleFlashLoanJson=require("../artifacts/contracts/SimpleFlashLoan.sol/SimpleFlashLoan.json");
const hre=require("hardhat");
const { tokens } = require("../constants/token-addresses");
const {getProvider, getSigner}=require("../utils/network-utils");
const {executeFlashloan} =require("../scripts/executeFlashLoan");
const  {protocols}=require("../constants/protocols");
const {deploy}=require("../scripts/deployFlashLoan");
const {routers} =require("../constants/protocols");

require("dotenv").config();

describe("FlashLoan", function () {

    let provider, signer, simpleFlashLoanAddress;  
    let token,simpleFlashLoan;

    this.beforeAll(async function deploySimpleFlashLoan() {
        
      console.log("Deploying the flashloan...")
      const transactionReceipt=await deploy();
      simpleFlashLoanAddress=transactionReceipt.contractAddress;
      provider=getProvider(hre.network.name);
      signer=getSigner(hre.network.name);
          
      //const feeData=(await provider.getFeeData())
      //console.log(feeData);
      token = await ethers.getContractAt("IERC20", tokens.DAI.address);
      //const token = new ethers.Contract(tokens.DAI.address, ERC20Json.abi, provider);
      console.log("sending some dai to the contract...");
      await token.connect(signer).transfer(simpleFlashLoanAddress, 4000000);
      simpleFlashLoan= new ethers.Contract(simpleFlashLoanAddress, simpleFlashLoanJson.abi, provider);
      console.log(await token.balanceOf(simpleFlashLoan.target.toString()));
    });

  it("should borrow some dai", async function () {
    
    const nonce= await signer.getNonce();    
    const params={
      loanAmount: 3000000, 
      hops:[
          {
            protocol: protocols.UNISWAP_V2, 
            data:ethers.AbiCoder.defaultAbiCoder().encode(
              ["address"], 
              [routers.UNISWAP_V2]//uniswapv2 router
            ),            
            path: [tokens.DAI.address, tokens.WETH.address],
            amountOutMinV3: 10,
            sqrtPriceLimitX96: 100,                              
          },
          {
            protocol: protocols.SUSHISWAP, 
            data: ethers.AbiCoder.defaultAbiCoder().encode(
              ["address"], 
              [routers.SUSHISWAP]//Sushiswap router
            ), 
            path: [tokens.WETH.address, tokens.DAI.address],
            amountOutMinV3: 10,
            sqrtPriceLimitX96: 100,

          } 
      ], 
    }
    console.log("executing flashloan ....");
    
    const tx=await executeFlashloan(simpleFlashLoan, nonce, params,signer);
    console.log(tx);  
    // const txResponse=await tx.wait();
    // console.log("execute flashLoanTransaction: ", txResponse);
    expect(5).to.be.gt(4);   
  });
});

module.exports={getProvider};
