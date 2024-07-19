const User = require("../models/User");
const { generateToken } = require("../config/auth");

exports.addUser = async (req, res) => {
  const { username, password, email, userType } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ username, password, email, userType });
    await user.save();
    res.status(200).json({ userId: user._id, username, email, userType });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

exports.updateUser = async (req, res) => {
  const { username, email, userType } = req.body;

  try {
    const user = await User.findById(req?.user?._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.username = username || user.username;
    user.email = email || user.email;
    user.userType = userType || user.userType;
    await user.save();

    res.status(200).json({
      userId: user._id,
      username: user.username,
      email: user.email,
      userType: user.userType,
    });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log(req);
    const user = await User.findById(req?.user?._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.remove();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: `Server error. Error Details: ${err}` });
  }
};
