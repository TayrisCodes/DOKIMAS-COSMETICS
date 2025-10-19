import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import LoyaltyPoint from "@/models/LoyaltyPoint";

/**
 * GET /api/loyalty/history/[userId]
 * Fetch points history for user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Users can only view their own history (unless admin)
    if (user.id !== params.userId && user.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    const loyaltyPoint = await LoyaltyPoint.findOne({ userId: params.userId });

    if (!loyaltyPoint) {
      return successResponse({
        history: [],
        total: 0,
        page,
        limit,
      });
    }

    // Sort history by date descending
    const sortedHistory = loyaltyPoint.history.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHistory = sortedHistory.slice(startIndex, endIndex);

    return successResponse({
      history: paginatedHistory,
      total: sortedHistory.length,
      page,
      limit,
      totalPages: Math.ceil(sortedHistory.length / limit),
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




