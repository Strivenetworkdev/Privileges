const Privilege = require("../models/privilegeModel");
const Claim = require("../Models/claimModel");

// Creating a new privilege

exports.createPrivilege = async (req, res) => {
  const {
    wallet_address,
    nft_collection_address,
    utility_name,
    utility_id,
    expiration_time,
  } = req.body;
  try {
    let privilege = await Privilege.findOne({
      wallet_address,
      nft_collection_address,
    });

    if (!privilege) {
      // If a privilege document does not already exist, create a new one
      privilege = new Privilege({
        wallet_address,
        nft_collection_address,
        tokens: [],
      });

      // Create the token array with the utility array within each token
      for (let i = 0; i < 5; i++) {
        const token_id = `token${i + 1}`;
        privilege.tokens.push({
          token_id,
          utilities: [
            {
              utility_id,
              utility_name,
              expiration_time,
              is_claimed: false,
            },
          ],
        });
      }
    } else {
      // If a privilege document already exists, add the new utility to the utility array of each token
      privilege.tokens.forEach((token) => {
        token.utilities.push({
          utility_id,
          utility_name,
          expiration_time,
          is_claimed: false,
        });
      });
    }

    // Save the privilege object to the database
    await privilege.save();

    // Send a json response back to the client with the privilege ID
    res.status(201).json({
      privilege_id: privilege.id,
      message: "Privilege created successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Claiming a privilege
exports.claimPrivilege = async (req, res) => {
  const {
    wallet_address,
    nft_collection_address,
    token_id,
    utility_id,
    utility_name,
  } = req.body;
  try {
    // Check if the privilege exists
    const privilege = await Privilege.findOne({ nft_collection_address });

    if (!privilege) {
      return res.status(404).json({
        message: `Privilege not found for nft_collection_address ${nft_collection_address}`,
      });
    }

    // Check if the utility exists and is not already claimed
    const token = privilege.tokens.find((t) => t.token_id === token_id);
    if (!token) {
      return res
        .status(404)
        .json({ message: `Token not found for token_id ${token_id}` });
    }

    const utilityIndex = token.utilities.findIndex(
      (u) => u.utility_id === utility_id
    );
    if (utilityIndex === -1) {
      return res
        .status(404)
        .json({ message: `Utility not found for utility_id ${utility_id}` });
    }
    if (token.utilities[utilityIndex].is_claimed) {
      return res
        .status(400)
        .json({ message: `Utility ${utility_id} has already been claimed` });
    }

    // Update the privilege database to mark the utility as claimed
    await Privilege.updateOne(
      {
        nft_collection_address,
        "tokens.token_id": token_id,
        "tokens.utilities.utility": utility_id,
      },
      { $set: { "tokens.$[token].utilities.$[utility].is_claimed": true } },
      {
        arrayFilters: [
          { "token.token_id": token_id },
          { "utility.utility_id": utility_id },
        ],
      }
    );

    //  Check if the user has a claim database
    let claim = await Claim.findOne({ wallet_address });
    let nftCollectionIndex, tokenIndex;
    // let nft_collections = [];

    if (!claim) {
      // If the user does not have a claim database, create a new one
      claim = await Claim.create({
        wallet_address,
        nft_collection_addresses: [
          {
            nft_collection_address,
            tokens: [
              {
                token_id: token_id,
                utilities: [
                  {
                    utility_id,
                    utility_name,
                    expiration_time:
                      token.utilities[utilityIndex].expiration_time,
                    transferred: false,
                    redeemed: false,
                  },
                ],
              },
            ],
          },
        ],
      });
    } else {
      // If the user has a claim database, update it
      const nftCollectionIndex = claim.nft_collection_addresses.findIndex(
        (nc) => nc.nft_collection_address === nft_collection_address
      );
      if (nftCollectionIndex === -1) {
        // If the user does not have a claim database for this nft_collection_address, add it
        claim.nft_collection_addresses.push({
          nft_collection_address,
          tokens: [
            {
              token_id,
              utilities: [
                {
                  utility_id,
                  utility_name,
                  expiration_time:
                    token.utilities[utilityIndex].expiration_time,
                  transferred: false,
                  redeemed: false,
                },
              ],
            },
          ],
        });
      } else {
        // If the user already has a claim database for this nft_collection_address, update it
        const tokenIndex = claim.nft_collection_addresses[
          nftCollectionIndex
        ].tokens.findIndex((t) => t.token_id === token_id);
        if (tokenIndex === -1) {
          // If the user does not have a claim database for this token_id, add it
          claim.nft_collection_addresses[nftCollectionIndex].tokens.push({
            token_id,
            utilities: [
              {
                utility_id,
                utility_name,
                expiration_time: token.utilities[utilityIndex].expiration_time,
                transferred: false,
                redeemed: false,
              },
            ],
          });
        } else {
          // If the user already has a claim database for this token_id, update it
          const utilityIndex = claim.nft_collection_addresses[
            nftCollectionIndex
          ].tokens[tokenIndex].utilities.findIndex(
            (u) => u.utility_id === utility_id
          );

          if (utilityIndex === -1) {
            // If the user does not have a claim database for this utility_id, add it
            claim.nft_collections[nftCollectionIndex].tokens[
              tokenIndex
            ].utilities.push({
              utility_id,
              utility_name,
              expiration_time: token.utilities[utilityIndex].expiration_time,
              transferred: false,
              redeemed: false,
            });
          } else {
            // If the user already has a claim database for this utility_id, update it
            claim.nft_collections[nftCollectionIndex].tokens[
              tokenIndex
            ].utilities[utilityIndex] = {
              utility_id,
              utility_name,
              expiration_time: token.utilities[utilityIndex].expiration_time,
              transferred: false,
              redeemed: false,
            };
          }
        }
      }
    }

    // Save the updated claim database
    await claim.save();

    res
      .status(200)
      .json({
        message: `Utility ${utility_id} has been claimed for token ${token_id}`,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to claim utility" });
  }
};
