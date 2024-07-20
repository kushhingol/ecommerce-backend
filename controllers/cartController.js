const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCartDetailsByUserId = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req?.params?.userId });
    res.status(200).json({ cartId: cart._id, items: cart.items });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.status(201).json({ cartId: cart._id, items: cart.items });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

const removeFromCart = async (req, res) => {
  const { itemId } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) =>
        item._id.toString() !== req?.params?.itemId ||
        item._id.toString() !== itemId
    );
    await cart.save();

    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

const updateCart = async (req, res) => {
  const { itemId, quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) =>
        item._id.toString() !== req?.params?.itemId ||
        item._id.toString() !== itemId
    );
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ cartId: cart._id, items: cart.items });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

module.exports = {
  getCartDetailsByUserId,
  addToCart,
  removeFromCart,
  updateCart,
};
