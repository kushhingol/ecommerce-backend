const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Order Management", () => {
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

  it("should place an order", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId,
        quantity: 1,
        address: "123 Test St",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("orderId");
    expect(res.body).toHaveProperty("status", "Order Placed");
  });

  it("should cancel an order", async () => {
    const order = await Order.findOne({ userId: req.user._id });
    const res = await request(app)
      .put("/api/orders/cancel")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId: order._id.toString() });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("orderId", order._id.toString());
    expect(res.body).toHaveProperty("status", "Order Cancelled");
  });
});

describe("Order Status Updates", () => {
  let token;
  let productId;
  let orderId;
  let clientSocket;

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

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId,
        quantity: 1,
        address: "123 Test St",
      });

    orderId = orderRes.body.orderId;

    clientSocket = io.connect(`http://localhost:3000`, {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
    });

    clientSocket.emit("subscribeToOrder", orderId, res.body.userId);
  });

  afterAll((done) => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    done();
  });

  it("should receive real-time order status updates", (done) => {
    clientSocket.on("orderStatusUpdate", (data) => {
      expect(data).toHaveProperty("orderId", orderId);
      expect(data).toHaveProperty("status", "Dispatch");
      done();
    });

    request(app)
      .put("/api/orders/status")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId, status: "Dispatch" })
      .end((err, res) => {
        if (err) return done(err);
      });
  });
});
