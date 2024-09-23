
const protocols={
    UNISWAP_V3:0, 
    UNISWAP_V2:1, 
    SUSHISWAP:2, 
    APESWAP: 3, 
};

const routers={
    UNISWAP_V3: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    UNISWAP_V2:"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", //Uniswap V2 router on
    SUSHISWAP:"0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",//Sushiswap v2 router
    APESWAP:"0x5f509a3C3F16dF2Fba7bF84dEE1eFbce6BB85587" 
}

const factories={
    UNISWAP_V3: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    UNISWAP_V2:"0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", //Uniswap V2 router
    SUSHISWAP:"0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",//Sushiswap v2 router 
    APESWAP:"0xBAe5dc9B19004883d0377419FeF3c2C8832d7d7B"
}

module.exports={
    protocols, 
    routers, 
    factories
}