import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import { getRevenueByPeriod } from "@/lib/analytics";

/**
 * GET /api/analytics/revenue
 * Get revenue data for charts
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");
    const groupBy = (searchParams.get("groupBy") || "day") as "day" | "week" | "month";

    const revenueData = await getRevenueByPeriod(days, groupBy);

    return successResponse({
      data: revenueData,
      period: {
        days,
        groupBy,
      },
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}





