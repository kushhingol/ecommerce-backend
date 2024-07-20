const express = require("express");
const router = express.Router();
const {
  addUser,
  deleteUser,
  loginUser,
  updateUser,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/users", addUser);
router.put("/users/:userId", authMiddleware, updateUser);
router.delete("/users/:userId", authMiddleware, deleteUser);
router.post("/auth/login", loginUser);

module.exports = router;
