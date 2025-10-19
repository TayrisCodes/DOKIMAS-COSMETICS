import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import { sendWeeklySalesReport } from "@/lib/email-reports";

/**
 * GET /api/cron/weekly-report
 * Send weekly sales report (triggered by Vercel Cron or manually)
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
    await sendWeeklySalesReport();

    return successResponse(
      { message: "Weekly sales report sent successfully" },
      "Report sent"
    );
  } catch (error: any) {
    console.error("Error sending weekly report:", error);
    return errorResponse(error.message || "Failed to send weekly report", 500);
  }
}





