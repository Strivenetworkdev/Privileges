

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
