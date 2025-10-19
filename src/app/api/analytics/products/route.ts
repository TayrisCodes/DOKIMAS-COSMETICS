import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import { getTopProducts, getCategoryBreakdown } from "@/lib/analytics";

/**
 * GET /api/analytics/products
 * Get product performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "5");
    const days = parseInt(searchParams.get("days") || "30");
    const sortBy = (searchParams.get("sortBy") || "revenue") as "quantity" | "revenue";

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const topProducts = await getTopProducts(limit, { startDate, endDate }, sortBy);
    const categoryBreakdown = await getCategoryBreakdown({ startDate, endDate });

    return successResponse({
      topProducts,
      categoryBreakdown,
      period: { startDate, endDate, days },
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized") || error.message?.includes("Forbidden")) {
      return errorResponse(error.message, error.message.includes("Unauthorized") ? 401 : 403);
    }
    return errorResponse(error.message, 500);
  }
}





