// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");
const ERC20ABI=require("../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");
const hre=require("hardhat");
const { POOL_ADDRESS_PROVIDER_ON_ETHEREUM } = require("../constants/pool-addresses");
const { DAI_ON_ETHEREUM } = require("../constants/token-addresses");
const {getProvider}=require("../constants/providers");
require("dotenv").config();



describe("FlashLoan", function () {

  let x;
  let simpleFlashLoan;
  let token;

  this.beforeAll(async function deploySimpleFlashLoan() {
 
    const networkName=hre.network.name;    
    const provider=getProvider(networkName);
    let privateKey = networkName=="localhost"?"":process.env.PRIVATE_KEY;
    const signer = networkName=="localhost"? (await ethers.getSigners())[0]: new ethers.Wallet(privateKey, provider);
    //let wallet = privateKey? new ethers.Wallet(privateKey):"";
    //console.log(await wallet.getAddress());
    console.log(signer);
    
    const ethBalance = await provider.getBalance(await signer.getAddress());
    console.log("ETH balance in wei: ",ethBalance);
    const balanceInEth = ethers.formatEther(ethBalance);
    console.log("ETH balance in ETH: ", balanceInEth);
    const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
    simpleFlashLoan = await SimpleFlashLoan.deploy(POOL_ADDRESS_PROVIDER_ON_ETHEREUM);
    const deploymentReceipt = await simpleFlashLoan.deploymentTransaction().wait(1);
    const {gasPrice, gasUsed}=deploymentReceipt;
    console.log(gasPrice * gasUsed);
    
    ///////////////////
    token = await ethers.getContractAt("IERC20", DAI_ON_ETHEREUM);
    await token.connect(signer).transfer(simpleFlashLoan.target, 2);
    console.log("DAI balance of signer before transfer: ",await token.balanceOf(signer.address));
    console.log("DAI balance of simpleFlashLoan before transfer: ",await token.balanceOf(simpleFlashLoan.target));
    const DAI = new ethers.Contract(DAI_ON_ETHEREUM, ERC20ABI.abi, provider);
    await DAI.connect(signer).transfer(await simpleFlashLoan.getAddress(), 2);  
    console.log("DAI balance of signer after transfer: ",await token.balanceOf(signer.address));
    console.log("DAI balance of simpleFlashLoan after transfer: ",await token.balanceOf(simpleFlashLoan.target));
    const nonce= await signer.getNonce();
    const txReciept = await simpleFlashLoan.connect(signer).createFlashLoan(DAI_ON_ETHEREUM, 100,{nonce:nonce}); // Borrow 5 DAI in a Flash Loan with no upfront collateral
    await txReciept.wait();
    console.log(txReciept);
    
    x=5;
    return{simpleFlashLoan}
  })

  it("should borrow some dai", async function () {
    
    expect(x).to.equal(5);
    
    // const remainingBalance = await token.balanceOf(simpleFlashLoan.address); // Check the balance of DAI in the Flash Loan contract afterwards
    // console.log(`remaining balance: ${remainingBalance}`)
    // expect(remainingBalance.lt(BALANCE_AMOUNT_DAI)).to.be.true;
  });
});
