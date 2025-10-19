import { Worker } from "bullmq";
import Redis from "ioredis";
import { sendNewsletter } from "@/lib/cms/sendNewsletter";
import Newsletter from "@/models/Newsletter";
import connectDB from "@/lib/db/mongodb";

// Redis connection
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Email worker
export const emailWorker = new Worker(
  "email",
  async (job) => {
    console.log(`Processing email job: ${job.name}`, job.id);

    try {
      if (job.name === "newsletter-broadcast") {
        // Send newsletter to list of emails
        const { emails, subject, html } = job.data;
        const result = await sendNewsletter(emails, subject, html);
        console.log(`Newsletter sent: ${result.sent} success, ${result.failed} failed`);
        return result;
      }

      if (job.name === "blog-notification") {
        // Send new blog notification to all subscribers
        const { title, excerpt, url } = job.data;
        await connectDB();

        const subscribers = await Newsletter.find({}).select("email").lean();
        const emails = subscribers.map((s) => s.email);

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const html = `
          <div style="padding: 20px;">
            <h2 style="color: #8B5CF6;">${title}</h2>
            <p style="font-size: 16px; line-height: 1.6;">${excerpt}</p>
            <p style="margin-top: 20px;">
              <a href="${siteUrl}${url}" style="display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px;">
                Read Full Article
              </a>
            </p>
          </div>
        `;

        const result = await sendNewsletter(emails, `New Article: ${title}`, html);
        console.log(`Blog notification sent: ${result.sent} success, ${result.failed} failed`);
        return result;
      }

      throw new Error(`Unknown job type: ${job.name}`);
    } catch (error: any) {
      console.error(`Email job failed:`, error);
      throw error;
    }
  },
  {
    connection,
    concurrency: 1, // Process one job at a time to avoid overwhelming email server
  }
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await emailWorker.close();
  await connection.quit();
});

console.log("📧 Email worker started");


