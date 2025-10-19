import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import Coupon from "@/models/Coupon";
import { generateCouponCode } from "@/lib/coupons";

/**
 * GET /api/coupons
 * List all coupons (admin/retail only)
 */
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // active, expired, all
    const sortBy = searchParams.get("sortBy") || "-createdAt";

    const query: any = {};

    if (filter === "active") {
      query.isActive = true;
      query.expiresAt = { $gt: new Date() };
    } else if (filter === "expired") {
      query.expiresAt = { $lte: new Date() };
    }

    const coupons = await Coupon.find(query)
      .sort(sortBy)
      .populate("createdBy", "name email")
      .lean();

    return successResponse({
      coupons,
      total: coupons.length,
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

/**
 * POST /api/coupons
 * Create new coupon (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["admin"]);
    await connectDB();

    const body = await request.json();
    let {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      userUsageLimit,
      expiresAt,
    } = body;

    // Validate required fields
    if (!discountType || !discountValue || !expiresAt) {
      return errorResponse(
        "discountType, discountValue, and expiresAt are required",
        400
      );
    }

    // Generate code if not provided
    if (!code) {
      code = await generateCouponCode();
    } else {
      code = code.toUpperCase();
      // Check if code already exists
      const existing = await Coupon.findOne({ code });
      if (existing) {
        return errorResponse("Coupon code already exists", 400);
      }
    }

    // Create coupon
    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || undefined,
      usageLimit: usageLimit || 0,
      usageCount: 0,
      userUsageLimit: userUsageLimit || 1,
      usedBy: [],
      expiresAt: new Date(expiresAt),
      isActive: true,
      createdBy: user.id,
    });

    return successResponse(coupon, "Coupon created successfully", 201);
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



