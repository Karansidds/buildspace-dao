import React from "react";
import { ethers } from "ethers";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";

// Initialize SDK for Rinkeby
const sdk = new ThirdwebSDK("rinkeby");

const bundleDropModule = sdk.getBundleDropModule(
  "0x6B690EF977A7EccA1Fc1076475FBE746be80e53b"
);
const tokenModule = sdk.getTokenModule(
  "0x3199219F7D65A720760aa3D300F207D5C62ea51f"
);
const voteModule = sdk.getVoteModule(
  "0x27212E1F56AB31B3899576A8C10b3d0091785BC3"
);

const useOwnsNFT = (address) => {
  const [ownsNFT, setOwnsNFT] = React.useState(false);

  React.useEffect(() => {
    if (!address) return;

    (async () => {
      try {
        const balance = await bundleDropModule.balanceOf(address, "0");

        if (balance.gt(0)) {
          // Owns our NFT
          setOwnsNFT(true);
          console.log("Owns our NFT");
        } else {
          setOwnsNFT(false);
          console.log("Does not own our NFT");
        }
      } catch (err) {
        setOwnsNFT(false);
        console.log(err.message);
      }
    })();
  }, [address]);

  return [ownsNFT, setOwnsNFT];
};

const useMemberAddresses = (ownsNFT) => {
  const [memberAddresses, setMemberAddresses] = React.useState([]);

  React.useEffect(() => {
    if (!ownsNFT) return;

    (async () => {
      try {
        const addresses = await bundleDropModule.getAllClaimerAddresses("0");

        setMemberAddresses(addresses);
      } catch (err) {
        console.log("Hook: useMemberAddresses: ", err.message);
      }
    })();
  }, [ownsNFT]);

  return memberAddresses;
};

const useMemberTotalTokens = (ownsNFT) => {
  const [memberTotalTokens, setMemberTotalTokens] = React.useState({});

  React.useEffect(() => {
    if (!ownsNFT) return;

    (async () => {
      try {
        const amounts = await tokenModule.getAllHolderBalances();

        setMemberTotalTokens(amounts);
      } catch (err) {
        console.log("Hook: useMemberTotalTokens: ", err.message);
      }
    })();
  }, [ownsNFT]);

  return memberTotalTokens;
};

const useProposals = (ownsNFT) => {
  const [proposals, setProposals] = React.useState([]);

  React.useEffect(() => {
    if (!ownsNFT) return;

    (async () => {
      try {
        const proposals = await voteModule.getAll();

        setProposals(proposals);
      } catch (err) {
        console.log("Error while retreiving proposals.");
      }
    })();
  }, [ownsNFT]);

  return proposals;
};

const beautifyAddress = (address) =>
  address.substring(0, 6) + "..." + address.substring(address.length - 4);

