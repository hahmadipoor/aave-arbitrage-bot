const {routers, factories} =require("../constants/protocols");
const {tokens} = require("../constants/token-addresses");
const {protocols}=require("../constants/protocols");
const {getPriceInUSDC}= require("../utils/getPriceInUsdc");
const {getProvider, getSigner}=require("../utils/network-utils");
const { ethers } = require("hardhat");
const hre=require("hardhat");
const {findRouterByProtocol}=require("../utils/findRouterByProtocol");
const {executeFlashloan}= require("./executeFlashLoan");
const simpleFlashLoanJson=require("../artifacts/contracts/SimpleFlashLoan.sol/SimpleFlashLoan.json");
const {deploy}=require("../scripts/deployFlashLoan");

require("dotenv").config();

const MIN_PRICE_DIFF=5000000;// this equals $5, because USDC has 6 decimals we've put 6 zeros 
const provider=getProvider(hre.network.name);

const findArbitrageDaiWeth= async()=>{

        const uniQuote=await getPriceInUSDC({
            router: routers.UNISWAP_V2,
            factory: factories.UNISWAP_V2,
            tokenAddress: tokens.WETH.address,
            id:protocols.UNISWAP_V2,
            provider
        });
        const sushiQuote=await getPriceInUSDC({
            router: routers.SUSHISWAP,
            factory: factories.SUSHISWAP,
            tokenAddress: tokens.WETH.address,
            id:protocols.SUSHISWAP,
            provider
        });
        const apeQuote=await getPriceInUSDC({
            router: routers.APESWAP,
            factory: factories.APESWAP,
            tokenAddress: tokens.WETH.address,
            id:protocols.APESWAP,
            provider
        });
        const quotes=[uniQuote,sushiQuote,apeQuote];
        const min=quotes.reduce((min, obj)=>(obj.quote<min.quote?obj:min));
        const max=quotes.reduce((max, obj)=>(obj.quote>max.quote?obj:max));
        const biggestPriceDiff=max.quote-min.quote;
        console.log("Biggest price difference $", ethers.formatUnits(biggestPriceDiff, 6));
        console.log(`Total liquidity in SushiSwap pool is $${ethers.formatUnits(uniQuote.reserves[0],6)}`);
        console.log(`Total liquidity in QuickSwap pool is $${ethers.formatUnits(sushiQuote.reserves[0],6)}`);
        console.log(`Total liquidity in ApeSwap pool is $${ethers.formatUnits(apeQuote.reserves[0],6)}`);
        return {min, max, biggestPriceDiff}
}

const executeArgitrage= async()=>{
        try{
            const {min, max, biggestPriceDiff}=await findArbitrageDaiWeth();
            if(biggestPriceDiff>=MIN_PRICE_DIFF || true){
                const params={
                    loanAmount: ethers.parseEther(".000003"),// we borrowed 3000,000,000,000 wei 
                    hops:[
                        {
                            protocol: max.protocol, 
                            data: ethers.AbiCoder.defaultAbiCoder().encode(
                                ["address"], 
                                [findRouterByProtocol(max.protocol)]
                            ), 
                            path: [tokens.WETH.address, tokens.USDC.address], 
                            amountOutMinV3: 10,
                            sqrtPriceLimitX96: 100
                        }, 
                        {
                            protocol: min.protocol, 
                            data: ethers.AbiCoder.defaultAbiCoder().encode(
                                ["address"], 
                                [findRouterByProtocol(min.protocol)]
                            ), 
                            path: [tokens.USDC.address, tokens.WETH.address], 
                            amountOutMinV3: 10,
                            sqrtPriceLimitX96: 100                
                        }
                    ], 
                } 
                const signer=getSigner(hre.network.name);
                const nonce=await signer.getNonce();
                const transactionReceipt=await deploy();
                simpleFlashLoanAddress=transactionReceipt.contractAddress;
                const simpleFlashLoan= new ethers.Contract(simpleFlashLoanAddress, simpleFlashLoanJson.abi, provider);
                const tx=await executeFlashloan(params, simpleFlashLoan, signer , nonce);
            }
        }catch(error){
            console.log(error);
        }
}

executeArgitrage().catch((error)=>{
    console.error(error);
    process.exitCode=1;
})

