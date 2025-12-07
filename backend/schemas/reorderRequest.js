const mongoose = require("mongoose");

const ReorderRequestSchema = mongoose.Schema(
  {
    retailerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "medicine",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ReorderRequestModel = mongoose.model("reorderRequest", ReorderRequestSchema);
module.exports = ReorderRequestModel;

