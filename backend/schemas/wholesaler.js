const mongoose = require("mongoose");

// Wholesaler schema mirrors the retailer structure so that
// `populate("Medicines.Medicine_name")` works correctly.
const WholesalerSchema = mongoose.Schema({
  Name: String,
  Medicines: [
    {
      Medicine_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "medicine",
      },
      Quantity: { type: Number, default: 0 },
    },
  ],
  Wholesaler: [],
  Latitude: Number,
  Longitude: Number,
});

const WholesalerModel = mongoose.model("Wholesaler", WholesalerSchema);
module.exports = WholesalerModel;
