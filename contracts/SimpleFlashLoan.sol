// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SignedMath.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "hardhat/console.sol";

contract SimpleFlashLoan is FlashLoanSimpleReceiverBase {
  using SignedMath for uint256;
  event Log(address asset, uint val);

  constructor(IPoolAddressesProvider provider) FlashLoanSimpleReceiverBase(provider) {

  }

  function createFlashLoan(address asset, uint amount) external {
    address receiver = address(this);
    bytes memory params = "";
    uint16 referralCode = 0;

    emit Log(asset, IERC20(asset).balanceOf(address(this)));

    POOL.flashLoanSimple(
      receiver,
      asset,
      amount,
      params,
      referralCode
    );

  }

  function executeOperation(
    address asset,
    uint256 amount,
    uint256 premium,
    address initiator,
    bytes calldata params
  ) external returns (bool){
    
    // run arbitrage or liquidations here
    // abi.decode(params) to decode params

    console.log("amount transfered to this contract:", amount);
    console.log("premium: ",premium);
    uint256 daiBalanceAfterBorrow=IERC20(asset).balanceOf(address(this));
    console.log("Dai Balance after borrow:", daiBalanceAfterBorrow);
    
    emit Log(asset, IERC20(asset).balanceOf(address(this)));
    uint256 amountOwing = amount+premium;
    IERC20(asset).approve(address(POOL), amountOwing);

    return true;
  }
}