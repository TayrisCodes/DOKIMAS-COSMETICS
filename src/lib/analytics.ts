import Order from "@/models/Order";
import Sale from "@/models/Sale";
import Product from "@/models/Product";

/**
 * Calculate total revenue for a date range
 */
export async function calculateRevenue(
  startDate: Date,
  endDate: Date,
  source?: "online" | "retail"
): Promise<number> {
  const query: any = {
    createdAt: { $gte: startDate, $lte: endDate },
    paymentStatus: { $in: ["approved", "paid"] },
  };

  if (source) {
    query.source = source;
  }

  const sales = await Sale.find(query).select("totalAmount");
  const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  
  return total;
}

/**
 * Get top products by sales quantity or revenue
 */
export async function getTopProducts(
  limit: number = 5,
  dateRange?: { startDate: Date; endDate: Date },
  sortBy: "quantity" | "revenue" = "revenue"
): Promise<any[]> {
  const matchStage: any = {
    paymentStatus: { $in: ["approved", "paid"] },
  };

  if (dateRange) {
    matchStage.createdAt = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    };
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.subtotal" },
        salesCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        productId: "$_id",
        name: "$product.name",
        category: "$product.category",
        totalQuantity: 1,
        totalRevenue: 1,
        salesCount: 1,
      },
    },
    { $sort: sortBy === "quantity" ? { totalQuantity: -1 } : { totalRevenue: -1 } },
    { $limit: limit },
  ];

  const results = await Sale.aggregate(pipeline);
  return results;
}

/**
 * Calculate sales growth percentage
 */
export async function getSalesGrowth(period: "day" | "week" | "month" = "week"): Promise<number> {
  const now = new Date();
  let currentStart: Date, previousStart: Date, previousEnd: Date;

  if (period === "day") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 1);
    previousEnd = currentStart;
  } else if (period === "week") {
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 7);
    previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 7);
    previousEnd = currentStart;
  } else {
    // month
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    previousEnd = currentStart;
  }

  const currentRevenue = await calculateRevenue(currentStart, now);
  const previousRevenue = await calculateRevenue(previousStart, previousEnd);

  if (previousRevenue === 0) return 100;

  const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  return Math.round(growth * 10) / 10; // Round to 1 decimal
}

/**
 * Get sales breakdown by category
 */
export async function getCategoryBreakdown(
  dateRange?: { startDate: Date; endDate: Date }
): Promise<any[]> {
  const matchStage: any = {
    paymentStatus: { $in: ["approved", "paid"] },
  };

  if (dateRange) {
    matchStage.createdAt = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    };
  }

  const pipeline = [
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product.category",
        totalRevenue: { $sum: "$items.subtotal" },
        totalQuantity: { $sum: "$items.quantity" },
        salesCount: { $sum: 1 },
      },
    },
    {
      $project: {
        category: "$_id",
        totalRevenue: 1,
        totalQuantity: 1,
        salesCount: 1,
      },
    },
    { $sort: { totalRevenue: -1 } },
  ];

  const results = await Sale.aggregate(pipeline);
  return results;
}

/**
 * Get revenue data grouped by day/week/month
 */
export async function getRevenueByPeriod(
  days: number = 7,
  groupBy: "day" | "week" | "month" = "day"
): Promise<any[]> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  let dateFormat: string;
  if (groupBy === "day") {
    dateFormat = "%Y-%m-%d";
  } else if (groupBy === "week") {
    dateFormat = "%Y-W%U";
  } else {
    dateFormat = "%Y-%m";
  }

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: { $in: ["approved", "paid"] },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        salesCount: { $sum: 1 },
      },
    },
    {
      $project: {
        date: "$_id",
        revenue: 1,
        salesCount: 1,
      },
    },
    { $sort: { date: 1 } },
  ];

  const results = await Sale.aggregate(pipeline);
  return results;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(source?: "online" | "retail"): Promise<any> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const matchStage: any = {
    paymentStatus: { $in: ["approved", "paid"] },
  };

  if (source) {
    matchStage.source = source;
  }

  // Total revenue (all time)
  const allTimeSales = await Sale.find(matchStage).select("totalAmount");
  const totalRevenue = allTimeSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Today's revenue
  const todaySales = await Sale.find({
    ...matchStage,
    createdAt: { $gte: today },
  }).select("totalAmount");
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Total orders
  const totalOrders = await Order.countDocuments({
    paymentStatus: { $in: ["approved", "paid"] },
  });

  // Today's orders
  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: today },
    paymentStatus: { $in: ["approved", "paid"] },
  });

  // Low stock count
  const lowStockCount = await Product.countDocuments({
    isActive: true,
    $expr: { $lte: ["$stock", "$restockThreshold"] },
  });

  // Total products
  const totalProducts = await Product.countDocuments({ isActive: true });

  return {
    totalRevenue,
    todayRevenue,
    totalOrders,
    todayOrders,
    lowStockCount,
    totalProducts,
  };
}





