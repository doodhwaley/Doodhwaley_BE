const mongoose = require("mongoose");
require("dotenv").config();

// Cache connection for serverless
let cachedConnection = null;

const connectDB = async () => {
  // If we have a cached connection, use it
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedConnection = conn;
    console.log("MongoDB Connected...");
    return conn;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    // Don't exit process in serverless environment - this kills the function
    // process.exit(1); - REMOVE THIS LINE
    throw err; // Throw the error instead
  }
};

module.exports = connectDB;
