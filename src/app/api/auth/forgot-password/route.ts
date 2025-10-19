import { NextRequest } from "next/server";
import crypto from "crypto";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { sendEmail, getPasswordResetTemplate } from "@/lib/email";

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse("Email is required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format", 400);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select("+resetToken +resetTokenExpiry");

    // Always return success message for security (don't reveal if email exists)
    const successMessage = "If an account exists with this email, you will receive a password reset link shortly.";

    if (!user) {
      return successResponse({ message: successMessage }, successMessage);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await sendEmail({
        to: email,
        subject: "Password Reset Request - Dokimas Cosmetics",
        html: getPasswordResetTemplate(resetLink),
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return errorResponse("Failed to send password reset email", 500);
    }

    return successResponse(
      { message: successMessage },
      successMessage
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return errorResponse(error.message || "Failed to process password reset request", 500);
  }
}








