const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/users", userController.addUser);
router.put("/users/:userId", authMiddleware, userController.updateUser);
router.delete("/users/:userId", authMiddleware, userController.deleteUser);
router.post("/auth/login", userController.loginUser);

module.exports = router;
