const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/email");

exports.placeOrder = async (req, res) => {
  const { productId, quantity, address } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const order = new Order({
      userId: req.user._id,
      productId,
      quantity,
      address,
      status: "Order Placed",
    });

    await order.save();

    await sendEmail(
      req.user.email,
      "Order Confirmation",
      `Your order for ${product.productName} has been placed.`
    );

    res.status(201).json({ orderId: order._id, status: "Order Placed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    order.status = "Order Cancelled";
    await order.save();

    const product = await Product.findById(order.productId);

    await sendEmail(
      req.user.email,
      "Order Cancellation",
      `Your order for ${product.productName} has been cancelled.`
    );

    res.status(200).json({ orderId: order._id, status: "Order Cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
