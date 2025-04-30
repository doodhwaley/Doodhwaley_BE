const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} = require("../controllers/orderController.js");

// Create a new order
router.post("/create-order", authMiddleware, createOrder);

// Get all orders for the logged-in user
router.get("/my-orders", authMiddleware, getUserOrders);

// Get specific order by ID
router.get("/:orderId", authMiddleware, getOrderById);

// Update order status (admin only)
router.patch("/:orderId/status", authMiddleware, updateOrderStatus);

// Cancel order
router.put("/:orderId/cancel", authMiddleware, cancelOrder);

module.exports = router;
