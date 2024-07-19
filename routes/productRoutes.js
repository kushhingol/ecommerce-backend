const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const upload = require("../middlewares/upload");

router.post(
  "/products",
  authMiddleware,
  checkRole,
  upload.single("productImage"),
  productController.addProduct
);
router.put(
  "/products/:productId",
  authMiddleware,
  checkRole,
  upload.single("productImage"),
  productController.updateProduct
);
router.delete(
  "/products/:productId",
  authMiddleware,
  checkRole,
  productController.deleteProduct
);

module.exports = router;
