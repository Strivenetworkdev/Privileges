const Privilege = require("../models/privilegeModel");
const Claim = require("../Models/claimModel");

// Creating a new privilege

exports.createPrivilege = async (req, res) => {
  try {
    const {
      wallet_address,
      nft_collection_address,
      token_id,
      utility_name,
      utility_id,
      expiration_time,
    } = req.body;

    // Create a new privilege object using the request body
    const privilege = new Privilege({
      wallet_address,
      nft_collection_address,
      tokens: [
        {
          token_id,
          utility: {
            utility_name,
            utility_id,
            expiration_time,
          },
        },
      ],
    });

    // Save the privilege object to the database
    await privilege.save();

    // Send a json response back to the client with the privilege ID
    res.status(201).json({
      privilege_id: privilege.id,
      token_id: privilege.tokens.token_id,
      utility_id: privilege.tokens.utility.utility_id,
      utility_name: privilege.tokens.utility.utility_name,
      utility_claimed: privilege.tokens.utility.is_claimed
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
  try {
    const { wallet_address, nft_collection_address, token_id, utility_id } =
      req.body;

    const nft_utility = await Privilege.findOne({
      "tokens.token_id": token_id,
      "tokens.utility.utility_id": utility_id,
    });

    if (!nft_utility) {
      res.status(404).json({
        error: "No matching nft utility found.",
      });
      return;
    }

    const my_token_id = nft_utility.tokens.token_id;
    const my_utility = nft_utility.tokens.utility

    // const token = nft_utility.tokens.find((t) => t.token_id === token_id);
    // const utility = token.utility;

    if (!my_utility.is_claimed) {
      res.status(400).json({
        error: "Utility is already claimed or missing.",
      });
      return;
    }

    utility.is_claimed = true;

    // Save updated privilege object to the database
    await nft_utility.save();

    const transfer = true;
    const redeem = true;

    const claim = new Claim({
      wallet_address,
      nft_collection_address,
      token_with_utility: [
        {
          token_id,
          utility: {
            utility_id,
            action: [
              {
                transfer,
                redeem,
              },
            ],
          },
        },
      ],
    });

    await claim.save();

    // Send a JSON response back to the client with claimed privilege details
    res.status(200).json({
      wallet_address: claim.wallet_address,
      nft_collection_address: claim.nft_collection_address,
      token_id: claim.token_with_utility.token_id,
      utility_id: claim.token_with_utility.utility.utility_id,
      transfer: claim.token_with_utility.utility.action.transfer,
      transfer: claim.token_with_utility.utility.action.redeem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
