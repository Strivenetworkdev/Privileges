const Claim = require("../Models/claimModel");
const Privilege = require("../models/privilegeModel");

exports.transferPrivilege = async (req, res) => {
  const transfer_time = new Date();
  const {
    sender_wallet_address,
    receiver_wallet_address,
    nft_collection_address,
    token_id,
    utility_id,
    utility_name,
  } = req.body;

  try {
    // Find the utility to be transferred in the actual privilege database to access the utility properties
    const privilege = await Privilege.findOne({
      "nft_details.nft_collection_address": nft_collection_address,
    });

    if (!privilege) {
      return res.status(404).json({
        message: `Privilege not found for nft_collection_address ${nft_collection_address}`,
      });
    }

    // Check if the utility exists and is not already claimed
    const token = privilege.tokens.find(
      (t) => t.token_id === parseInt(token_id, 10)
    );
    if (!token) {
      return res
        .status(404)
        .json({ message: `Token not found for token_id ${token_id}` });
    }

    const utilityIndex = token.utilities.findIndex(
      (u) => u.utility_id === parseInt(utility_id, 10)
    );
    if (utilityIndex === -1) {
      return res
        .status(404)
        .json({ message: `Utility not found for utility_id ${utility_id}` });
    }

    // Check if the sender has a claim database
    const senderClaim = await Claim.findOne({
      wallet_address: sender_wallet_address,
    });

    if (!senderClaim) {
      return res.status(404).json({
        message: `Claim database not found for wallet address ${sender_wallet_address}`,
      });
    }

    // Find the token and utility in the sender's claim database
    const nftCollectionIndex = senderClaim.nft_collection_addresses.findIndex(
      (nc) => nc.nft_collection_address === nft_collection_address
    );
    if (nftCollectionIndex === -1) {
      return res.status(404).json({
        message: `Claim database not found for nft_collection_address ${nft_collection_address}`,
      });
    }
    const tokenIndex = senderClaim.nft_collection_addresses[
      nftCollectionIndex
    ].tokens.findIndex((t) => t.token_id === parseInt(token_id, 10));
    if (tokenIndex === -1) {
      return res
        .status(404)
        .json({ message: `Claim database not found for token_id ${token_id}` });
    }

    for (let i = 0; i < senderClaim.nft_collection_addresses.length; i++) {
      if (
        senderClaim.nft_collection_addresses[i].nft_collection_address ===
        nft_collection_address
      ) {
        const tokens = senderClaim.nft_collection_addresses[i].tokens;
        console.log("yes");
        for (let j = 0; j < tokens.length; j++) {
          if (tokens[j].token_id === parseInt(token_id, 10)) {
            const utilities = tokens[j].utilities;
            console.log("yes");
            for (let k = 0; k < utilities.length; k++) {
              if (utilities[k].utility_id === parseInt(utility_id, 10)) {
                if (utilities[k].transferred) {
                  return res.status(400).json({
                    message: `Utility ${utility_id} has already been transferred`,
                  });
                }
                if (utilities[k].redeemed) {
                  return res.status(400).json({
                    message: `Utility ${utility_id} has already been redeemed,can't be transferred`,
                  });
                }

                console.log("yes");
                utilities[k].transferred = true;
                utilities[k].transfer_time = new Date();
              }
            }
            break;
          }
        }
        break;
      }
    }

    await senderClaim.save();

    // Check if the receiver has a claim database
    let receiverClaim = await Claim.findOne({
      wallet_address: receiver_wallet_address,
    });

    if (!receiverClaim) {
      // If the receiver does not have a claim database, create a new one
      receiverClaim = await Claim.create({
        wallet_address: receiver_wallet_address,
        nft_collection_addresses: [
          {
            nft_collection_address,
            tokens: [
              {
                token_id,
                utilities: [
                  {
                    utility_id,
                    utility_name: token.utilities[utilityIndex].utility_name,
                    utility_image: token.utilities[utilityIndex].utility_image,
                    utility_description:
                      token.utilities[utilityIndex].utility_description,
                    expiration_time:
                      token.utilities[utilityIndex].expiration_time,
                    transferred: false,
                    redeemed: false,
                    is_listed: false,
                    list_price: 0,
                    buyer_address: "0",
                    transfer_time: transfer_time,
                  },
                ],
              },
            ],
          },
        ],
      });
    } else {
      // If the receiver has a claim database, update it
      const nftCollectionIndex =
        receiverClaim.nft_collection_addresses.findIndex(
          (nc) => nc.nft_collection_address === nft_collection_address
        );
      if (nftCollectionIndex === -1) {
        // If the receiver does not have a claim database for the given nft collection, add a new nft collection with the transferred token and utility
        receiverClaim.nft_collection_addresses.push({
          nft_collection_address,
          tokens: [
            {
              token_id,
              utilities: [
                {
                  utility_id,
                  utility_name: token.utilities[utilityIndex].utility_name,
                  utility_image: token.utilities[utilityIndex].utility_image,
                  utility_description:
                    token.utilities[utilityIndex].utility_description,
                  expiration_time,
                  transferred: false,
                  redeemed: false,
                  is_listed: false,
                  list_price: 0,
                  buyer_address: "0",
                  transfer_time: transfer_time,
                },
              ],
            },
          ],
        });
      } else {
        const tokenIndex = receiverClaim.nft_collection_addresses[
          nftCollectionIndex
        ].tokens.findIndex((t) => t.token_id === token_id);
        if (tokenIndex === -1) {
          // If the receiver has a claim database for the given nft collection but not for the transferred token, add the transferred token and utility to the nft collection
          receiverClaim.nft_collection_addresses[
            nftCollectionIndex
          ].tokens.push({
            token_id,
            utilities: [
              {
                utility_id,
                utility_name: token.utilities[utilityIndex].utility_name,
                utility_image: token.utilities[utilityIndex].utility_image,
                utility_description:
                  token.utilities[utilityIndex].utility_description,
                expiration_time: token.utilities[utilityIndex].expiration_time,
                transferred: false,
                redeemed: false,
                is_listed: false,
                list_price: 0,
                buyer_address: "0",
                transfer_time: transfer_time,
              },
            ],
          });
        } else {
          const utilityIndex = receiverClaim.nft_collections[
            nftCollectionIndex
          ].tokens[tokenIndex].utilities.findIndex(
            (u) => u.utility_id === utility_id
          );
          if (utilityIndex === -1) {
            // If the receiver has a claim database for the given nft collection and token but not for the transferred utility, add the transferred utility to the token
            receiverClaim.nft_collection_addresses[nftCollectionIndex].tokens[
              tokenIndex
            ].utilities.push({
              utility_id,
              utility_name: token.utilities[utilityIndex].utility_name,
              utility_image: token.utilities[utilityIndex].utility_image,
              utility_description:
                token.utilities[utilityIndex].utility_description,
              expiration_time: token.utilities[utilityIndex].expiration_time,
              transferred: false,
              redeemed: false,
              is_listed: false,
              list_price: 0,
              buyer_address: "0",
              transfer_time: transfer_time,
            });
          } else {
            // If the receiver already has a claim for the transferred utility, do not transfer it again
            return res.status(400).json({
              message: `Utility ${utility_id} has already been claimed by ${receiver_wallet_address}`,
            });
          }
        }
      }
      await receiverClaim.save();
    }

    return res.status(200).json({
      message: `Utility ${utility_id} has been transferred from ${sender_wallet_address} to ${receiver_wallet_address}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.redeemPrivilege = async (req, res) => {
  const { wallet_address, nft_collection_address, token_id, utility_id } =
    req.body;

  try {
    const claim = await Claim.findOne({ wallet_address: wallet_address });
    if (!claim) {
      return res
        .status(404)
        .json({ message: "Claim not found for the given wallet address" });
    }

    const nftCollectionIndex = claim.nft_collection_addresses.findIndex(
      (nftCollection) =>
        nftCollection.nft_collection_address === nft_collection_address
    );
    if (nftCollectionIndex === -1) {
      return res.status(404).json({
        message: `Claim database not found for nft_collection_address ${nft_collection_address}`,
      });
    }

    const tokenIndex = claim.nft_collection_addresses[
      nftCollectionIndex
    ].tokens.findIndex((token) => token.token_id === parseInt(token_id, 10));
    if (tokenIndex === -1) {
      return res
        .status(404)
        .json({ message: `Claim database not found for token_id ${token_id}` });
    }

    for (let i = 0; i < claim.nft_collection_addresses.length; i++) {
      if (
        claim.nft_collection_addresses[i].nft_collection_address ===
        nft_collection_address
      ) {
        const tokens = claim.nft_collection_addresses[i].tokens;
        console.log("yes");
        for (let j = 0; j < tokens.length; j++) {
          if (tokens[j].token_id === parseInt(token_id, 10)) {
            const utilities = tokens[i].utilities;
            console.log("yes");
            for (let k = 0; k < utilities.length; k++) {
              if (utilities[k].utility_id === parseInt(utility_id, 10)) {
                if (utilities[k].transferred) {
                  return res.status(400).json({
                    message: `Utility ${utility_id} has already been transferred, can't be redeemed`,
                  });
                }
                if (utilities[k].redeemed) {
                  return res.status(400).json({
                    message: `Utility ${utility_id} has already been redeemed`,
                  });

                  console.log("yes");
                  utilities[k].redeemed = true;
                }
              }
            }
            break;
          }
        }
        break;
      }
    }

    await claim.save();

    return res.status(200).json({ message: "Utility successfully redeemed" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to redeem utility", error: error.message });
  }
};

