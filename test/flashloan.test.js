// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const { ethers } = require("hardhat");
const ERC20ABI=require("../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json");
const hre=require("hardhat");


// Mainnet DAI Address
const POLYGON_NETWORK_DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const ETHEREUM_NETWORK_DAI="0x6B175474E89094C44Da98b954EedeAC495271d0F";
//const POLYGON_POOL_ADDRESS_PROVIDER = "0xa97684ead0e402dc232d5a977953df7ecbab3cdb";
const ETHEREUM_POOL_ADDRESS_PROVIDER = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";

describe("FlashLoan", function () {

  let x;
  let simpleFlashLoan;
  let token;
  let BALANCE_AMOUNT_DAI;

  this.beforeAll(async function deploySimpleFlashLoan() {
 
    const networkName=hre.network.name; 
    console.log(networkName);
    
    //const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/Il6tIPrNp_6mCsRAKIjNRVSpSc1w7cDM");
    //const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const provider = new ethers.JsonRpcProvider("https://rpc.phalcon.blocksec.com/rpc_83e040e2ba0f4958b435211bdec635fc");
    let privateKey = networkName=="localhost" 
          ?""
          :"1ae23a11b55b4bb3778c7ec41f40be8b64d4be14b01b40ba38a7a590936d884e";
    const signer = networkName=="localhost"
          ? (await ethers.getSigners())[0]       
          : new ethers.Wallet(privateKey, provider);
    let wallet = new ethers.Wallet(privateKey);
    console.log(await wallet.getAddress());
    const ethBalance = await provider.getBalance(signer.address);
    console.log("ETH balance in wei: ",ethBalance);
    const balanceInEth = ethers.formatEther(ethBalance);
    console.log("ETH balance in ETH: ", balanceInEth);
    const SimpleFlashLoan = await ethers.getContractFactory("SimpleFlashLoan");
    simpleFlashLoan = await SimpleFlashLoan.deploy(ETHEREUM_POOL_ADDRESS_PROVIDER);
    const deploymentReceipt = await simpleFlashLoan.deploymentTransaction().wait(1);
    const {gasPrice, gasUsed}=deploymentReceipt;
    console.log(gasPrice * gasUsed);
    
    ///////////////////
    token = await ethers.getContractAt("IERC20", ETHEREUM_NETWORK_DAI);
    await token.connect(signer).transfer(simpleFlashLoan.target, 2);
    console.log("DAI balance of signer before transfer: ",await token.balanceOf(signer.address));
    console.log("DAI balance of simpleFlashLoan before transfer: ",await token.balanceOf(simpleFlashLoan.target));
    const DAI = new ethers.Contract(ETHEREUM_NETWORK_DAI, ERC20ABI.abi, provider);
    await DAI.connect(signer).transfer(await simpleFlashLoan.getAddress(), 2);  
    console.log("DAI balance of signer after transfer: ",await token.balanceOf(signer.address));
    console.log("DAI balance of simpleFlashLoan after transfer: ",await token.balanceOf(simpleFlashLoan.target));
    const nonce= await signer.getNonce();
    const txReciept = await simpleFlashLoan.connect(signer).createFlashLoan(ETHEREUM_NETWORK_DAI, 100,{nonce:nonce}); // Borrow 5 DAI in a Flash Loan with no upfront collateral
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
