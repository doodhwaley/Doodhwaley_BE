const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "order_placed",
        "confirmed",
        "in_progress",
        "dispatched",
        "delivered",
        "declined",
      ],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    orderPlacedTime: {
      type: Date,
      default: null,
    },
    confirmedTime: {
      type: Date,
      default: null,
    },
    inProgressTime: {
      type: Date,
      default: null,
    },
    dispatchedTime: {
      type: Date,
      default: null,
    },
    deliveredTime: {
      type: Date,
      default: null,
    },
    declinedTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrderStatus", orderStatusSchema);
