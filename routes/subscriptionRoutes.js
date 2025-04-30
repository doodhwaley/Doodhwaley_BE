const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create a new subscription
router.post(
  "/create-subscription",
  authMiddleware,
  subscriptionController.createSubscription
);

// Get all subscriptions for a user
router.get(
  "/user/get-all-subscriptions/:userId",
  authMiddleware,
  subscriptionController.getUserSubscriptions
);

// Update subscription status
router.patch(
  "/:subscriptionId/status",
  authMiddleware,
  subscriptionController.updateSubscriptionStatus
);

module.exports = router;
