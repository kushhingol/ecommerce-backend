const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

/**
 * @desc: Get Products
 * @route GET /api/products
 * @access Private
 */
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

/**
 * @desc: Get Product by id
 * @route GET /api/products/:productId
 * @access Private
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req?.params?.productId);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

/**
 * @desc: Add a product
 * @route POST /api/products
 * @access Private
 */
const addProduct = async (req, res) => {
  const { productName, description, price, category } = req.body;
  const productImage = req.file;

  if (!productImage) {
    return res.status(400).json({ message: "Product image is required" });
  }

  const productImageURL = `/uploads/productImages/${productImage.filename}`;

  try {
    const product = new Product({
      productName,
      description,
      price,
      category,
      productImageURL,
      createdBy: req.user._id,
    });

    await product.save();
    res.status(201).json({
      productId: product._id,
      productName,
      description,
      price,
      category,
      productImageURL,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

/**
 * @desc: Update Product by id
 * @route POST /api/products/:productId
 * @access Private
 */
const updateProduct = async (req, res) => {
  const { productId, productName, description, price, category } = req.body;
  const productImage = req.file;

  try {
    const product = await Product.findById(req?.params?.productId || productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    product.productName = productName || product.productName;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;

    if (productImage) {
      // Delete the old image
      const oldImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "productImages",
        path.basename(product.productImageURL)
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      product.productImageURL = `/uploads/productImages/${productImage.filename}`;
    }

    await product.save();
    res.status(200).json({
      productId: product._id,
      productName: product.productName,
      description: product.description,
      price: product.price,
      category: product.category,
      productImageURL: product.productImageURL,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

/**
 * @desc: Delete Product by id
 * @route DELETE /api/products/:productId
 * @access Private
 */
const deleteProduct = async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await Product.findById(req?.params?.productId || productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const imagePath = path.join(
      __dirname,
      "..",
      "uploads",
      "productImages",
      path.basename(product.productImageURL)
    );
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await product.remove();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
