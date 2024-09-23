const {routers} =require("../constants/protocols");

const findRouterByProtocol=(protocol)=>{
    return routers[Object.keys(routers)[protocol]];
}

module.exports={
    findRouterByProtocol
}