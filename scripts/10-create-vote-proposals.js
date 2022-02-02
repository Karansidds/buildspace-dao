import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

const voteModule = sdk.getVoteModule(
  "0x27212E1F56AB31B3899576A8C10b3d0091785BC3"
);
const tokenModule = sdk.getTokenModule(
  "0x3199219F7D65A720760aa3D300F207D5C62ea51f"
);

// voteModule.propose(name, meta)
(async () => {
  // First Proposal
  try {
    const amount = 420_000;
    const name =
      "Should the DAO mint an additional " +
      amount +
      " token into the treasury?";
    const meta = [
      {
        nativeTokenValue: 0, // Eth
        transactionData: tokenModule.contract.interface.encodeFunctionData(
          "mint",
          [voteModule.address, ethers.utils.parseUnits(amount.toString(), 18)]
        ),
        toAddress: tokenModule.address,
      },
    ];

    await voteModule.propose(name, meta);
    console.log("Proposal to mint tokens created successfully!");
  } catch (err) {
    console.log("First Proposal: ", err.message);
    process.exit(0);
  }

  // Second Proposal
  try {
    const amount = 6_900;
    const name =
      "Should the DAO transfer " +
      amount +
      " tokens from the treasury to " +
      process.env.WALLET_ADDRESS +
      " for being awesome?";

    const meta = [
      {
        nativeTokenValue: 0, // Eth
        transactionData: tokenModule.contract.interface.encodeFunctionData(
          "transfer",
          [
            process.env.WALLET_ADDRESS,
            ethers.utils.parseUnits(amount.toString(), 18),
          ]
        ),
        toAddress: tokenModule.address,
      },
    ];

    await voteModule.propose(name, meta);
    console.log("Proposal to transfer tokens created successfully!");
  } catch (err) {
    console.log("Second Proposal: ", err.message);
  }
})();
