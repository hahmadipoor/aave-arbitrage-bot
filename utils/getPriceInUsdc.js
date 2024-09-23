const uniV2FactoryAbi=require("../abis/uniV2FactoryAbi.json"); 
const uniV2RouterAbi = require("../abis/uniV2RouterAbi.json");
const uniV2PairAbi=require("../abis/uniV2PairAbi.json");
const {tokens}=require("../constants/token-addresses");
const { ethers } = require("hardhat");


const getPriceInUSDC= async (params)=>{

    const factory= new ethers.Contract(params.factory, uniV2FactoryAbi, params.provider);
    const router = new ethers.Contract(params.router, uniV2RouterAbi, params.provider);
    const pairAddress=await factory.getPair(params.tokenAddress, tokens.USDC.address);
    const pair=new ethers.Contract(pairAddress, uniV2PairAbi, params.provider);
    const reserves=await pair.getReserves();
    const quote=await router.quote(ethers.parseEther("1"), reserves[1], reserves[0]);
    console.log(`Price of ${params.tokenAddress} = $${ethers.formatUnits(quote,6)} for protocol id ${params.id}`);
    return {
        quote, 
        protocol:params.id,
        reserves
    }
}

module.exports={
    getPriceInUSDC
}