import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { sendToUser, PushPayload } from '@/lib/webpush';
import {
  getQueuedNotifications,
  clearQueue,
  groupNotificationsByUser,
  createDigestNotification,
} from '@/lib/notificationQueue';
import { successResponse, errorResponse } from '@/lib/api-response';
import NotificationPreference from '@/models/NotificationPreference';

/**
 * Daily Digest Cron Job
 * Runs every day at 9 AM
 * Sends batched notifications to users with 'daily' frequency preference
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also check Vercel cron header
      const vercelCron = request.headers.get('x-vercel-cron');
      if (!vercelCron) {
        return errorResponse('Unauthorized', 401);
      }
    }

    await connectDB();

    console.log('[Daily Digest] Starting daily notification digest job');

    // Get all queued notifications for daily frequency
    const queuedNotifications = getQueuedNotifications('daily');

    if (queuedNotifications.length === 0) {
      console.log('[Daily Digest] No queued notifications');
      return successResponse({
        sent: 0,
        message: 'No queued notifications',
      });
    }

    console.log(`[Daily Digest] Processing ${queuedNotifications.length} queued notifications`);

    // Group notifications by user
    const notificationsByUser = groupNotificationsByUser(queuedNotifications);

    let sent = 0;
    let failed = 0;

    // Send digest to each user
    for (const [userId, userNotifications] of notificationsByUser) {
      try {
        // Check if user still has daily frequency preference
        const prefs = await NotificationPreference.findOne({ userId });

        if (!prefs || prefs.frequency !== 'daily' || !prefs.enabled) {
          console.log(`[Daily Digest] Skipping user ${userId} - preference changed`);
          continue;
        }

        // Create digest notification
        const digest = createDigestNotification(userNotifications);

        const payload: PushPayload = {
          title: digest.title,
          body: digest.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          url: digest.url,
          data: {
            type: 'digest',
            count: userNotifications.length,
            notifications: userNotifications.map((n) => ({
              title: n.title,
              url: n.url,
            })),
          },
        };

        const result = await sendToUser(userId, payload, {
          saveToHistory: true,
          type: 'general',
        });

        if (result > 0) {
          sent++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`[Daily Digest] Failed to send to user ${userId}:`, error);
        failed++;
      }
    }

    // Clear the queue
    clearQueue('daily');

    console.log(`[Daily Digest] Complete: ${sent} sent, ${failed} failed`);

    return successResponse({
      sent,
      failed,
      processed: queuedNotifications.length,
      users: notificationsByUser.size,
      message: 'Daily digest sent successfully',
    });
  } catch (error) {
    console.error('[Daily Digest] Error:', error);
    return errorResponse('Failed to process daily digest', 500);
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}

