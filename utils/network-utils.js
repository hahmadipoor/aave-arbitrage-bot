const { ethers } = require("hardhat");

const getProvider=(networkName)=>{
    const rpc_url=networkName=="localhost" || networkName=="ethereum_localhost_fork"
                ? "http://localhost:8545"
                : networkName=="ethereum_phalcon_fork"
                ?"https://rpc.phalcon.blocksec.com/rpc_83e040e2ba0f4958b435211bdec635fc"
                :networkName=="ethereum_mainnet"
                ?"https://eth-mainnet.g.alchemy.com/v2/Il6tIPrNp_6mCsRAKIjNRVSpSc1w7cDM"
                :"";
    const provider = new ethers.JsonRpcProvider(rpc_url);
    return provider;
}

const getSigner=(networkName)=>{
    
    const provider=getProvider(networkName);
    let privateKey = networkName=="localhost"?"":process.env.PRIVATE_KEY;
    //let wallet = privateKey? new ethers.Wallet(privateKey):"";
    let wallet = privateKey? new ethers.Wallet(privateKey, provider):"";
    signer = networkName=="localhost"? (ethers.getSigners())[0]: wallet;
    return signer
}

module.exports={
    getProvider,
    getSigner
}