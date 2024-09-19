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

  this.beforeAll(async function deploySimpleFlashLoan() {
 
    ////////1 setting the signer and provider provider 
    const networkName=hre.network.name;    
    const provider=getProvider(networkName);
    let privateKey = networkName=="localhost"?"":process.env.PRIVATE_KEY;
    //let wallet = privateKey? new ethers.Wallet(privateKey):"";
    let wallet = privateKey? new ethers.Wallet(privateKey, provider):"";
    const signer = networkName=="localhost"? (await ethers.getSigners())[0]: wallet;
    console.log(signer); 
    ethBalanceBeforeLoan = await provider.getBalance(await signer.address);
    console.log("ETH balance of signer before loan :",ethBalanceBeforeLoan, "wei =", ethers.formatEther(ethBalanceBeforeLoan)," ETH.");
    ///////////////2 deploying our Flashloan contract
    const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
    simpleFlashLoan = await SimpleFlashLoan.deploy(POOL_ADDRESS_PROVIDER_ON_ETHEREUM, {maxFeePerGas: 8221415070});
    const transactionReceipt = await simpleFlashLoan.deploymentTransaction().wait(1);
    console.log(transactionReceipt);
    const {gasPrice, gasUsed}=transactionReceipt;
    const transactionFee=gasPrice * gasUsed;
    console.log("transaction fee spend for deploying the contract : ", ethers.formatEther(transactionFee), "ETH");
    ///////////////3 transfering some of our dai from signer to the contract 
    token = await ethers.getContractAt("IERC20", DAI_ON_ETHEREUM);
    await token.connect(signer).transfer(simpleFlashLoan.target, 2);
    daiBalanceBeforeLoan=await token.balanceOf(signer.address)
    console.log("DAI balance of signer before loan: ",daiBalanceBeforeLoan, "wei =", ethers.formatEther(daiBalanceBeforeLoan), "ETH");
    const DAI = new ethers.Contract(DAI_ON_ETHEREUM, ERC20ABI.abi, provider);
    await DAI.connect(signer).transfer(await simpleFlashLoan.getAddress(),50000);  
    daiBalance=await token.balanceOf(signer.address);
    const nonce= await signer.getNonce();
    ///////////////////4 executing the loan    
    const transactionResponse = await simpleFlashLoan.connect(signer).createFlashLoan(DAI_ON_ETHEREUM, 100000,{nonce:nonce}); // Borrow 5 DAI in a Flash Loan with no upfront collateral
    await transactionResponse.wait();
    console.log(transactionResponse); 
    
  })

  it("should borrow some dai", async function () {
    
    expect(ethBalanceBeforeLoan).to.be.gt(0);
    
  });
});
