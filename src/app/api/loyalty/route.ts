import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import LoyaltyPoint from "@/models/LoyaltyPoint";
import {
  calculatePointsDiscount,
  validatePointsRedemption,
} from "@/lib/loyalty";

/**
 * GET /api/loyalty
 * Fetch user's current loyalty points balance
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    let loyaltyPoint = await LoyaltyPoint.findOne({ userId: user.id });

    if (!loyaltyPoint) {
      // Create if doesn't exist
      loyaltyPoint = await LoyaltyPoint.create({
        userId: user.id,
        points: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        history: [],
      });
    }

    // Get recent history (last 10 transactions)
    const recentHistory = loyaltyPoint.history
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return successResponse({
      points: loyaltyPoint.points,
      totalEarned: loyaltyPoint.totalEarned,
      totalRedeemed: loyaltyPoint.totalRedeemed,
      lastEarned: loyaltyPoint.lastEarned,
      recentHistory,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/loyalty
 * Calculate discount from points (preview/validate redemption)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    await connectDB();

    const body = await request.json();
    const { points, orderTotal } = body;

    if (!points || !orderTotal) {
      return errorResponse("Points and orderTotal are required", 400);
    }

    // Get user's points
    const loyaltyPoint = await LoyaltyPoint.findOne({ userId: user.id });
    const userPoints = loyaltyPoint?.points || 0;

    // Validate redemption
    const validation = await validatePointsRedemption(
      points,
      orderTotal,
      userPoints
    );

    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid points redemption", 400);
    }

    // Calculate discount
    const discount = await calculatePointsDiscount(points);

    return successResponse({
      valid: true,
      points,
      discount,
      remainingPoints: userPoints - points,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message, 500);
  }
}



