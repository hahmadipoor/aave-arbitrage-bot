
const tokens={

    MATIC: {
        symbol:"MATIC", 
        name: "MATIC", 
        decimals: 18, 
        address:"0xeeeeeeeeeeeeeeeeeeeeeeeeee", 
        logoURI:"https://tokens.1inch.io/0x7d1afa.png"
    }, 
    USDC: {
        symbol:"USDC", 
        name: "USD Coin", 
        decimals: 6, 
        address:"0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", 
        logoURI:"https://tokens.1inch.io/0x7d1afa.png"
    }, 
    USDT: {
        symbol:"USDT", 
        name: "Tether USD", 
        decimals: 6, 
        address:"0xc2132D05D31c914a87C6611C10748AEb04B58e8F", 
        logoURI:"https://tokens.1inch.io/0x7d1afa.png"
    },
    WETH: {
        symbol:"WETH", 
        name: "Wrapped Ether", 
        decimals: 18, 
        address:"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // token address polygon
        logoURI:"https://tokens.1inch.io/0x7d1afa.png"
    }, 
    DAI:{
        symbol:"DAI", 
        name: "DAI", 
        decimals: 18, 
        address:"0x6b175474e89094c44da98b954eedeac495271d0f", //token address on etherscan (Unblocked Ledger Token)
        //address:"0xf0059CC2b3E980065A906940fbce5f9Db7ae40A7", //token address on Polygon (Shardus (ULT))
        logoURI:"https://tokens.1inch.io/0x7d1afa.png"
    }
}

module.exports = { 
    tokens
}