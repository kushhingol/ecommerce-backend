const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/orders", authMiddleware, orderController.getAllOrders);
router.get("/orders/:orderId", authMiddleware, orderController.getOrderById);
router.post("/orders", authMiddleware, orderController.placeOrder);
router.put("/orders/cancel", authMiddleware, orderController.cancelOrder);
router.put("/orders/status", authMiddleware, orderController.updateOrderStatus);

module.exports = router;
