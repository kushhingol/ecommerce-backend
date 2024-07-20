// const request = require("supertest");
// const app = require("../app");
// const mongoose = require("mongoose");
// const User = require("../models/User");

// let server;

// beforeAll(async () => {
//   server = app.listen(3000);
//   await mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// });

// afterAll(async () => {
//   server.close();
//   await mongoose.connection.close();
// });

// describe("User Management", () => {
//   let token;
//   beforeAll(async () => {
//     const res = await request(app).post("/api/auth/login").send({
//       email: "admin@example.com",
//       password: "password123",
//     });
//     token = res.body.token;
//   });

//   it("should add a new user", async () => {
//     const res = await request(app)
//       .post("/api/users")
//       .set("Authorization", `Bearer ${token}`)
//       .send({
//         username: "testuser",
//         password: "password123",
//         email: "test@example.com",
//         userType: "Buyer",
//       });
//     expect(res.statusCode).toEqual(201);
//     expect(res.body).toHaveProperty("userId");
//   });

//   it("should update a user", async () => {
//     const user = await User.findOne({ email: "test@example.com" });
//     const res = await request(app)
//       .put("/api/users/userId")
//       .set("Authorization", `Bearer ${token}`)
//       .send({
//         username: "updateduser",
//         email: "updated@example.com",
//         userType: "Seller",
//       });
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("userId", user._id.toString());
//   });

//   it("should delete a user", async () => {
//     const user = await User.findOne({ email: "updated@example.com" });
//     const res = await request(app)
//       .delete("/api/users/userId")
//       .set("Authorization", `Bearer ${token}`)
//       .send({ userId: user._id });
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("message", "User deleted successfully");
//   });

//   it("should authenticate a user and return a token", async () => {
//     const res = await request(app).post("/api/auth/login").send({
//       email: "test@example.com",
//       password: "password123",
//     });
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("token");
//   });
// });

const User = require("../models/User");
const { generateToken } = require("../config/auth");
const {
  addUser,
  updateUser,
  deleteUser,
  loginUser,
} = require("../controllers/userController");

// Mock the User model
jest.mock("../models/User");

// Mock the generateToken function
jest.mock("../config/auth", () => ({
  generateToken: jest.fn(),
}));

describe("User Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: { _id: "userId" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("addUser", () => {
    it("should return 400 if user already exists", async () => {
      User.findOne.mockResolvedValue({});

      await addUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
    });

    it("should create a new user and return 200", async () => {
      User.findOne.mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue({});
      req.body = {
        username: "testuser",
        password: "password",
        email: "test@test.com",
        userType: "user",
      };

      await addUser(req, res, next);

      expect(User.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@test.com",
        userType: "user",
      });
    });

    it("should handle server errors", async () => {
      User.findOne.mockRejectedValue(new Error("Server error"));

      await addUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: `Server error. Error Details: Error: Server error`,
      });
    });
  });

  describe("updateUser", () => {
    it("should return 404 if user not found", async () => {
      User.findById.mockResolvedValue(null);

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should update the user and return 200", async () => {
      const user = {
        save: jest.fn().mockResolvedValue({}),
        username: "olduser",
        email: "old@test.com",
        userType: "user",
      };
      User.findById.mockResolvedValue(user);
      req.body = {
        username: "newuser",
        email: "new@test.com",
        userType: "admin",
      };

      await updateUser(req, res, next);

      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        username: "newuser",
        email: "new@test.com",
        userType: "admin",
      });
    });

    it("should handle server errors", async () => {
      User.findById.mockRejectedValue(new Error("Server error"));

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: `Server error. Error Details: Error: Server error`,
      });
    });
  });

  describe("deleteUser", () => {
    it("should return 404 if user not found", async () => {
      User.findById.mockResolvedValue(null);

      await deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should delete the user and return 200", async () => {
      const user = {
        remove: jest.fn().mockResolvedValue({}),
      };
      User.findById.mockResolvedValue(user);

      await deleteUser(req, res, next);

      expect(user.remove).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should handle server errors", async () => {
      User.findById.mockRejectedValue(new Error("Server error"));

      await deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: `Server error. Error Details: Error: Server error`,
      });
    });
  });

  describe("loginUser", () => {
    it("should return 400 if credentials are invalid", async () => {
      User.findOne.mockResolvedValue(null);

      await loginUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should return 400 if password is incorrect", async () => {
      const user = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockResolvedValue(user);
      req.body = { email: "test@test.com", password: "wrongpassword" };

      await loginUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should return a token if credentials are valid", async () => {
      const user = {
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);
      generateToken.mockReturnValue("token");
      req.body = { email: "test@test.com", password: "password" };

      await loginUser(req, res, next);

      expect(generateToken).toHaveBeenCalledWith(user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: "token" });
    });

    it("should handle server errors", async () => {
      User.findOne.mockRejectedValue(new Error("Server error"));

      await loginUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: `Server error. Error Details: Error: Server error`,
      });
    });
  });
});
