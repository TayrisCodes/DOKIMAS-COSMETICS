import { sendEmail } from "@/lib/email";

/**
 * Send newsletter to multiple recipients in batches
 * @param emails - Array of recipient email addresses
 * @param subject - Email subject line
 * @param html - HTML content of the email
 * @param batchSize - Number of emails to send per batch (default: 50)
 */
export async function sendNewsletter(
  emails: string[],
  subject: string,
  html: string,
  batchSize: number = 50
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Add unsubscribe link to HTML
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const htmlWithUnsubscribe = `
    ${html}
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
      <p>You're receiving this because you subscribed to Dokimas Cosmetics newsletter.</p>
      <p><a href="${siteUrl}/unsubscribe" style="color: #8B5CF6; text-decoration: underline;">Unsubscribe</a></p>
    </div>
  `;

  // Process emails in batches
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    // Send emails concurrently within each batch
    const results = await Promise.allSettled(
      batch.map((email) =>
        sendEmail({
          to: email,
          subject,
          html: htmlWithUnsubscribe,
        })
      )
    );

    // Count successes and failures
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed++;
        console.error("Newsletter send failed:", result.reason);
      }
    });

    // Add delay between batches to avoid rate limiting (1 second)
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { sent, failed };
}

/**
 * Get newsletter email template
 */
export function getNewsletterTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Dokimas Cosmetics</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Dokimas Cosmetics. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}


