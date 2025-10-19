import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import crypto from "crypto";
import { successResponse, errorResponse } from "@/lib/api-response";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { sendEmail, getEmailVerificationTemplate } from "@/lib/email";
import { initializeLoyaltyAccount } from "@/lib/loyalty";
import { getWelcomeEmail } from "@/lib/emails/loyalty-emails";

/**
 * POST /api/auth/register
 * Register new user with email verification
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, phone, password } = body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return errorResponse("All fields are required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format", 400);
    }

    // Validate password strength
    if (password.length < 8) {
      return errorResponse("Password must be at least 8 characters long", 400);
    }

    // Validate phone number format (basic validation)
    if (phone.length < 10) {
      return errorResponse("Invalid phone number", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: "customer", // Default role
      emailVerified: false,
      verificationToken,
      provider: "credentials",
    });

    // Initialize loyalty account with welcome points
    let welcomePoints = 0;
    try {
      await initializeLoyaltyAccount(user._id.toString());
      // Get welcome points from config (will be fetched in initializeLoyaltyAccount)
      welcomePoints = 100; // Default, will be from config
    } catch (loyaltyError) {
      console.error("Failed to initialize loyalty account:", loyaltyError);
      // Don't fail registration if loyalty init fails
    }

    // Generate verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/verify?token=${verificationToken}`;

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: "Verify your email - Dokimas Cosmetics",
        html: getEmailVerificationTemplate(name, verificationLink),
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    // Send welcome email with loyalty points info
    if (welcomePoints > 0) {
      try {
        const welcomeEmailData = getWelcomeEmail(name, welcomePoints);
        await sendEmail({
          to: email,
          subject: welcomeEmailData.subject,
          html: welcomeEmailData.html,
        });
      } catch (welcomeEmailError) {
        console.error("Failed to send welcome email:", welcomeEmailError);
      }
    }

    return successResponse(
      {
        message: "Registration successful! Please check your email to verify your account.",
        email: user.email,
      },
      "Registration successful",
      201
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return errorResponse(error.message || "Registration failed", 500);
  }
}





