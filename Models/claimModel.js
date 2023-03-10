const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema({
  transfer:{
    type:Boolean,
    required:true,
    default:false
  },
  redeem:{
    type:Boolean,
    required:true,
    default:false,
  }
});

const utilitySchema = new mongoose.Schema({
  utility_id: {
    type: Number,
    required: true,
  },
  action:[actionSchema]
  
});

const tokenSchema = new mongoose.Schema({
  token_id: {
    type: String,
    required: true,
  },
  utility: {
    type: utilitySchema,
    required: true,
  },
});

const claimSchema = new mongoose.Schema({
  wallet_address:{
    type:String,
    required:true,
  },
  nft_collection_address:{
    type:String,
    required:true,
  },
  token_with_utility:[tokenSchema]
  
})


const Claim = mongoose.model("Claim", claimSchema);

module.exports = Claim;
