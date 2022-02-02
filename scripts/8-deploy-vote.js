import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule(
  "0x2f8c3705E7275F45184C2e0a9fB2cdBF47A9aDE4"
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      name: "Hokage Voting Session",
      // Address of the governance token
      votingTokenAddress: "0x3199219F7D65A720760aa3D300F207D5C62ea51f",
      // After a proposal is created, we define the wait time here.
      // A user has wait to vote until this time is over.
      proposalStartWaitTimeInSeconds: 0,
      // How much time does a user have to vote? For now, it's 1 day.
      proposalVotingTimeInSeconds: 24 * 60 * 60,
      votingQuorumFraction: 0,
      // Everyone can vote for now.
      minimumNumberOfTokensNeededToPropose: "0",
    });

    console.log("Vote Module deployed to: ", voteModule.address);
  } catch (err) {
    console.log("Some error: ", err.message);
  }
})();
