const calculateDeliveriesFromSubscription = (
  startDate,
  subscriptionType,
  selectedDays = [],
  selectedDates = []
) => {
  const year = new Date(startDate)?.getFullYear();
  const month = new Date(startDate)?.getMonth();
  const lastDate = new Date(year, month + 1, 0); // last day of month

  if (subscriptionType === "daily") {
    // Daily: every day from startDate to month end
    return lastDate.getDate() - new Date(startDate).getDate() + 1;
  }

  if (subscriptionType === "weekly") {
    // Weekly: count how many days between startDate and month end match selectedDays (0-6)
    let count = 0;
    for (
      let d = new Date(startDate);
      d <= lastDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (selectedDays.includes(d.getDay())) {
        count++;
      }
    }
    return count;
  }

  if (subscriptionType === "monthly") {
    // Monthly: count how many selectedDates fall between startDate and month end
    return selectedDates.reduce((acc, date) => {
      if (date >= startDate.getDate() && date <= lastDate.getDate()) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }

  // Default fallback
  return 0;
};

export { calculateDeliveriesFromSubscription };
