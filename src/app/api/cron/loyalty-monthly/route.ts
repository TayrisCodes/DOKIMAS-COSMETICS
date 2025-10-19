import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import Coupon from "@/models/Coupon";
import { getTopCustomers } from "@/lib/crm";
import { sendEmail } from "@/lib/email";
import { getTopBuyerAppreciationEmail } from "@/lib/emails/loyalty-emails";
import { generateCouponCode } from "@/lib/coupons";

/**
 * GET /api/cron/loyalty-monthly
 * Monthly loyalty tasks (1st of month 9 AM)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }

    await connectDB();

    let emailsSent = 0;

    // Get top 10 customers from last month
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    lastMonthStart.setHours(0, 0, 0, 0);

    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    const topCustomers = await getTopCustomers(10, {
      start: lastMonthStart,
      end: lastMonthEnd,
    });

    // Send appreciation emails to top customers
    for (const customer of topCustomers) {
      try {
        // Create exclusive VIP coupon (20% off)
        const couponCode = await generateCouponCode("VIP");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // Valid for 30 days

        await Coupon.create({
          code: couponCode,
          discountType: "percent",
          discountValue: 20,
          minPurchase: 0,
          usageLimit: 1,
          usageCount: 0,
          userUsageLimit: 1,
          usedBy: [],
          expiresAt,
          isActive: true,
          createdBy: customer.userId,
        });

        const emailData = getTopBuyerAppreciationEmail(
          customer.name,
          customer.totalSpent,
          customer.totalOrders,
          couponCode
        );

        await sendEmail({
          to: customer.email,
          subject: emailData.subject,
          html: emailData.html,
        });

        emailsSent++;
      } catch (error) {
        console.error(
          `Error sending appreciation email to ${customer.email}:`,
          error
        );
      }
    }

    // Cleanup: Deactivate expired coupons
    const expiredCoupons = await Coupon.updateMany(
      {
        isActive: true,
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { isActive: false },
      }
    );

    return successResponse({
      appreciationEmailsSent: emailsSent,
      topCustomersRewarded: topCustomers.length,
      expiredCouponsDeactivated: expiredCoupons.modifiedCount,
    });
  } catch (error: any) {
    console.error("Monthly loyalty cron error:", error);
    return errorResponse(error.message, 500);
  }
}



