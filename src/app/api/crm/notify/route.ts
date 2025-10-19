import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import connectDB from "@/lib/db/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import { updateCustomerActivity } from "@/lib/crm";

/**
 * POST /api/crm/notify
 * Send promotional email to customers
 */
export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin", "retail_manager"]);
    await connectDB();

    const body = await request.json();
    const { customerIds, emailType, customMessage, subject } = body;

    if (!customerIds || !emailType) {
      return errorResponse("customerIds and emailType are required", 400);
    }

    // Fetch customers
    const customers = await User.find({
      _id: { $in: customerIds },
    }).select("name email");

    if (customers.length === 0) {
      return errorResponse("No customers found", 404);
    }

    // Send emails
    let sent = 0;
    const errors: string[] = [];

    for (const customer of customers) {
      try {
        const emailSubject =
          subject || getEmailSubject(emailType, customer.name);
        const emailHTML = getEmailHTML(
          emailType,
          customer.name,
          customMessage
        );

        await sendEmail({
          to: customer.email,
          subject: emailSubject,
          html: emailHTML,
        });

        // Update email engagement
        await updateCustomerActivity(customer._id.toString(), "email");
        sent++;
      } catch (error: any) {
        console.error(`Error sending email to ${customer.email}:`, error);
        errors.push(`${customer.email}: ${error.message}`);
      }
    }

    return successResponse({
      sent,
      total: customers.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    if (
      error.message?.includes("Unauthorized") ||
      error.message?.includes("Forbidden")
    ) {
      return errorResponse(
        error.message,
        error.message.includes("Unauthorized") ? 401 : 403
      );
    }
    return errorResponse(error.message, 500);
  }
}

function getEmailSubject(emailType: string, customerName: string): string {
  switch (emailType) {
    case "promo":
      return "Special Promotion Just for You!";
    case "reward":
      return "Your Loyalty Rewards are Waiting!";
    case "inactivity":
      return `We miss you, ${customerName}!`;
    case "appreciation":
      return "Thank You for Being a Valued Customer!";
    default:
      return "Message from Dokimas Cosmetics";
  }
}

function getEmailHTML(
  emailType: string,
  customerName: string,
  customMessage?: string
): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px 20px; background: #f9fafb; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Dokimas Cosmetics</h1>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            ${customMessage ? `<p>${customMessage}</p>` : getDefaultMessage(emailType)}
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="button">Shop Now</a>
            </p>
            <p>Best regards,<br>Dokimas Cosmetics Team</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return baseTemplate;
}

function getDefaultMessage(emailType: string): string {
  switch (emailType) {
    case "promo":
      return "<p>We have exciting new products and special offers just for you! Check out our latest collection and enjoy exclusive discounts.</p>";
    case "reward":
      return "<p>You have loyalty points waiting to be redeemed! Use them on your next purchase and save on your favorite products.</p>";
    case "inactivity":
      return "<p>It's been a while since we last saw you. We'd love to have you back! Here's a special offer just for you.</p>";
    case "appreciation":
      return "<p>Thank you for being such a loyal customer! We truly appreciate your continued support and trust in our products.</p>";
    default:
      return "<p>Thank you for being a valued customer!</p>";
  }
}



