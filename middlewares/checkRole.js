const checkRole = (req, res, next) => {
  if (req.user.userType === "Admin" || req.user.userType === "Seller") {
    return next();
  } else {
    return res.status(403).json({ message: "Access denied" });
  }
};

module.exports = checkRole;
