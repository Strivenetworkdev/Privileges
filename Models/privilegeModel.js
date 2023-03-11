const mongoose = require("mongoose");

const utilitySchema = new mongoose.Schema({
  utility_name: {
    type: String,
    required: true,
  },
  utility_id: {
    type: Number,
    required: true,
  },
  expiration_time: {
    type: Date,
    required: true,
  },
  is_claimed: {
    type: Boolean,
    default: false,
  },
});

const tokenSchema = new mongoose.Schema({
  token_id: {
    type: String,
    required: true,
  },
  utility: {
    type: [utilitySchema],
    required: true,
  },
});

const privilegeSchema = new mongoose.Schema({
  wallet_address: {
    type: String,
    required: true,
  },
  nft_collection_address: {
    type: String,
    required: true,
  },
  tokens: [tokenSchema],
});

const Privilege = mongoose.model("Privilege", privilegeSchema);

module.exports = Privilege;
