const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
  wallet_address: { type: String, required: true },
  nft_collection_addresses: [
    {
      nft_collection_address: { type: String, required: true },
      tokens: [
        {
          token_id: { type: Number, required: true },
          utilities: [
            {
              utility_id: { type: String, required: true },
              utility_name: { type: String, required: true },
              expiration_time: { type: Date, required: true },
              transferred: { type: Boolean, default: false },
              redeemed: { type: Boolean, default: false },
            },
          ],
        },
      ],
    },
  ],
});

const Claim = mongoose.model("Claim", claimSchema);

module.exports = Claim;
