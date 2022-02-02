import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x6B690EF977A7EccA1Fc1076475FBE746be80e53b"
);

{
  (async () => {
    try {
      await bundleDrop.createBatch([
        {
          name: "Konohagakure Head Band",
          description: "This NFT will give you access to Naruto DAO.",
          image: readFileSync("scripts/assets/headband.png"),
        },
      ]);

      console.log("NFT deployed succesfully");
    } catch (err) {
      console.log(
        "There was some error while deploying the NFT: ",
        err.message
      );
    }
  })();
}
