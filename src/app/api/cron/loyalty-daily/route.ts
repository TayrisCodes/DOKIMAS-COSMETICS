import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import Order from "@/models/Order";
import LoyaltyPoint from "@/models/LoyaltyPoint";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import { getPointsEarnedEmail } from "@/lib/emails/loyalty-emails";

/**
 * GET /api/cron/loyalty-daily
 * Daily loyalty tasks (9 AM daily)
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

    // Get yesterday's date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find orders approved yesterday
    const approvedOrders = await Order.find({
      paymentStatus: "approved",
      updatedAt: { $gte: yesterday, $lt: today },
    }).populate("userId", "name email");

    let emailsSent = 0;

    // Send points earned emails
    for (const order of approvedOrders) {
      try {
        const user = order.userId as any;
        if (!user || !user.email) continue;

        // Get user's loyalty points
        const loyaltyPoint = await LoyaltyPoint.findOne({ userId: user._id });
        if (!loyaltyPoint) continue;

        // Find points earned for this order
        const pointsHistory = loyaltyPoint.history.find(
          (h: any) =>
            h.orderId?.toString() === order._id.toString() &&
            h.action === "earn"
        );

        if (pointsHistory) {
          const emailData = getPointsEarnedEmail(
            user.name,
            pointsHistory.points,
            order.totalAmount,
            loyaltyPoint.points
          );

          await sendEmail({
            to: user.email,
            subject: emailData.subject,
            html: emailData.html,
          });

          emailsSent++;
        }
      } catch (error) {
        console.error(`Error sending email for order ${order._id}:`, error);
      }
    }

    return successResponse({
      emailsSent,
      ordersProcessed: approvedOrders.length,
      date: yesterday.toISOString(),
    });
  } catch (error: any) {
    console.error("Daily loyalty cron error:", error);
    return errorResponse(error.message, 500);
  }
}



