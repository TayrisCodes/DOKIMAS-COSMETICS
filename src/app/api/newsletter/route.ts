import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Newsletter from "@/models/Newsletter";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

// Validation schema
const SubscribeSchema = z.object({
  email: z.string().email(),
});

// POST /api/newsletter - Subscribe to newsletter (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = SubscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      return successResponse(
        null,
        "You're already subscribed to our newsletter"
      );
    }

    await Newsletter.create({ email: email.toLowerCase() });
    return successResponse(null, "Successfully subscribed to newsletter");
  } catch (error: any) {
    console.error("Newsletter POST error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Invalid email address", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to subscribe", 500);
  }
}

// GET /api/newsletter - Get subscriber count (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const count = await Newsletter.countDocuments();
    return successResponse({ count });
  } catch (error: any) {
    console.error("Newsletter GET error:", error);
    return errorResponse(error.message || "Failed to fetch subscriber count", 500);
  }
}



