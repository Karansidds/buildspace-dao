import ethers from "ethers";
import { readFileSync } from "fs";
import sdk from "./1-initialize-sdk.js";

// Get access to our Naruto DAO app
const app = sdk.getAppModule("0x2f8c3705E7275F45184C2e0a9fB2cdBF47A9aDE4");

{
  (async () => {
    try {
      const collection = await app.deployBundleDropModule({
        name: "NarutoDAO Membership",
        description: "A collection of NFTs for Naruto DAO",
        image: readFileSync("scripts/assets/naruto.png"),
        // This is the address of the receiver after the sales of an NFT.
        primarySaleRecipientAddress: ethers.constants.AddressZero,
      });

      console.log(
        "✅ Successfully deployed bundleDrop module, address:",
        collection.address
      );
      console.log("✅ bundleDrop metadata:", await collection.getMetadata());
    } catch (err) {
      console.log(err.message);
    }
  })();
}
