import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import {
  validateCoupon,
  calculateCouponDiscount,
  applyCoupon,
} from "@/lib/coupons";

/**
 * POST /api/coupons/[code]/apply
 * Apply coupon and increment usage (during order creation)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await requireAuth();
    await connectDB();

    const body = await request.json();
    const { orderTotal, orderId } = body;

    if (!orderTotal) {
      return errorResponse("orderTotal is required", 400);
    }

    // Validate coupon
    const validation = await validateCoupon(params.code, user.id, orderTotal);

    if (!validation.valid) {
      return errorResponse(validation.error || "Invalid coupon", 400);
    }

    // Calculate discount
    const discount = calculateCouponDiscount(validation.coupon, orderTotal);

    // Apply coupon (increment usage)
    if (orderId) {
      await applyCoupon(params.code, user.id, orderId);
    }

    return successResponse({
      code: validation.coupon.code,
      discount,
      discountType: validation.coupon.discountType,
      discountValue: validation.coupon.discountValue,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return errorResponse(error.message, 401);
    }
    return errorResponse(error.message, 500);
  }
}




