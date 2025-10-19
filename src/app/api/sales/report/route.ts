import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Sale from "@/models/Sale";

/**
 * GET /api/sales/report
 * Get sales report aggregated by date
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy") || "day"; // day, week, month
    const source = searchParams.get("source"); // online or retail

    // Default to last 7 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

    const matchStage: any = {
      createdAt: { $gte: start, $lte: end },
      paymentStatus: { $in: ["approved", "paid"] },
    };

    if (source) {
      matchStage.source = source;
    }

    let dateFormat: string;
    if (groupBy === "day") {
      dateFormat = "%Y-%m-%d";
    } else if (groupBy === "week") {
      dateFormat = "%Y-W%U";
    } else {
      dateFormat = "%Y-%m";
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          salesCount: { $sum: 1 },
          itemsCount: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.quantity"] },
              },
            },
          },
        },
      },
      {
        $project: {
          date: "$_id",
          revenue: 1,
          salesCount: 1,
          itemsCount: 1,
        },
      },
      { $sort: { date: 1 } },
    ];

    const results = await Sale.aggregate(pipeline);

    const totalRevenue = results.reduce((sum, r) => sum + r.revenue, 0);
    const totalSales = results.reduce((sum, r) => sum + r.salesCount, 0);

    return successResponse({
      report: results,
      summary: {
        totalRevenue,
        totalSales,
        averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        period: { start, end },
      },
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}





