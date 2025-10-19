import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import { getCustomerStats, getTopCustomers } from "@/lib/crm";
import LoyaltyPoint from "@/models/LoyaltyPoint";

/**
 * GET /api/crm/stats
 * Get CRM dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    // Get customer stats
    const stats = await getCustomerStats();

    // Get top customers
    const topCustomers = await getTopCustomers(5);

    // Get total points issued
    const pointsResult = await LoyaltyPoint.aggregate([
      {
        $group: {
          _id: null,
          totalPointsIssued: { $sum: "$totalEarned" },
          totalPointsRedeemed: { $sum: "$totalRedeemed" },
          activePoints: { $sum: "$points" },
        },
      },
    ]);

    const pointsData = pointsResult[0] || {
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      activePoints: 0,
    };

    // Calculate active this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return successResponse({
      totalCustomers: stats.totalCustomers,
      activeCustomers: stats.activeCustomers,
      inactiveCustomers: stats.inactiveCustomers,
      newCustomers: stats.newCustomers,
      averageOrderValue: stats.averageOrderValue,
      topCustomers,
      loyaltyPoints: {
        totalIssued: pointsData.totalPointsIssued,
        totalRedeemed: pointsData.totalPointsRedeemed,
        active: pointsData.activePoints,
      },
    });
  } catch (error: any) {
    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("Forbidden")
    ) {
      return errorResponse(
        error.message,
        error.message.includes("Unauthorized") ? 401 : 403
      );
    }
    return errorResponse(error.message, 500);
  }
}



