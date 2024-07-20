const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/email");
const io = require("../config/socket");
const {
  getAllOrders,
  getOrderById,
  placeOrder,
  cancelOrder,
} = require("../controllers/orderController");

// Mock the Order and Product models and other dependencies
jest.mock("../models/Order");
jest.mock("../models/Product");
jest.mock("../utils/email");

describe("Order Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { _id: "userId", email: "test@example.com" },
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

  describe("getAllOrders", () => {
    it("should return all orders", async () => {
      const orders = [{}, {}];
      Order.find.mockResolvedValue(orders);
      await getAllOrders(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(orders);
    });

    it("should handle server errors", async () => {
      Order.find.mockRejectedValue(new Error("Server error"));
      await getAllOrders(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("getOrderById", () => {
    it("should return an order by id", async () => {
      const order = {};
      Order.findById.mockResolvedValue(order);
      req.params.orderId = "orderId";
      await getOrderById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it("should handle server errors", async () => {
      Order.findById.mockRejectedValue(new Error("Server error"));
      req.params.orderId = "orderId";
      await getOrderById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("placeOrder", () => {
    it("should return 404 if product is not found", async () => {
      Product.findById.mockResolvedValue(null);
      req.body.productId = "productId";
      await placeOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    it("should create a new order and return 201", async () => {
      const product = { productName: "testProduct" };
      Product.findById.mockResolvedValue(product);
      req.body = {
        productId: "productId",
        quantity: 1,
        address: "testAddress",
      };
      const order = {
        save: jest.fn().mockResolvedValue({}),
        _id: "orderId",
      };
      Order.mockImplementation(() => order);

      await placeOrder(req, res, next);

      expect(order.save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith(
        "test@example.com",
        "Order Confirmation",
        "Your order for testProduct has been placed."
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        orderId: "orderId",
        status: "Order Placed",
      });
    });

    it("should handle server errors", async () => {
      Product.findById.mockRejectedValue(new Error("Server error"));
      req.body.productId = "productId";
      await placeOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("cancelOrder", () => {
    it("should return 404 if order is not found", async () => {
      Order.findById.mockResolvedValue(null);
      req.body.orderId = "orderId";
      await cancelOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order not found" });
    });

    it("should return 403 if user is not the owner of the order", async () => {
      const order = { userId: "anotherUserId" };
      Order.findById.mockResolvedValue(order);
      req.body.orderId = "orderId";
      await cancelOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
    });

    it("should cancel the order and return 200", async () => {
      const order = {
        userId: "userId",
        productId: "productId",
        save: jest.fn().mockResolvedValue({}),
      };
      Order.findById.mockResolvedValue(order);
      const product = { productName: "testProduct" };
      Product.findById.mockResolvedValue(product);
      req.body.orderId = "orderId";

      await cancelOrder(req, res, next);

      expect(order.save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith(
        "test@example.com",
        "Order Cancellation",
        "Your order for testProduct has been cancelled."
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        orderId: order._id,
        status: "Order Cancelled",
      });
    });

    it("should handle server errors", async () => {
      Order.findById.mockRejectedValue(new Error("Server error"));
      req.body.orderId = "orderId";
      await cancelOrder(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });
});
