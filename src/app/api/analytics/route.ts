import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import { getDashboardStats, getSalesGrowth } from "@/lib/analytics";

/**
 * GET /api/analytics
 * Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") as "online" | "retail" | undefined;

    const stats = await getDashboardStats(source);
    const weeklyGrowth = await getSalesGrowth("week");
    const monthlyGrowth = await getSalesGrowth("month");

    return successResponse({
      ...stats,
      growth: {
        weekly: weeklyGrowth,
        monthly: monthlyGrowth,
      },
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}






