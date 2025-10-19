import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return errorResponse("Token and password are required", 400);
    }

    // Validate password strength
    if (password.length < 8) {
      return errorResponse("Password must be at least 8 characters long", 400);
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }, // Token not expired
    }).select("+resetToken +resetTokenExpiry +password");

    if (!user) {
      return errorResponse("Invalid or expired reset token", 400);
    }

    // Hash new password
    const hashedPassword = await hash(password, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return successResponse(
      {
        message: "Password reset successfully! You can now login with your new password.",
      },
      "Password reset successfully"
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return errorResponse(error.message || "Failed to reset password", 500);
  }
}







