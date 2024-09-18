// this transfer DAI to your account

const DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
// Random user's address that happens to have a lot of DAI on Polygon Mainnet
const DAI_WHALE = "0x25E53Fe97360906cb990417cf0292a25DcF06075";

const token = await ethers.getContractAt("IERC20", DAI);
const BALANCE_AMOUNT_DAI = ethers.utils.parseEther("2000");


await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });
const signer = await ethers.getSigner(DAI_WHALE);

await token.connect(signer).transfer("ENTER ADDRESS HERE", BALANCE_AMOUNT_DAI);