const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
  wallet_address: {
    type: String,
    required: true,
  },
  nft_collection_address: {
    type: String,
    required: true,
  },
  token_id: {
    type: Number,
    required: true,
  },
  utility_ids: {
    type: [Number],
    required: true,
  },
  action: {
    type: String,
    enum: ["transfer", "redeem"],
    required: true,
  },
  transfer_to: {
    type: String,
    required: false,
  },
  privilege_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Privilege",
    required: true,
  },
});

const Claim = mongoose.model("Claim", claimSchema);

module.exports = Claim;
