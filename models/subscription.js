const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    subscriptionType: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    selectedDays: [
      {
        type: Number, // 0-6 for Sunday-Saturday
        default: [],
      },
    ],
    selectedDates: [
      {
        type: Number, // 1-31 for dates of month
        default: [],
      },
    ],
    address: {
      type: String,
      required: true,
    },
    additionalNotes: {
      type: String,
      default: "",
    },
    productDetails: {
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    lastOrderDate: {
      type: Date,
      default: null,
    },
    nextOrderDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
