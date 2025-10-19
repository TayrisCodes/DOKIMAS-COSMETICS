import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import { calculatePointsEarned, awardPoints } from "@/lib/loyalty";

/**
 * POST /api/loyalty/earn
 * Award loyalty points (triggered after payment approval)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, orderTotal, orderId } = body;

    if (!userId || !orderTotal || !orderId) {
      return errorResponse("userId, orderTotal, and orderId are required", 400);
    }

    // Calculate points
    const points = await calculatePointsEarned(orderTotal);

    if (points > 0) {
      // Award points
      await awardPoints(
        userId,
        points,
        orderId,
        `Earned from order worth ${orderTotal} ETB`
      );
    }

    return successResponse({
      pointsEarned: points,
      orderTotal,
    });
  } catch (error: any) {
    console.error("Error awarding points:", error);
    return errorResponse(error.message, 500);
  }
}



