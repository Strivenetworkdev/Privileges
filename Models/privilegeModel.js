const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  token_id: { type: Number, required: true },
  utilities: [
    {
      utility_id: { type: String, required: true },
      utility_name: { type: String, required: true },
      utility_image: { type: String, required: true },
      utility_description: { type: String, default: "" },
      is_claimed: { type: Boolean, default: false },
      expiration_time: { type: Date, required: true },
      is_expirable: { type: String, default: true },
      creation_time: { type: Date, default: true },
    },
  ],
});

const nftSchema = new mongoose.Schema({
  nft_collection_address: { type: String, required: true },
  nft_collection_name: { type: String, required: true },
  nft_collection_image: { type: String, required: true },
  nft_collection_description: { type: String, required: true },
  nft_collection_tokens: { type: Number, required: true },
});

const privilegeSchema = new mongoose.Schema({
  wallet_address: { type: String, required: true },
  nft_details: [nftSchema],
  tokens: [TokenSchema],
});
const Privilege = mongoose.model("Privilege", privilegeSchema);

module.exports = Privilege;
