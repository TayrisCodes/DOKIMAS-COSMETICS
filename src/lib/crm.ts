import CustomerActivity from "@/models/CustomerActivity";
import User from "@/models/User";
import LoyaltyPoint from "@/models/LoyaltyPoint";

/**
 * Update customer activity
 */
export async function updateCustomerActivity(
  userId: string,
  action: "login" | "order" | "email",
  data?: any
): Promise<void> {
  let activity = await CustomerActivity.findOne({ userId });

  if (!activity) {
    activity = await CustomerActivity.create({
      userId,
      loginCount: 0,
      totalOrders: 0,
      totalSpent: 0,
      emailEngagement: 0,
      activityStatus: "new",
    });
  }

  const now = new Date();

  switch (action) {
    case "login":
      activity.lastLogin = now;
      activity.loginCount += 1;
      break;

    case "order":
      activity.totalOrders += 1;
      activity.totalSpent += data.orderTotal || 0;
      activity.lastOrderDate = now;
      activity.averageOrderValue = activity.totalSpent / activity.totalOrders;
      break;

    case "email":
      activity.emailEngagement += 1;
      activity.lastEmailSent = now;
      break;
  }

  // Update activity status
  activity.activityStatus = determineActivityStatus(activity);

  await activity.save();
}

/**
 * Determine customer activity status
 */
function determineActivityStatus(
  activity: any
): "active" | "inactive" | "new" {
  const daysSinceLastOrder = activity.lastOrderDate
    ? Math.floor((Date.now() - activity.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (activity.totalOrders === 0) {
    return "new";
  }

  if (daysSinceLastOrder === null || daysSinceLastOrder > 60) {
    return "inactive";
  }

  return "active";
}

/**
 * Get customer segment
 */
export async function getCustomerSegment(userId: string): Promise<string> {
  const activity = await CustomerActivity.findOne({ userId });
  return activity?.activityStatus || "new";
}

/**
 * Get top customers
 */
export async function getTopCustomers(
  limit: number = 10,
  dateRange?: { start: Date; end: Date }
): Promise<any[]> {
  const query: any = {};

  if (dateRange) {
    query.lastOrderDate = {
      $gte: dateRange.start,
      $lte: dateRange.end,
    };
  }

  const activities = await CustomerActivity.find(query)
    .sort({ totalSpent: -1 })
    .limit(limit)
    .populate("userId", "name email")
    .lean();

  // Fetch loyalty points for each customer
  const enriched = await Promise.all(
    activities.map(async (activity: any) => {
      const loyaltyPoint = await LoyaltyPoint.findOne({ userId: activity.userId._id });
      return {
        userId: activity.userId._id,
        name: activity.userId.name,
        email: activity.userId.email,
        totalOrders: activity.totalOrders,
        totalSpent: activity.totalSpent,
        averageOrderValue: activity.averageOrderValue,
        points: loyaltyPoint?.points || 0,
        lastOrderDate: activity.lastOrderDate,
        activityStatus: activity.activityStatus,
      };
    })
  );

  return enriched;
}

/**
 * Get inactive customers
 */
export async function getInactiveCustomers(days: number = 30): Promise<any[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const activities = await CustomerActivity.find({
    $or: [
      { lastOrderDate: { $lt: cutoffDate } },
      { totalOrders: { $gt: 0 }, lastOrderDate: { $exists: false } },
    ],
  })
    .populate("userId", "name email")
    .lean();

  return activities.map((activity: any) => ({
    userId: activity.userId._id,
    name: activity.userId.name,
    email: activity.userId.email,
    totalOrders: activity.totalOrders,
    lastOrderDate: activity.lastOrderDate,
    daysSinceLastOrder: activity.lastOrderDate
      ? Math.floor((Date.now() - activity.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      : null,
  }));
}

/**
 * Get new customers (registered but never ordered)
 */
export async function getNewCustomers(limit: number = 50): Promise<any[]> {
  const activities = await CustomerActivity.find({
    totalOrders: 0,
    activityStatus: "new",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name email createdAt")
    .lean();

  return activities.map((activity: any) => ({
    userId: activity.userId._id,
    name: activity.userId.name,
    email: activity.userId.email,
    registeredAt: activity.userId.createdAt,
    loginCount: activity.loginCount,
  }));
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(): Promise<{
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomers: number;
  averageOrderValue: number;
}> {
  const totalCustomers = await CustomerActivity.countDocuments();
  const activeCustomers = await CustomerActivity.countDocuments({
    activityStatus: "active",
  });
  const inactiveCustomers = await CustomerActivity.countDocuments({
    activityStatus: "inactive",
  });
  const newCustomers = await CustomerActivity.countDocuments({
    activityStatus: "new",
  });

  const avgResult = await CustomerActivity.aggregate([
    { $match: { totalOrders: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        avgOrderValue: { $avg: "$averageOrderValue" },
      },
    },
  ]);

  const averageOrderValue = avgResult[0]?.avgOrderValue || 0;

  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    newCustomers,
    averageOrderValue,
  };
}

/**
 * Get customers by activity status
 */
export async function getCustomersByStatus(
  status: "active" | "inactive" | "new",
  limit: number = 50,
  skip: number = 0
): Promise<{ customers: any[]; total: number }> {
  const total = await CustomerActivity.countDocuments({ activityStatus: status });

  const activities = await CustomerActivity.find({ activityStatus: status })
    .sort({ totalSpent: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name email")
    .lean();

  const customers = await Promise.all(
    activities.map(async (activity: any) => {
      const loyaltyPoint = await LoyaltyPoint.findOne({ userId: activity.userId._id });
      return {
        userId: activity.userId._id,
        name: activity.userId.name,
        email: activity.userId.email,
        totalOrders: activity.totalOrders,
        totalSpent: activity.totalSpent,
        points: loyaltyPoint?.points || 0,
        lastOrderDate: activity.lastOrderDate,
        lastLogin: activity.lastLogin,
      };
    })
  );

  return { customers, total };
}



