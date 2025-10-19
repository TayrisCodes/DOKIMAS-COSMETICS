import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Newsletter from "@/models/Newsletter";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

// Validation schema
const UnsubscribeSchema = z.object({
  email: z.string().email(),
});

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = UnsubscribeSchema.parse(body);

    await Newsletter.findOneAndDelete({ email: email.toLowerCase() });
    return successResponse(null, "Successfully unsubscribed from newsletter");
  } catch (error: any) {
    console.error("Newsletter unsubscribe error:", error);
    if (error instanceof z.ZodError) {
      return errorResponse("Invalid email address", 400, error.errors);
    }
    return errorResponse(error.message || "Failed to unsubscribe", 500);
  }
}



