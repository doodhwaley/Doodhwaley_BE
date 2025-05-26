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

// Function to update subscription data with end dates and delivery counts
// async function updateSubscriptionData() {
//   try {
//     const Subscription = require("./models/subscription");
//     const {
//       calculateDeliveriesFromSubscription,
//     } = require("./utils/subscriptionUtils");

//     // Get all subscriptions without endDate or numberOfDeliveries
//     const subscriptions = await Subscription.find({
//       $or: [
//         { endDate: { $exists: false } },
//         { numberOfDeliveries: { $exists: false } },
//       ],
//     });

//     console.log(`Found ${subscriptions.length} subscriptions to update`);

//     for (const subscription of subscriptions) {
//       const startDate = new Date(subscription.startDate);
//       const deliveries = calculateDeliveriesFromSubscription(
//         startDate,
//         subscription.subscriptionType,
//         subscription.selectedDays,
//         subscription.selectedDates
//       );

//       // Set endDate to last day of the month
//       const endDate = new Date(
//         startDate.getFullYear(),
//         startDate.getMonth() + 1,
//         0
//       );

//       // Update subscription
//       await Subscription.findByIdAndUpdate(subscription._id, {
//         endDate: endDate,
//         numberOfDeliveries: deliveries,
//       });

//       console.log(
//         `Updated subscription ${subscription._id} with ${deliveries} deliveries`
//       );
//     }

//     console.log("Finished updating subscription data");
//   } catch (error) {
//     console.error("Error updating subscription data:", error);
//   }
// }

// updateSubscriptionData();

// Export the function so it can be called from other files
// module.exports.updateSubscriptionData = updateSubscriptionData;

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
