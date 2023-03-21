const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
  token_id: { type: Number, required: true },
  utilities: [{
    utility_id: { type: String, required: true },
    utility_name: { type: String, required: true },
    is_claimed: { type: Boolean, default: false },
    expiration_time: { type: Date, required: true }
  }]
});

const privilegeSchema = new mongoose.Schema({
  wallet_address: { type: String, required: true },
  nft_collection_address: { type: String, required: true },
  tokens: [TokenSchema]
});
const Privilege = mongoose.model("Privilege", privilegeSchema);

module.exports = Privilege;
