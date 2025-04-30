const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orderRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const cors = require("cors");
const mongoose = require("mongoose");
const { startSubscriptionCron } = require("./cron/subscriptionCron");
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();
app.use(cors());
// Middleware
app.use(express.json());

// Add this before your routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes); // Added forward slash before "api"
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// app.use("/api", require("./routes/api"));

// Root Route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start the subscription cron job after server starts
  startSubscriptionCron();
});

// Export for Vercel
module.exports = app;

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Start the subscription processor cron job
    require("./cron/subscriptionProcessor");
  })
  .catch((err) => console.error("MongoDB connection error:", err));
