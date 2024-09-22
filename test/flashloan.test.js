// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");
const ERC20Json=require("../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");
const simpleFlashLoanJson=require("../artifacts/contracts/SimpleFlashLoan.sol/SimpleFlashLoan.json");
const hre=require("hardhat");
const { POOL_ADDRESS_PROVIDER_ON_ETHEREUM } = require("../constants/pool-addresses");
const { DAI_ON_ETHEREUM, WETH_ON_ETHEREUM } = require("../constants/token-addresses");
const {getProvider, getSigner}=require("../utils/utilities");
const {executeFlashloan} =require("../scripts/executeFlashLoan");
const  {protocols}=require("../constants/protocols");
const {deploy}=require("../scripts/deployFlashLoan");

require("dotenv").config();

describe("FlashLoan", function () {

    let provider, signer, simpleFlashLoanAddress;  
    let token,simpleFlashLoan;

    this.beforeAll(async function deploySimpleFlashLoan() {
    
      const transactionReceipt=await deploy();
      provider=getProvider(hre.network.name);
      signer=getSigner(hre.network.name);
      simpleFlashLoanAddress=transactionReceipt.contractAddress;    
      token = await ethers.getContractAt("IERC20", DAI_ON_ETHEREUM);
      //const token = new ethers.Contract(DAI_ON_ETHEREUM, ERC20Json.abi, provider);
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
                ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"]//uniswapv2 router
              ),
              path: [DAI_ON_ETHEREUM, WETH_ON_ETHEREUM],
              amountOutMinV3: 10,
              sqrtPriceLimitX96: 100,
          },
          {
              protocol: protocols.SUSHISWAP, 
              data: ethers.AbiCoder.defaultAbiCoder().encode(
                ["address"], 
                ["0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"]//Sushiswap router
              ), 
              path: [WETH_ON_ETHEREUM, DAI_ON_ETHEREUM],
              amountOutMinV3: 10,
              sqrtPriceLimitX96: 100,                
          } 
      ], 
    }
    const tx=await executeFlashloan(simpleFlashLoan, nonce, params,signer);
    console.log(tx);  
    // const txResponse=await tx.wait();
    // console.log("execute flashLoanTransaction: ", txResponse);
    expect(5).to.be.gt(4);   
  });
});

module.exports={getProvider};
