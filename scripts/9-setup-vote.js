import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

const voteModule = sdk.getVoteModule(
  "0x27212E1F56AB31B3899576A8C10b3d0091785BC3"
);

const tokenModule = sdk.getTokenModule(
  "0x3199219F7D65A720760aa3D300F207D5C62ea51f"
);

(async () => {
  try {
    // Giving our treasury the power to mint if needed.
    await tokenModule.grantRole("minter", voteModule.address);

    console.log("Minting rights granted");
  } catch (err) {
    console.log("Error while giving minting rights: ", err.message);

    process.exit(0);
  }

  try {
    // Access the token balance of my wallet
    const tokenBalance = await tokenModule.balanceOf(
      process.env.WALLET_ADDRESS
    );
    // Take 90% of that value
    const tokenAmount = ethers.BigNumber.from(tokenBalance.value);
    const percent90 = tokenAmount.div(100).mul(90);
    // Transfer the 90% to the contract
    await tokenModule.transfer(voteModule.address, percent90);

    console.log("Token transferred to treasury!");
  } catch (err) {
    console.log("Error while transferring: ", err.message);
  }
})();
