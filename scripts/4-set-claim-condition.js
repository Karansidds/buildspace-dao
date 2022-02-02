import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0x6B690EF977A7EccA1Fc1076475FBE746be80e53b"
);

{
  (async () => {
    try {
      const claimConditionFactory = bundleDrop.getClaimConditionFactory();

      claimConditionFactory.newClaimPhase({
        startTime: new Date(),
        maxQuantity: 50,
        maxQuantityPerTransaction: 1,
      });

      await bundleDrop.setClaimCondition(0, claimConditionFactory);

      console.log(
        "✅ Successfully set claim condition on bundle drop:",
        bundleDrop.address
      );
    } catch (err) {
      console.log(
        "There was some error while settings the claims: ",
        err.message
      );
    }
  })();
}
