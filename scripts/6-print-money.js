import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
  "0x3199219F7D65A720760aa3D300F207D5C62ea51f"
);

(async () => {
  try {
    // Max supply of governance tokens
    const amount = 1_000_000;
    // Parse the max supply to have 18 decimals as it is the standard for ERC20 contract
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    console.log(amountWith18Decimals);
    // Interact with our ERC20 contract and mint tokens
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    // Print out how many of our token's are out there now!
    console.log(
      "✅ There now is ",
      ethers.utils.formatUnits(totalSupply, 18),
      " $PROPHECY in circulation"
    );
  } catch (err) {
    console.log("Error while minting our governance tokens: ", err.message);
  }
})();
