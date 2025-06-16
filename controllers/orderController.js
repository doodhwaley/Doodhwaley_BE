const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const OrderStatus = require("../models/OrderStatus");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, deliveryWindow, deliveryDate } =
      req.body;
    const userId = req.body.user;
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    console.log("user id", cart);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total amount and prepare order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const currentTime = new Date();

    // Create new order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      deliveryWindow,
      deliveryDate,
      paymentMethod,
      status: "order_placed",
    });

    await order.save();

    // Create initial order status
    const orderStatus = new OrderStatus({
      order: order._id,
      status: "order_placed",
      changedBy: userId,
      notes: "Order placed successfully",
      orderPlacedTime: currentTime,
    });

    await orderStatus.save();

    // Clear the cart after order creation
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      order,
      status: orderStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    console.log("req.user", req.user);
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("items.product")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order belongs to the user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// Update order status (for admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate status transition
    const validTransitions = {
      order_placed: ["confirmed"],
      confirmed: ["in_progress"],
      in_progress: ["dispatched"],
      dispatched: ["delivered"],
      delivered: [], // No further transitions allowed
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`,
      });
    }

    const currentTime = new Date();
    const statusUpdate = {
      order: order._id,
      status: status,
      changedBy: req.user._id,
      notes: notes || `Status changed to ${status}`,
    };

    // Set the appropriate timestamp based on the status
    switch (status) {
      case "confirmed":
        statusUpdate.confirmedTime = currentTime;
        break;
      case "in_progress":
        statusUpdate.inProgressTime = currentTime;
        break;
      case "dispatched":
        statusUpdate.dispatchedTime = currentTime;
        break;
      case "delivered":
        statusUpdate.deliveredTime = currentTime;
        break;
    }

    // Create new order status entry
    const orderStatus = new OrderStatus(statusUpdate);
    await orderStatus.save();

    // Update order status
    order.status = status;
    if (status === "delivered") {
      order.deliveryDate = currentTime;
    }

    await order.save();

    res.status(200).json({
      success: true,
      order,
      statusHistory: orderStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Get order status history
exports.getOrderStatusHistory = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const statusHistory = await OrderStatus.find({ order: orderId })
      .populate("changedBy", "name email")
      .sort({ createdAt: -1 });

    // Format the response to include all status timestamps
    const formattedHistory = statusHistory.map((status) => {
      const statusObj = status.toObject();
      return {
        ...statusObj,
        timestamps: {
          orderPlaced: status.orderPlacedTime,
          confirmed: status.confirmedTime,
          inProgress: status.inProgressTime,
          dispatched: status.dispatchedTime,
          delivered: status.deliveredTime,
        },
      };
    });

    res.status(200).json({
      success: true,
      statusHistory: formattedHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order status history",
      error: error.message,
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Only allow cancellation of order_placed or confirmed orders
    if (!["order_placed", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    const currentTime = new Date();

    // Create cancellation status
    const orderStatus = new OrderStatus({
      order: order._id,
      status: "cancelled",
      changedBy: req.user._id,
      notes: "Order cancelled by user",
      orderPlacedTime: order.orderPlacedTime,
      confirmedTime: order.confirmedTime,
    });

    await orderStatus.save();

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
      statusHistory: orderStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};
