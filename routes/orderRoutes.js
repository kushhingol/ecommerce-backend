const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/orders", authMiddleware, orderController.placeOrder);
router.put("/orders/cancel", authMiddleware, orderController.cancelOrder);

module.exports = router;
