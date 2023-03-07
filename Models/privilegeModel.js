const mongoose = require("mongoose");

const privilegeSchema = new mongoose.Schema({
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
    required: true,
    default: false,
  },
});


const Privilege = mongoose.model('Privilege',privilegeSchema);

module.exports = Privilege;