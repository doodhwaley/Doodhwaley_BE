const Subscription = require("../models/subscription");
const Order = require("../models/Order");

// Create a new subscription
exports.createSubscription = async (req, res) => {
  try {
    const {
      userId,
      productId,
      startDate,
      subscriptionType,
      selectedDays,
      selectedDates,
      address,
      deliveryWindow,
      additionalNotes,
      productDetails,
    } = req.body;
    // Validate subscription type and corresponding fields

    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    console.log("RIZWAN test 1 req.body", req.body);
    const numberOfDeliveries = calculateDeliveriesFromSubscription(
      startDate,
      subscriptionType,
      selectedDays,
      selectedDates
    );

    if (
      subscriptionType === "weekly" &&
      (!selectedDays || selectedDays.length === 0)
    ) {
      return res.status(400).json({
        message: "Selected days are required for weekly subscription",
      });
    }

    if (
      subscriptionType === "monthly" &&
      (!selectedDates || selectedDates.length === 0)
    ) {
      return res.status(400).json({
        message: "Selected dates are required for monthly subscription",
      });
    }

    const subscription = new Subscription({
      userId,
      productId,
      startDate,
      endDate: lastDay,
      subscriptionType,
      selectedDays,
      selectedDates,
      address,
      deliveryWindow,
      numberOfDeliveries,
      additionalNotes,
      productDetails,
    });

    await subscription.save();
    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all subscriptions for a user
exports.getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const subscriptions = await Subscription.find({ userId }).populate(
      "productId"
    );
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update subscription status
exports.updateSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { status } = req.body;

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { status },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Process subscriptions and create orders
exports.processSubscriptions = async () => {
  try {
    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const currentDateOfMonth = currentDate.getDate();

    // Find all active subscriptions
    const subscriptions = await Subscription.find({ status: "active" });

    for (const subscription of subscriptions) {
      let shouldCreateOrder = false;

      // Check if subscription should be processed today
      switch (subscription.subscriptionType) {
        case "daily":
          shouldCreateOrder = true;
          break;
        case "weekly":
          shouldCreateOrder = subscription.selectedDays.includes(currentDay);
          break;
        case "monthly":
          shouldCreateOrder =
            subscription.selectedDates.includes(currentDateOfMonth);
          break;
      }

      if (shouldCreateOrder) {
        // Create new order
        const order = new Order({
          userId: subscription.userId,
          productId: subscription.productId,
          address: subscription.address,
          productDetails: subscription.productDetails,
          additionalNotes: subscription.additionalNotes,
          status: "pending",
          deliveryDate: currentDate,
        });

        await order.save();

        // Update subscription's last order date
        subscription.lastOrderDate = currentDate;
        await subscription.save();
      }
    }
  } catch (error) {
    console.error("Error processing subscriptions:", error);
  }
};
