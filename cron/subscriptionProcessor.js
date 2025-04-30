const cron = require("node-cron");
const subscriptionController = require("../controllers/subscriptionController");

// Schedule the subscription processor to run every day at 10 PM
cron.schedule("0 22 * * *", async () => {
  console.log("Running subscription processor at", new Date().toISOString());
  await subscriptionController.processSubscriptions();
});
