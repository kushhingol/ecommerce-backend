const express = require("express");
const router = express.Router();
const {
  cancelOrder,
  getAllOrders,
  getOrderById,
  placeOrder,
  updateOrderStatus,
} = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/orders", authMiddleware, getAllOrders);
router.get("/orders/:orderId", authMiddleware, getOrderById);
router.post("/orders", authMiddleware, placeOrder);
router.put("/orders/cancel", authMiddleware, cancelOrder);
router.put("/orders/status", authMiddleware, updateOrderStatus);

module.exports = router;
