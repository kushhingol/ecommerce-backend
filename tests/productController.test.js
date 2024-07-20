const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Mock the Product model
jest.mock("../models/Product");

// Mock the fs module functions
jest.mock("fs");

describe("Product Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      file: {},
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

  describe("getProducts", () => {
    it("should return all products", async () => {
      const products = [{}, {}];
      Product.find.mockResolvedValue(products);
      await getProducts(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(products);
    });

    it("should handle server errors", async () => {
      Product.find.mockRejectedValue(new Error("Server error"));
      await getProducts(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("getProductById", () => {
    it("should return a product by id", async () => {
      const product = {};
      Product.findById.mockResolvedValue(product);
      req.params.productId = "productId";
      await getProductById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(product);
    });

    it("should handle server errors", async () => {
      Product.findById.mockRejectedValue(new Error("Server error"));
      req.params.productId = "productId";
      await getProductById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("addProduct", () => {
    it("should create a new product and return 201", async () => {
      req.body = {
        productName: "testProduct",
        description: "testDescription",
        price: 100,
        category: "testCategory",
      };
      req.file = { filename: "testImage.jpg" };
      const product = {};
      Product.prototype.save = jest.fn().mockResolvedValue(product);

      await addProduct(req, res, next);

      expect(Product.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        productName: "testProduct",
        description: "testDescription",
        price: 100,
        category: "testCategory",
        productImageURL: "/uploads/productImages/testImage.jpg",
      });
    });

    it("should handle server errors", async () => {
      req.file = { filename: "testImage.jpg" };
      Product.prototype.save = jest
        .fn()
        .mockRejectedValue(new Error("Server error"));

      await addProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("updateProduct", () => {
    it("should return 404 if product is not found", async () => {
      Product.findById.mockResolvedValue(null);
      req.params.productId = "productId";
      await updateProduct(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    it("should return 403 if user is not the creator of the product", async () => {
      const product = { createdBy: "anotherUserId" };
      Product.findById.mockResolvedValue(product);
      req.params.productId = "productId";
      await updateProduct(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
    });

    it("should update the product and return 200", async () => {
      const product = {
        save: jest.fn().mockResolvedValue({}),
        createdBy: "userId",
        productName: "oldProduct",
        description: "oldDescription",
        price: 100,
        category: "oldCategory",
        productImageURL: "/uploads/productImages/oldImage.jpg",
      };
      Product.findById.mockResolvedValue(product);
      req.params.productId = "productId";
      req.body = {
        productName: "newProduct",
        description: "newDescription",
        price: 200,
        category: "newCategory",
      };
      req.file = { filename: "newImage.jpg" };
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue();

      await updateProduct(req, res, next);

      expect(product.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        productName: "newProduct",
        description: "newDescription",
        price: 200,
        category: "newCategory",
        productImageURL: "/uploads/productImages/newImage.jpg",
      });
    });

    it("should handle server errors", async () => {
      Product.findById.mockRejectedValue(new Error("Server error"));
      req.params.productId = "productId";
      await updateProduct(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });

  describe("deleteProduct", () => {
    it("should return 404 if product is not found", async () => {
      Product.findById.mockResolvedValue(null);
      req.params.productId = "productId";
      await deleteProduct(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
    });

    it("should return 403 if user is not the creator of the product", async () => {
      const product = { createdBy: "anotherUserId" };
      Product.findById.mockResolvedValue(product);
      req.params.productId = "productId";
      await deleteProduct(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Access denied" });
    });

    it("should delete the product and return 200", async () => {
      const product = {
        remove: jest.fn().mockResolvedValue({}),
        createdBy: "userId",
        productImageURL: "/uploads/productImages/oldImage.jpg",
      };
      Product.findById.mockResolvedValue(product);
      req.params.productId = "productId";
      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync.mockReturnValue();

      await deleteProduct(req, res, next);

      expect(product.remove).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Product deleted successfully",
      });
    });

    it("should handle server errors", async () => {
      Product.findById.mockRejectedValue(new Error("Server error"));
      req.params.productId = "productId";
      await deleteProduct(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error. Error Details: Error: Server error",
      });
    });
  });
});