const App = () => {
  const { address, connectWallet, provider } = useWeb3();

  const [ownsNFT, setOwnsNFT] = useOwnsNFT(address);
  const [isOwningNFT, setIsOwningNFT] = React.useState(false);

  const memberTotalTokens = useMemberTotalTokens(ownsNFT);
  const memberAddresses = useMemberAddresses(ownsNFT);

  // Proposal State
  const proposals = useProposals(ownsNFT);
  const [isVoting, setIsVoting] = React.useState(false);
  const [hasVoted, setHasVoted] = React.useState(false);
  console.log(proposals, hasVoted, ownsNFT);
  const memberList = React.useMemo(() => {
    return memberAddresses.map((address) => ({
      address,
      tokenAmount: ethers.utils.formatUnits(
        memberTotalTokens[address] || 0,
        18
      ),
    }));
  }, [memberTotalTokens, memberAddresses]);

  // A signer is an Ethereum account that will be used by our app to send requests
  // to the smart contract on behalf of the signer. A signer could be a wallet.
  const signer = provider?.getSigner();

  React.useEffect(() => {
    if (!signer) return;

    // This allows Third Web to make requests on behalf of the signer.
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  React.useEffect(() => {
    if (!ownsNFT || proposals.length == 0) return;

    // Check if the user has voted
    (async () => {
      try {
        const voted = await voteModule.hasVoted(
          proposals[0].proposalId,
          address
        );

        setHasVoted(voted);
      } catch (err) {
        console.log("Error while checking if user has voted");
      }
    })();
  }, [address, ownsNFT, proposals]);

  const handleConnectWallet = () => {
    connectWallet("injected");
  };

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to NarutoDAO</h1>

        {!address && (
          <button onClick={handleConnectWallet} className="btn-hero">
            Connect your wallet
          </button>
        )}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    //before we do async things, we want to disable the button to prevent double clicks
    setIsVoting(true);

    // lets get the votes from the form for the values
    const votes = proposals.map((proposal) => {
      let voteResult = {
        proposalId: proposal.proposalId,
        vote: 2, // Type 2 -> Abstain
      };

      proposal.votes.forEach((vote) => {
        const elem = document.getElementById(
          proposal.proposalId + "-" + vote.type
        );

        if (elem.checked) {
          voteResult.vote = vote.type;
          return;
        }
      });
      return voteResult;
    });

    // first we need to make sure the user delegates their token to vote
    try {
      //we'll check if the wallet still needs to delegate their tokens before they can vote
      const delegation = await tokenModule.getDelegationOf(address);
      // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
      if (delegation === ethers.constants.AddressZero) {
        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
        await tokenModule.delegateTo(address);
      }
      // then we need to vote on the proposals
      try {
        await Promise.all(
          votes.map(async (vote) => {
            // before voting we first need to check whether the proposal is open for voting
            // we first need to get the latest state of the proposal
            const proposal = await voteModule.get(vote.proposalId);
            // then we check if the proposal is open for voting (state === 1 means it is open)
            if (proposal.state === 1) {
              // if it is open for voting, we'll vote on it
              return voteModule.vote(vote.proposalId, vote.vote);
            }
            // if the proposal is not open for voting we just return nothing, letting us continue
            return;
          })
        );
        try {
          // if any of the propsals are ready to be executed we'll need to execute them
          // a proposal is ready to be executed if it is in state 4
          await Promise.all(
            votes.map(async (vote) => {
              // we'll first get the latest state of the proposal again, since we may have just voted before
              const proposal = await voteModule.get(vote.proposalId);

              //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
              if (proposal.state === 4) {
                return voteModule.execute(vote.proposalId);
              }
            })
          );
          // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
          setHasVoted(true);
          // and log out a success message
          console.log("successfully voted");
        } catch (err) {
          console.error("failed to execute votes", err);
        }
      } catch (err) {
        console.error("failed to vote", err);
      }
    } catch (err) {
      console.error("failed to delegate tokens");
    } finally {
      // in *either* case we need to set the isVoting state to false to enable the button again
      setIsVoting(false);
    }
  };

  // Dashboard
  if (ownsNFT) {
    return (
      <div className="member-page">
        <h1>🍪DAO Member Page</h1>
        <p>Congratulations on being a member</p>

        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{beautifyAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2>Active Proposals</h2>
            <form onSubmit={handleSubmit}>
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                  ? "You Already Voted"
                  : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const mintNFT = async () => {
    try {
      setIsOwningNFT(true);

      await bundleDropModule.claim("0", 1);

      setOwnsNFT(true);
      console.log("NFT minted successfully");
    } catch (err) {
      console.log(err.message);
      setIsOwningNFT(false);
    } finally {
      setIsOwningNFT(false);
    }
  };

  return (
    <div className="mint-nft">
      <h1>Mint your free Naruto DAO Membership NFT</h1>

      <button disabled={isOwningNFT} onClick={mintNFT}>
        {isOwningNFT ? "Minting..." : "Mint your NFT (FREE)"}
      </button>
    </div>
  );
};

export default App;
