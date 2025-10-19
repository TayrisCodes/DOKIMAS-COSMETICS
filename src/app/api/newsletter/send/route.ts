import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Newsletter from "@/models/Newsletter";
import CustomerActivity from "@/models/CustomerActivity";
import User from "@/models/User";
import { requireAdmin } from "@/lib/cms/validateAdmin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { addNewsletterBroadcastJob } from "@/lib/queue/emailQueue";
import { z } from "zod";

// Validation schema
const SendSchema = z.object({
  subject: z.string().min(1),
  html: z.string().min(1),
  segment: z.enum(["all", "subscribers", "top-buyers"]).optional(),
});

// POST /api/newsletter/send - Send newsletter broadcast (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const { subject, html, segment = "subscribers" } = SendSchema.parse(body);

    let emails: string[] = [];

    if (segment === "all" || segment === "subscribers") {
      const subscribers = await Newsletter.find({}).select("email").lean();
      emails = subscribers.map((s) => s.email);
    }

    if (segment === "top-buyers") {
      // Get top 100 customers by total spent
      const topBuyers = await CustomerActivity.find({})
        .sort({ totalSpent: -1 })
        .limit(100)
        .populate("userId", "email")
        .lean();

      emails = topBuyers
        .map((activity: any) => activity.userId?.email)
        .filter(Boolean);
    }

    if (emails.length === 0) {
      return errorResponse("No recipients found for the selected segment", 400);
    }

    // Enqueue newsletter broadcast job
    await addNewsletterBroadcastJob({ emails, subject, html });

    return successResponse(
      { recipientCount: emails.length },
      `Newsletter queued for ${emails.length} recipients`
    );
  } catch (error: any) {
    console.error("Newsletter send error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Validation error", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to send newsletter", 500);
  }
}


