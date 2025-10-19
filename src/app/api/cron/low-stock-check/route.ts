import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import { sendLowStockReport } from "@/lib/email-reports";

/**
 * GET /api/cron/low-stock-check
 * Check for low stock and send alert (triggered by Vercel Cron or manually)
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
    await sendLowStockReport();

    return successResponse(
      { message: "Low stock check completed and alerts sent" },
      "Check completed"
    );
  } catch (error: any) {
    console.error("Error checking low stock:", error);
    return errorResponse(error.message || "Failed to check low stock", 500);
  }
}




