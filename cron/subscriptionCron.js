const cron = require("node-cron");
const Subscription = require("../models/subscription");
const Order = require("../models/Order");
const moment = require("moment");

const createOrderForSubscription = async (subscription) => {
  try {
    const today = moment().format("YYYY-MM-DD");
    const dayOfWeek = moment().format("dddd");

    // Check if subscription should create an order today
    if (subscription.subscriptionType === "daily") {
      return true;
    } else if (
      subscription.subscriptionType === "weekly" &&
      subscription.selectedDays.includes(dayOfWeek)
    ) {
      return true;
    } else if (
      subscription.subscriptionType === "monthly" &&
      subscription.selectedDates.includes(today)
    ) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};

const processSubscriptions = async () => {
  try {
    console.log("Starting subscription processing at:", new Date());

    // Get all active subscriptions
    const subscriptions = await Subscription.find({ status: "active" })
      .populate("productId")
      .populate("userId");

    for (const subscription of subscriptions) {
      const shouldCreateOrder = await createOrderForSubscription(subscription);

      if (shouldCreateOrder) {
        // Create order for the subscription
        const orderData = {
          userId: subscription.userId,
          productId: subscription.productId,
          quantity: subscription.quantity,
          address: subscription.address,
          price: subscription.price,
          status: "pending",
          type: "subscription",
          subscriptionId: subscription._id,
          note: subscription.note,
        };

        const order = new Order(orderData);
        await order.save();
        console.log(`Created order for subscription ${subscription._id}`);
      }
    }

    console.log("Finished subscription processing at:", new Date());
  } catch (error) {
    console.error("Error processing subscriptions:", error);
  }
};

// Schedule the cron job to run at 10 PM every day
const startSubscriptionCron = () => {
  cron.schedule("0 22 * * *", async () => {
    await processSubscriptions();
  });

  console.log("Subscription cron job scheduled to run at 10 PM every day");
};

module.exports = {
  startSubscriptionCron,
  processSubscriptions, // Export for manual testing
};
