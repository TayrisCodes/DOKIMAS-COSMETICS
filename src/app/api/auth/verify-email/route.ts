import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

/**
 * POST /api/auth/verify-email
 * Verify user email with token
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return errorResponse("Verification token is required", 400);
    }

    // Find user with this verification token
    const user = await User.findOne({ verificationToken: token }).select("+verificationToken");

    if (!user) {
      return errorResponse("Invalid or expired verification token", 400);
    }

    // Check if already verified
    if (user.emailVerified) {
      return errorResponse("Email is already verified", 400);
    }

    // Update user
    user.emailVerified = true;
    user.verificationToken = undefined; // Remove token after verification
    await user.save();

    return successResponse(
      {
        message: "Email verified successfully! You can now login.",
        email: user.email,
      },
      "Email verified successfully"
    );
  } catch (error: any) {
    console.error("Email verification error:", error);
    return errorResponse(error.message || "Email verification failed", 500);
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * Alternative GET endpoint for verification
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return errorResponse("Verification token is required", 400);
    }

    await connectDB();

    // Find user with this verification token
    const user = await User.findOne({ verificationToken: token }).select("+verificationToken");

    if (!user) {
      return errorResponse("Invalid or expired verification token", 400);
    }

    // Check if already verified
    if (user.emailVerified) {
      return errorResponse("Email is already verified", 400);
    }

    // Update user
    user.emailVerified = true;
    user.verificationToken = undefined; // Remove token after verification
    await user.save();

    return successResponse(
      {
        message: "Email verified successfully! You can now login.",
        email: user.email,
      },
      "Email verified successfully"
    );
  } catch (error: any) {
    console.error("Email verification error:", error);
    return errorResponse(error.message || "Email verification failed", 500);
  }
}







