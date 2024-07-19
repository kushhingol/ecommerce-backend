const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const path = require("path");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Product Management", () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    token = res.body.token;
  });

  it("should add a new product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("productName", "Test Product")
      .field("description", "Test Description")
      .field("price", 100)
      .field("category", "Test Category")
      .attach("productImage", path.resolve(__dirname, "test-image.jpg"));
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("productId");
  });

  it("should update a product", async () => {
    const product = await Product.findOne({ productName: "Test Product" });
    const res = await request(app)
      .put(`/api/products/${product._id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .field("productId", product._id.toString())
      .field("productName", "Updated Product")
      .field("description", "Updated Description")
      .field("price", 200)
      .field("category", "Updated Category")
      .attach("productImage", path.resolve(__dirname, "test-image.jpg"));
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("productId", product._id.toString());
  });

  it("should delete a product", async () => {
    const product = await Product.findOne({ productName: "Updated Product" });
    const res = await request(app)
      .delete(`/api/products/${product._id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product._id.toString() });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Product deleted successfully");
  });
});
