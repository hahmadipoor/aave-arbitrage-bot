
const protocols={
    UNISWAP_V3:0, 
    UNISWAP_V2:1, 
    SUSHISWAP: 2, 
    QUICKSWAP:3, 
    JETSWAP:4, 
    POLYCAT:5, 
    APESWAP: 6, 
    WAULTSWAP:7, 
    DODO: 9
};

const routers={
    UNISWAP_V2:"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", //Uniswap V2 router on Polygon network
    SUSHISWAP:"0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",//Sushiswap v2 router on polygon 
}

module.exports={
    protocols, 
    routers
}