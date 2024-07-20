const express = require("express");
const router = express.Router();
const {
  getCartDetailsByUserId,
  removeFromCart,
  updateCart,
  addToCart,
} = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/cart/user/:userId", authMiddleware, getCartDetailsByUserId);
router.post("/cart", authMiddleware, addToCart);
router.delete("/cart/item/:itemId", authMiddleware, removeFromCart);
router.put("/cart/item/:itemId", authMiddleware, updateCart);

module.exports = router;
