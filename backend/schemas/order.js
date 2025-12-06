const mongoose = require("mongoose");

const OrderItemSchema = mongoose.Schema({
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
});

const OrderSchema = mongoose.Schema(
  {
    retailerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    wholesalerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wholesaler",
      required: true,
    },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const OrderModel = mongoose.model("order", OrderSchema);
module.exports = OrderModel;


