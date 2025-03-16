const mongoose = require("mongoose");
require("dotenv").config();

// Remove connection options that cause problems
const connectDB = async () => {
  try {
    // Use older connection method
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    throw err;
  }
};

module.exports = connectDB;
