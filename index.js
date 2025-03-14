const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();
app.use(cors());
// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Added forward slash before "api"
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);

// app.use("/api", require("./routes/api"));

// Root Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
