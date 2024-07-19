const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get(
  "/cart/user/:userId",
  authMiddleware,
  cartController.getCartDetailsByUserId
);
router.post("/cart", authMiddleware, cartController.addToCart);
router.delete(
  "/cart/item/:itemId",
  authMiddleware,
  cartController.removeFromCart
);
router.put("/cart/item/:itemId", authMiddleware, cartController.updateCart);

module.exports = router;
