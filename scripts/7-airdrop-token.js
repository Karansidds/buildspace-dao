import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// In this module we are going to airdrop random amount of token to our members.

const bundleDropModule = sdk.getBundleDropModule(
  "0x6B690EF977A7EccA1Fc1076475FBE746be80e53b"
);
const tokenModule = sdk.getTokenModule(
  "0x3199219F7D65A720760aa3D300F207D5C62ea51f"
);

(async () => {
  try {
    // Grab all the addresses that hold our membership NFT
    const walletAddresses = await bundleDropModule.getAllClaimerAddresses("0");

    if (walletAddresses.length == 0) {
      console.log("It's just you in the DAO. Get some members quickly.");

      process.exit(0);
    }

    const airdropTargets = walletAddresses.map((address) => {
      const randomAmount = Math.floor(
        Math.random() * (10000 - 1000 + 1) + 1000
      );
      console.log("✅ Going to airdrop", randomAmount, "tokens to", address);

      const airdropTarget = {
        address,
        amount: ethers.utils.parseUnits(randomAmount.toString(), 18),
      };

      return airdropTarget;
    });

    console.log("Starting Aidrop");
    await tokenModule.transferBatch(airdropTargets);
    console.log("Airdrop complete");
  } catch (err) {
    console.log("Some error: ", err.message);
  }
})();
