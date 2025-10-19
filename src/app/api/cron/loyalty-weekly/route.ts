import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import Coupon from "@/models/Coupon";
import { getInactiveCustomers } from "@/lib/crm";
import { sendEmail } from "@/lib/email";
import { getInactivityReminderEmail } from "@/lib/emails/loyalty-emails";
import { generateCouponCode } from "@/lib/coupons";

/**
 * GET /api/cron/loyalty-weekly
 * Weekly loyalty tasks (Monday 9 AM)
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

    // Get inactive customers (no order in 30+ days)
    const inactiveCustomers = await getInactiveCustomers(30);

    // Send inactivity reminder emails
    for (const customer of inactiveCustomers) {
      try {
        // Create a comeback coupon (15% off)
        const couponCode = await generateCouponCode("COMEBACK");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

        await Coupon.create({
          code: couponCode,
          discountType: "percent",
          discountValue: 15,
          minPurchase: 0,
          usageLimit: 1, // Single use
          usageCount: 0,
          userUsageLimit: 1,
          usedBy: [],
          expiresAt,
          isActive: true,
          createdBy: customer.userId,
        });

        const emailData = getInactivityReminderEmail(
          customer.name,
          customer.daysSinceLastOrder || 30,
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
          `Error sending inactivity email to ${customer.email}:`,
          error
        );
      }
    }

    // Check for expiring coupons (expire in next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringCoupons = await Coupon.find({
      isActive: true,
      expiresAt: {
        $gte: new Date(),
        $lte: sevenDaysFromNow,
      },
    });

    return successResponse({
      inactivityEmailsSent: emailsSent,
      inactiveCustomersFound: inactiveCustomers.length,
      expiringCoupons: expiringCoupons.length,
    });
  } catch (error: any) {
    console.error("Weekly loyalty cron error:", error);
    return errorResponse(error.message, 500);
  }
}




