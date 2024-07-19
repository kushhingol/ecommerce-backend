const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Cart Management", () => {
  let token;
  let productId;
  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "buyer@example.com",
      password: "password123",
    });
    token = res.body.token;

    const productRes = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .field("productName", "Test Product")
      .field("description", "Test Description")
      .field("price", 100)
      .field("category", "Test Category")
      .attach("productImage", path.resolve(__dirname, "test-image.jpg"));

    productId = productRes.body.productId;
  });

  it("should add an item to the cart", async () => {
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId,
        quantity: 1,
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("cartId");
    expect(res.body.items).toHaveLength(1);
  });

  it("should update item quantity in the cart", async () => {
    const cart = await Cart.findOne({ userId: req.user._id });
    const item = cart.items[0];
    const res = await request(app)
      .put("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({
        itemId: item._id.toString(),
        quantity: 3,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.items[0].quantity).toEqual(3);
  });

  it("should remove an item from the cart", async () => {
    const cart = await Cart.findOne({ userId: req.user._id });
    const item = cart.items[0];
    const res = await request(app)
      .delete("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ itemId: item._id.toString() });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "Item removed from cart");
  });
});
