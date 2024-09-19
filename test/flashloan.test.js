// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");
const ERC20ABI=require("../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");
const hre=require("hardhat");
const { POOL_ADDRESS_PROVIDER_ON_ETHEREUM } = require("../constants/pool-addresses");
const { DAI_ON_ETHEREUM } = require("../constants/token-addresses");
const {getProvider}=require("../utils/providers");
require("dotenv").config();

describe("FlashLoan", function () {

  let ethBalanceBeforeLoan, daiBalanceBeforeLoan, ethBalanceAfterLoan, daiBalanceAfterLoan;
  let simpleFlashLoan;
  let token;
  let signer;
  let provider;

  this.beforeAll(async function deploySimpleFlashLoan() {
 
    ////////1 setting the signer and provider provider 
    const networkName=hre.network.name;    
    provider=getProvider(networkName);
    let privateKey = networkName=="localhost"?"":process.env.PRIVATE_KEY;
    //let wallet = privateKey? new ethers.Wallet(privateKey):"";
    let wallet = privateKey? new ethers.Wallet(privateKey, provider):"";
    signer = networkName=="localhost"? (await ethers.getSigners())[0]: wallet;
    console.log(signer); 
    ethBalanceBeforeLoan = await provider.getBalance(await signer.address);
    console.log("ETH balance of signer before loan :",ethBalanceBeforeLoan, "wei =", ethers.formatEther(ethBalanceBeforeLoan)," ETH.");
    ///////////////2 deploying our Flashloan contract
    const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
    simpleFlashLoan = await SimpleFlashLoan.deploy(POOL_ADDRESS_PROVIDER_ON_ETHEREUM, {maxFeePerGas: 10566729409});
    const transactionReceipt = await simpleFlashLoan.deploymentTransaction().wait(1);
    console.log(transactionReceipt);
    const {gasPrice, gasUsed}=transactionReceipt;
    const transactionFee=gasPrice * gasUsed;
    console.log("transaction fee spend for deploying the contract : ", transactionFee,"wei= ", ethers.formatEther(transactionFee), "ETH");
    ///////////////3 transfering some of our dai from signer to the contract 
    token = await ethers.getContractAt("IERC20", DAI_ON_ETHEREUM);
    daiBalanceBeforeLoan=await token.balanceOf(signer.address);
    await token.connect(signer).transfer(simpleFlashLoan.target, 25000);
    const DAI = new ethers.Contract(DAI_ON_ETHEREUM, ERC20ABI.abi, provider);
    await DAI.connect(signer).transfer(await simpleFlashLoan.getAddress(),25000);  
    daiBalance=await token.balanceOf(signer.address);
    

  });

  it("should borrow some dai", async function () {
    
    expect(ethBalanceBeforeLoan).to.be.gt(0);
    ///////////////////4 executing the loan    
    const nonce= await signer.getNonce();
    const transactionResponse = await simpleFlashLoan.connect(signer).createFlashLoan(DAI_ON_ETHEREUM, 150000,{nonce:nonce}); // Borrow 150,000 DAI in a Flash Loan with no upfront collateral
    await transactionResponse.wait();
    const ethBalanceAfterLoan = await provider.getBalance(await signer.address);
    expect(ethBalanceBeforeLoan).to.be.gt(ethBalanceAfterLoan);
    console.log(transactionResponse); 

  });
});
