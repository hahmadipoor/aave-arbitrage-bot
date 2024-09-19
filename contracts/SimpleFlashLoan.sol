// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SignedMath.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "./interfaces/IFlashloan.sol";
import "./libraries/RouteUtils.sol";
import "./base/FlashloanValidation.sol";
import "./libraries/Part.sol";
import "./base/Withdraw.sol";
import "./uniswap/v3/ISwapRouter.sol";
import "./uniswap/IUniswapV2Router.sol";

import "@openzeppelin/contracts/utils/math/SignedMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract SimpleFlashLoan is FlashLoanSimpleReceiverBase,FlashloanValidation, IFlashloan,Withdraw {

  using SignedMath for uint256;
  event Log(address asset, uint val); 
  event SentProfit(address recipient, uint256 profit);
  event SwapFinished(address token, uint256 amount);
  uint256 public slippage=1;

  constructor(IPoolAddressesProvider provider) FlashLoanSimpleReceiverBase(provider) {

  }

  function createFlashLoan(FlashParams memory params) external {

    bytes memory data = abi.encode(
            FlashParams({
                loanAmount: params.loanAmount,
                routes: params.routes
            })
        );
        address loanToken = RouteUtils.getInitialToken(params.routes[0]);
        POOL.flashLoanSimple(
            address(this), //receiver
            loanToken, //the asset we want to borrow
            params.loanAmount,
            data,
            0 //referralCode
        );
  }

  function executeOperation(
    address asset,
    uint256 amount,
    uint256 premium,
    address initiator,
    bytes calldata params
  ) external returns (bool){
   
    console.log("--------------callback is called--------------------");

    // abi.decode(params) to decode params
    FlashParams memory decoded = abi.decode( params, (FlashParams));
    address loanToken = RouteUtils.getInitialToken(decoded.routes[0]);
    console.log(IERC20(loanToken).balanceOf(address(this)), "LOAN_TOKEN CONTRACT BALANCE BEFORE SWAP");
    require( IERC20(loanToken).balanceOf(address(this)) >= decoded.loanAmount,"Failed to borrow loan token");    
    // run arbitrage or liquidations here
    routeLoop(decoded.routes, decoded.loanAmount);
    console.log("LOAN_TOKEN CONTRACT BALANCE AFTER BORROW AND SWAP", IERC20(loanToken).balanceOf(address(this)));
    emit SwapFinished(loanToken,IERC20(loanToken).balanceOf(address(this)));
    require( IERC20(loanToken).balanceOf(address(this)) >= decoded.loanAmount,"Not enough amount to return loan");
    uint256 amountOwing = amount+premium;
    IERC20(asset).approve(address(POOL), amountOwing);
    uint256 remained = IERC20(loanToken).balanceOf(address(this));
    IERC20(loanToken).transfer(owner(), remained);
    emit SentProfit(owner(), remained);
    console.log("++++++++++++End of callback+++++++++++++++++++++++++");
    ///////////   
    return true;
  }

  function routeLoop(Route[] memory routes, uint256 totalAmount) internal checkTotalRoutePart(routes) {
        console.log("inside routeLoop");
        for (uint256 i = 0; i < routes.length; i++) {
            uint256 amountIn = Part.partToAmountIn(routes[i].part, totalAmount);
            console.log(totalAmount, "LOAN TOKEN AMOUNT to SWAP");
            hopLoop(routes[i], amountIn);
        }
    }

  function hopLoop(Route memory route, uint256 totalAmount) internal {
        uint256 amountIn = totalAmount;
        for (uint256 i = 0; i < route.hops.length; i++) {
            amountIn = pickProtocol(route.hops[i], amountIn);
        }
  }

  function pickProtocol( Hop memory hop, uint256 amountIn) internal checkRouteProtocol(hop) returns (uint256 amountOut) {
        if (hop.protocol == 0) {
            amountOut = uniswapV3(hop.data, amountIn, hop.path, hop.amountOutMinV3, hop.sqrtPriceLimitX96);
        } else if (hop.protocol < 8) {
            amountOut = uniswapV2(hop.data, amountIn, hop.path);
        } else {
            //amountOut = dodoV2Swap(hop.data, amountIn, hop.path);
        }
  }

  function uniswapV3(
        bytes memory data,
        uint256 amountIn,
        address[] memory path,
        uint256 amountOutMinV3,
        uint160 sqrtPriceLimitX96
    ) internal returns (uint256 amountOut) {
        (address router, uint24 fee) = abi.decode(data, (address, uint24));
        ISwapRouter swapRouter = ISwapRouter(router);
        approveToken(path[0], address(swapRouter), amountIn);

        // single swaps
        amountOut = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: path[0],
                tokenOut: path[1],
                fee: fee,
                recipient: address(this),
                deadline: block.timestamp +60,
                amountIn: amountIn,
                amountOutMinimum: amountOutMinV3,
                sqrtPriceLimitX96: sqrtPriceLimitX96
            })
        );
    }

    function uniswapV2(
        bytes memory data,
        uint256 amountIn,
        address[] memory path
    ) internal returns (uint256 amountOut) {
        address router = abi.decode(data, (address));
        approveToken(path[0], router, amountIn);
        uint[] memory amountOutMin=IUniswapV2Router(router).getAmountsOut(amountIn, path);
        uint256 minReturnAmount=amountOutMin[1] * slippage /100;
        amountOut=IUniswapV2Router(router).swapExactTokensForTokens(
                amountIn,
                minReturnAmount,
                path,
                address(this),
                block.timestamp +60
            )[1];
    }

    function approveToken(
        address token,
        address to,
        uint256 amountIn
    ) internal {
        require(IERC20(token).approve(to, amountIn), "approve failed.");
    }

    function setSlippage(uint256 _slippage) external onlyOwner(){

        slippage = _slippage;
    }
}