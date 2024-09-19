// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IFlashloan {

    struct Hop { 
        uint8 protocol; // A unique identifier for the swap protocol. for example Uniswap protocol is number 0, Sushiswap is number 1, and so on
        bytes data; // Arbitrary bytes data that may include address of the router of the protocol and some additional parameters such as fee of the protocol
        address[] path; // [WETH, USDC, SUSHI] 
        uint256 amountOutMinV3;
        uint160 sqrtPriceLimitX96;
    }

    struct Route {
        Hop[] hops; // Each route consists of one or more hops
        uint16 part; // Represents the proportion of the total loan amount allocated to this route
    }

    struct FlashParams {
        uint256 loanAmount;
        Route[] routes;
    }

}