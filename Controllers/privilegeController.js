const Privilege = require("../models/privilegeModel");
const Claim = require("../Models/claimModel");

// Creating a new privilege

exports.createPrivilege = async (req, res) => {
  const creation_time = new Date();
  const {
    wallet_address,
    nft_collection_address,
    nft_collection_name,
    nft_collection_image,
    nft_collection_description,
    nft_collection_tokens,
    utility_name,
    utility_id,
    utility_image,
    utility_description,
    expiration_time,
  } = req.body;
  try {
    let privilege = await Privilege.findOne({
      wallet_address,
      "nft_details.nft_collection_address": nft_collection_address,
    });

    if (!privilege) {
      // If a privilege document does not already exist, create a new one
      privilege = new Privilege({
        wallet_address,
        nft_details: [
          {
            nft_collection_address,
            nft_collection_name,
            nft_collection_image,
            nft_collection_description,
            nft_collection_tokens,
          },
        ],
        tokens: [],
      });

      // Create the token array with the utility array within each token
      for (let i = 0; i < nft_collection_tokens; i++) {
        const token_id = i;
        privilege.tokens.push({
          token_id,
          utilities: [
            {
              utility_id,
              utility_name,
              utility_image,
              utility_description,
              expiration_time,
              is_claimed: false,
              is_expirable: true,
              creation_time: creation_time,
            },
          ],
        });
      }
    } else {
      console.log(creation_time);
      // If a privilege document already exists, add the new utility to the utility array of each token
      privilege.tokens.forEach((token) => {
        token.utilities.push({
          utility_id,
          utility_name,
          utility_image,
          utility_description,
          is_claimed: false,
          expiration_time,
          is_expirable: true,
          creation_time: new Date(),
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
  const claim_time = new Date();
  const {
    wallet_address,
    nft_collection_address,
    token_id,
    utility_id,
    // utility_name,
    // utility_image,
    // utility_description,
  } = req.body;
  try {
    // Check if the privilege exists
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
    if (token.utilities[utilityIndex].is_claimed) {
      return res
        .status(400)
        .json({ message: `Utility ${utility_id} has already been claimed` });
    }

    // Update the privilege database to mark the utility as claimed\
    // console.log(tokens);
    await Privilege.findOneAndUpdate(
      {
        "nft_details.nft_collection_address": nft_collection_address,
        "tokens.token_id": token_id,
        "tokens.utilities": { $elemMatch: { utility_id: utility_id } },
      },
      { $set: { "tokens.$[token].utilities.is_claimed": true } },
      {
        arrayFilters: [
          { "token.token_id": token_id },
          // { "utilities.utility_id": utility_id },
        ],
      }
    );

    await privilege.save();

    //  Check if the user has a claim database
    let claim = await Claim.findOne({ wallet_address });

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
                    claim_time: claim_time,
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
                  claim_time: claim_time,
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
                claim_time: claim_time,
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
            claim.nft_collection_addresses[nftCollectionIndex].tokens[
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
              claim_time: claim_time,
            });
          } else {
            // If the user already has a claim database for this utility_id, update it
            claim.nft_collection_addresses[nftCollectionIndex].tokens[
              tokenIndex
            ].utilities[utilityIndex] = {
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
              claim_time: claim_time,
            };
          }
        }
      }
    }

    // Save the updated claim database
    await claim.save();

    res.status(200).json({
      claim_id: claim.id,
      message: `Utility ${utility_id} has been claimed for token ${token_id} with collection address ${nft_collection_address}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to claim utility" });
  }
};

exports.getCreatedPrivileges = async (req, res) => {
  const { wallet_address } = req.params;

  try {
    const privileges = await Privilege.fiind({
      wallet_address,
    });
    console.log(privileges);

    // Create an empty object to store the privileges
    const result = {};

    privileges.forEach((privilege) => {
      const nftCollectionAddress = privilege.nft_details.nft_collection_address;
      const utilities = [];
      var enough = false;

      privilege.tokens.forEach((token) => {
        token.utilities.forEach((utility) => {
          if (!enough) {
            const { utility_id, utility_name } = utility;
            utilities.push({ utility_id, utility_name });
          }
        });
        enough = true;
      });
      // for (var i = 0; i < 1; i++) {
      //   const token_1 = privilege.tokens[0];
      //   token_1.utilities.forEach((utility) => {
      //       const { utility_id, utility_name } = utility;
      //       utilities.push({ utility_id, utility_name });

      //   });
      // }

      if (utilities.length > 0) {
        if (!result[nftCollectionAddress]) {
          result[nftCollectionAddress] = { utilities };
        }
        // result[nftCollectionAddress].utilities.push(...utilities);
      }
    });

    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to get created privileges.",
      error: error.message,
    });
  }
};
