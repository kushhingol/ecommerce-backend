const express = require("express");
const router = express.Router();
const {
  addProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const checkRole = require("../middlewares/checkRole");
const upload = require("../middlewares/upload");

router.get("/products", authMiddleware, getProducts);

router.get("/products/:productId", authMiddleware, getProductById);

router.post(
  "/products",
  authMiddleware,
  checkRole,
  upload.single("productImage"),
  addProduct
);
router.put(
  "/products/:productId",
  authMiddleware,
  checkRole,
  upload.single("productImage"),
  updateProduct
);
router.delete("/products/:productId", authMiddleware, checkRole, deleteProduct);

module.exports = router;
