const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/email");
const io = require("../config/socket");

/**
 * @desc: Get Products
 * @route GET /api/orders
 * @access Private
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

/**
 * @desc: Get Products by Id
 * @route GET /api/orders/:orderId
 * @access Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req?.params?.orderId);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

/**
 * @desc: Place order
 * @route POST /api/orders
 * @access Private
 */
const placeOrder = async (req, res) => {
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
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

/**
 * @desc: Cancel order
 * @route PUT /api/orders/cancel
 * @access Private
 */
const cancelOrder = async (req, res) => {
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
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

/**
 * @desc: update Order status
 * @route PUT /api/orders/status
 * @access Private
 */
const updateOrderStatus = async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Only allow certain status updates
    const allowedStatuses = ["Under Packaging", "Dispatch", "Delivered"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    order.status = status;
    order.statusHistory.push({ status });
    await order.save();

    // Emit the updated status to subscribed users
    io.to(order.userId.toString()).emit("orderStatusUpdate", {
      orderId,
      status,
    });

    res.status(200).json({ orderId: order._id, status });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  placeOrder,
  cancelOrder,
  updateOrderStatus,
};
