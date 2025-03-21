const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get cart for a user
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name image price discount brand size",
    });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, size } = req.body;

    if (!productId || !quantity || !size) {
      return res.status(400).json({
        success: false,
        message: "Product ID, quantity and size are required",
      });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Calculate price with discount
    const priceAfterDiscount =
      product.price - (product.price * (product.discount || 0)) / 100;

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].price = priceAfterDiscount;
    } else {
      // Product does not exist in cart, add new item
      cart.items.push({
        product: productId,
        quantity,
        size,
        price: priceAfterDiscount,
      });
    }

    // Recalculate cart totals
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await cart.save();

    // Fetch the updated cart with populated product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name image price discount brand size",
    });

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to cart",
      error: error.message,
    });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    if (!itemId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Item ID and quantity are required",
      });
    }

    // Find cart for user
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (quantity > 0) {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    } else {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    }

    // Recalculate cart totals
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await cart.save();

    // Fetch the updated cart with populated product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name image price discount brand size",
    });

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
      error: error.message,
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    // Find cart for user
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find and remove item from cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Recalculate cart totals
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    await cart.save();

    // Fetch the updated cart with populated product details
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name image price discount brand size",
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find cart for user
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear all items
    cart.items = [];
    cart.totalAmount = 0;
    cart.totalItems = 0;

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
