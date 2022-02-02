import { ThirdwebSDK } from "@3rdweb/sdk";
import ethers from "ethers";

if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY == "") {
  console.log("🛑 Private key not found.");
}

if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL == "") {
  console.log("🛑 Alchemy API URL not found.");
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS == "") {
  console.log("🛑 Wallet Address not found.");
}

// Initialize Thirdweb SDK
const sdk = new ThirdwebSDK(
  new ethers.Wallet(
    process.env.PRIVATE_KEY,
    ethers.getDefaultProvider(process.env.ALCHEMY_API_URL)
  )
);

{
  (async () => {
    try {
      const apps = await sdk.getApps();

      console.log("App address: ", apps[0].address);
    } catch (err) {
      console.log("There was some error getting the apps");
      process.exit(0);
    }
  })();
}

export default sdk;
