const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// All cart routes require authentication
router.use(authMiddleware);

// Get user's cart
router.get("/getCart", getCart);

// Add item to cart
router.post("/addToCart", addToCart);

// Update cart item quantity
router.put("/updateCartItem", updateCartItem);

// Remove item from cart
router.delete("/removeItem/:itemId", removeFromCart);

// Clear cart
router.delete("/clearCart", clearCart);

module.exports = router;