exports.listPrivilege = async (req, res) => {
  const { wallet_address, nft_collection_address, token_id, utility_id } =
    req.body;
  const { list_price } = req.body;

  try {
    const claim = await Claim.findOne({
      wallet_address,
      "nft_collection_addresses.nft_collection_address": nft_collection_address,
      "nft_collection_addresses.tokens.token_id": parseInt(token_id, 10),
      "nft_collection_addresses.tokens.utilities.utility_id": parseInt(
        utility_id,
        10
      ),
    });

    if (!claim) {
      return res.status(404).json({
        message: `Claim not found for token ${token_id} and utility ${utility_id}`,
      });
    }

    const utility = claim.nft_collection_addresses[0].tokens[0].utilities.find(
      (u) => u.utility_id === parseInt(utility_id, 10)
    );

    if (!utility) {
      return res.status(404).json({
        message: `Utility not found for utility_id ${utility_id}`,
      });
    }

    if (utility.transferred) {
      return res.status(400).json({
        message: "Cannot list a utility that has already been transferred",
      });
    }

    if (utility.is_listed) {
      return res.status(400).json({
        message: "Cannot list a utility that has already been listed",
      });
    }

    utility.is_listed = true;
    utility.list_price = list_price;

    await claim.save();

    res.status(200).json({
      message: `Utility ${utility_id} listed successfully with price ${list_price}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
