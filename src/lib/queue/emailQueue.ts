import { Queue } from "bullmq";
import Redis from "ioredis";

// Redis connection
const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

// Email queue for newsletter and bulk email operations
export const emailQueue = new Queue("email", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

/**
 * Add newsletter broadcast job
 */
export async function addNewsletterBroadcastJob(data: {
  emails: string[];
  subject: string;
  html: string;
}) {
  return await emailQueue.add("newsletter-broadcast", data);
}

/**
 * Add blog notification job
 */
export async function addBlogNotificationJob(data: {
  blogId: string;
  title: string;
  excerpt: string;
  url: string;
}) {
  return await emailQueue.add("blog-notification", data);
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  await emailQueue.close();
  await connection.quit();
});


