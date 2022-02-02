import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule("0x2f8c3705E7275F45184C2e0a9fB2cdBF47A9aDE4");

(async () => {
  try {
    // Deploy ERC-20 contract
    const tokenModule = await app.deployTokenModule({
      name: "Naruto DAO governance token",
      symbol: "PROPHECY",
    });

    console.log(
      "Successfully deployed governance token: ",
      tokenModule.address
    );
  } catch (err) {
    console.log("Error while deploying governance token", err.message);
  }
})();
