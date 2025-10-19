import { Queue } from "bullmq";
import Redis from "ioredis";

// Lazy Redis connection - only initialize when needed
let connection: Redis | null = null;
let emailQueue: Queue | null = null;

function getConnection() {
  if (!connection) {
    try {
      connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        enableOfflineQueue: false,
      });
    } catch (error) {
      console.warn('Redis not available. Email queue disabled.');
      return null;
    }
  }
  return connection;
}

function getEmailQueue() {
  if (!emailQueue) {
    const conn = getConnection();
    if (!conn) return null;
    
    emailQueue = new Queue("email", {
      connection: conn,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: 1000,
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
        },
      },
    });
  }
  return emailQueue;
}

export { getEmailQueue as emailQueue };

/**
 * Add newsletter broadcast job
 */
export async function addNewsletterBroadcastJob(data: {
  emails: string[];
  subject: string;
  html: string;
}) {
  const queue = getEmailQueue();
  if (!queue) {
    console.warn('Email queue not available');
    return null;
  }
  return await queue.add("newsletter-broadcast", data);
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
  const queue = getEmailQueue();
  if (!queue) {
    console.warn('Email queue not available');
    return null;
  }
  return await queue.add("blog-notification", data);
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on("SIGTERM", async () => {
    const queue = getEmailQueue();
    const conn = getConnection();
    if (queue) await queue.close();
    if (conn) await conn.quit();
  });
}


