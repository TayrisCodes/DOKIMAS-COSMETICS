import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import LoyaltyConfig from "@/models/LoyaltyConfig";
import { getLoyaltyConfig } from "@/lib/loyalty";

/**
 * GET /api/loyalty/config
 * Fetch current loyalty configuration
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const config = await getLoyaltyConfig();
    return successResponse(config);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

/**
 * PATCH /api/loyalty/config
 * Update loyalty configuration (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    await connectDB();

    const body = await request.json();
    const {
      pointsPerAmount,
      redeemRate,
      minRedeemPoints,
      maxRedeemPercent,
      pointsExpireDays,
      welcomePoints,
    } = body;

    // Find existing config or create new
    let config = await LoyaltyConfig.findOne({ isActive: true });

    if (!config) {
      config = new LoyaltyConfig();
    }

    // Update fields if provided
    if (pointsPerAmount !== undefined) config.pointsPerAmount = pointsPerAmount;
    if (redeemRate !== undefined) config.redeemRate = redeemRate;
    if (minRedeemPoints !== undefined) config.minRedeemPoints = minRedeemPoints;
    if (maxRedeemPercent !== undefined)
      config.maxRedeemPercent = maxRedeemPercent;
    if (pointsExpireDays !== undefined)
      config.pointsExpireDays = pointsExpireDays;
    if (welcomePoints !== undefined) config.welcomePoints = welcomePoints;

    await config.save();

    return successResponse(config, "Loyalty configuration updated");
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



