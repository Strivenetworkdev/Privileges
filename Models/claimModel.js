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
              utility_id: { type: Number, required: true },
              utility_name: { type: String, required: true },
              utility_image: { type: String, required: true },
              utility_description: { type: String, default: "" },
              expiration_time: { type: Date, required: true },
              is_expirable: { type: Boolean, default: true },
              transferred: { type: Boolean, default: false },
              redeemed: { type: Boolean, default: false },
              is_listed: { type: Boolean, default: false },
              list_price: { type: Number, default: 0 },
              buyer_address: { type: String, default: "0" },
              claim_time: { type: Date, required: true },
            },
          ],
        },
      ],
    },
  ],
});

const Claim = mongoose.model("Claim", claimSchema);

module.exports = Claim;
