const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getOrderStatusHistory,
} = require("../controllers/orderController.js");

// Create a new order
router.post("/create-order", authMiddleware, createOrder);

// Get all orders for the logged-in user
router.get("/my-orders", authMiddleware, getUserOrders);

// Get specific order by ID
router.get("/:orderId", authMiddleware, getOrderById);

// Get order status history
router.get("/:orderId/status-history", authMiddleware, getOrderStatusHistory);

// Update order status (admin only)
router.patch("/:orderId/status", authMiddleware, updateOrderStatus);

// Cancel order
router.put("/:orderId/cancel", authMiddleware, cancelOrder);

module.exports = router;
