const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
  address: { type: String, required: true },
  status: {
    type: String,
    enum: [
      "Order Placed",
      "Under Packaging",
      "Dispatch",
      "Delivered",
      "Order Cancelled",
    ],
    default: "Order Placed",
  },
  createdAt: { type: Date, default: Date.now },
  statusHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Order", OrderSchema);
