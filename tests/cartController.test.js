const Cart = require("../models/Cart");
const Product = require("../models/Product");
const {
  getCartDetailsByUserId,
  addToCart,
  removeFromCart,
  updateCart,
} = require("../controllers/cartController");

// Mock the Cart and Product models
jest.mock("../models/Cart");
jest.mock("../models/Product");

describe("Cart Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { _id: "userId" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCartDetailsByUserId", () => {
    it("should return cart details for a user", async () => {
      const cart = { _id: "cartId", items: [] };
      Cart.findOne.mockResolvedValue(cart);
      req.params.userId = "userId";

      await getCartDetailsByUserId(req, res, next);

      expect(Cart.findOne).toHaveBeenCalledWith({ userId: "userId" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ cartId: "cartId", items: [] });
    });

    it("should handle server errors", async () => {
      Cart.findOne.mockRejectedValue(new Error("Server error"));

      await getCartDetailsByUserId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("addToCart", () => {
    it("should return 404 if product is not found", async () => {
      Product.findById.mockResolvedValue(null);
      req.body = { productId: "productId", quantity: 1 };

      await addToCart(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    it("should add a new item to the cart", async () => {
      const product = { _id: "productId" };
      const cart = {
        userId: "userId",
        items: [],
        save: jest.fn().mockResolvedValue({}),
      };
      Product.findById.mockResolvedValue(product);
      Cart.findOne.mockResolvedValue(cart);
      req.body = { productId: "productId", quantity: 1 };

      await addToCart(req, res, next);

      expect(Cart.findOne).toHaveBeenCalledWith({ userId: "userId" });
      expect(cart.items.length).toBe(1);
      expect(cart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        cartId: cart._id,
        items: cart.items,
      });
    });

    it("should handle server errors", async () => {
      Product.findById.mockRejectedValue(new Error("Server error"));

      await addToCart(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("removeFromCart", () => {
    it("should return 404 if cart is not found", async () => {
      Cart.findOne.mockResolvedValue(null);
      req.body.itemId = "itemId";

      await removeFromCart(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cart not found" });
    });

    it("should remove an item from the cart", async () => {
      const cart = {
        userId: "userId",
        items: [{ _id: "itemId" }],
        save: jest.fn().mockResolvedValue({}),
      };
      Cart.findOne.mockResolvedValue(cart);
      req.body.itemId = "itemId";

      await removeFromCart(req, res, next);

      expect(Cart.findOne).toHaveBeenCalledWith({ userId: "userId" });
      expect(cart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Item removed from cart",
      });
    });

    it("should handle server errors", async () => {
      Cart.findOne.mockRejectedValue(new Error("Server error"));

      await removeFromCart(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("updateCart", () => {
    it("should return 404 if cart is not found", async () => {
      Cart.findOne.mockResolvedValue(null);
      req.body = { itemId: "itemId", quantity: 1 };

      await updateCart(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Cart not found" });
    });

    it("should return 404 if item is not found in the cart", async () => {
      const cart = { items: [], save: jest.fn() };
      Cart.findOne.mockResolvedValue(cart);
      req.body = { itemId: "itemId", quantity: 1 };

      await updateCart(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Item not found in cart",
      });
    });

    it("should update the quantity of an item in the cart", async () => {
      const cart = {
        userId: "userId",
        items: [{ _id: "itemId", quantity: 1 }],
        save: jest.fn().mockResolvedValue({}),
      };
      Cart.findOne.mockResolvedValue(cart);
      req.body = { itemId: "itemId", quantity: 2 };

      await updateCart(req, res, next);

      expect(Cart.findOne).toHaveBeenCalledWith({ userId: "userId" });
      expect(cart.items[0].quantity).toBe(2);
      expect(cart.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        cartId: cart._id,
        items: cart.items,
      });
    });

    it("should handle server errors", async () => {
      Cart.findOne.mockRejectedValue(new Error("Server error"));

      await updateCart(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });
});
