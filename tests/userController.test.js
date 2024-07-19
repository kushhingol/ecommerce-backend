const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");

let server;

beforeAll(async () => {
  server = app.listen(3000);
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  server.close();
  await mongoose.connection.close();
});

describe("User Management", () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    token = res.body.token;
  });

  it("should add a new user", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "testuser",
        password: "password123",
        email: "test@example.com",
        userType: "Buyer",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("userId");
  });

  it("should update a user", async () => {
    const user = await User.findOne({ email: "test@example.com" });
    const res = await request(app)
      .put("/api/users/userId")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "updateduser",
        email: "updated@example.com",
        userType: "Seller",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("userId", user._id.toString());
  });

  it("should delete a user", async () => {
    const user = await User.findOne({ email: "updated@example.com" });
    const res = await request(app)
      .delete("/api/users/userId")
      .set("Authorization", `Bearer ${token}`)
      .send({ userId: user._id });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("message", "User deleted successfully");
  });

  it("should authenticate a user and return a token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});
