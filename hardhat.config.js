require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {//npx hardhat node
        url: "http://localhost:8545",
    },
    ethereum_localhost_fork: {// npx hardhat node --fork <mainnet-rpc-url>
      url: "http://localhost:8545",
    },
    ethereum_phalcon_fork:{
        url:"https://rpc.phalcon.blocksec.com/rpc_83e040e2ba0f4958b435211bdec635fc",
    },
    ethereum_mainnet:{
      url:"https://eth-mainnet.g.alchemy.com/v2/Il6tIPrNp_6mCsRAKIjNRVSpSc1w7cDM",
    },
    polygon_mainnet:{
      url:"https://polygon-mainnet.g.alchemy.com/v2/J-bsMqvRwHY2WvUUoGi6Zm_4ctQqP3v4"
    },
    binance_mainnet:{
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
    }   
  },
};
