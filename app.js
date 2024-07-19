const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const path = require("path");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Static folder for images
app.use(
  "/uploads/productImages",
  express.static(path.join(__dirname, "uploads/productImages"))
);

// Routes
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
