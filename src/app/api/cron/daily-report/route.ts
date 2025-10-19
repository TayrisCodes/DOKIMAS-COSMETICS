import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import { sendDailySalesReport } from "@/lib/email-reports";

/**
 * GET /api/cron/daily-report
 * Send daily sales report (triggered by Vercel Cron or manually)
 * 
 * Secure this endpoint in production with a secret token
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
    await sendDailySalesReport();

    return successResponse(
      { message: "Daily sales report sent successfully" },
      "Report sent"
    );
  } catch (error: any) {
    console.error("Error sending daily report:", error);
    return errorResponse(error.message || "Failed to send daily report", 500);
  }
}





