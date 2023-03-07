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
      token_id,
      utility_name,
      utility_id,
      expiration_time,
    });

    // Save the privilege object to the database
    await privilege.save();

    // Send a json response back to the client with the privilege ID
    res.status(201).json({
      privilege_id: privilege.id,
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
    const {
      wallet_address,
      nft_collection_address,
      token_id,
      utility_id,
      action,
      transfer_to,
    } = req.body;

    const privilege = await Privilege.findById(req.params.privilege_id);

    // If the privilege is not found in the database, send a 404 Not Found response
    if (!privilege) {
      return res.status(404).json({ error: "Privilege not found" });
    }

    // Check if the privilege has the requested utility ID
    if (!privilege.utility_ids.includes(utility_id)) {
      return res
        .status(400)
        .json({ error: "Privilege does not contain the requested utility ID" });
    }
    // Remove claimed utility ID from the privilege object's utility IDs array
    privilege.utility_ids.pull(utility_id);

    // Save updated privilege object to the database
    await privilege.save();

    // Send a JSON response back to the client with claimed privilege details
    res.status(200).json({
      wallet_address,
      nft_collection_address,
      token_id,
      utility_id,
      transfer,
      redeem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
