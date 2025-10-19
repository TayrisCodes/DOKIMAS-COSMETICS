/**
 * Notification Queue for managing batched notifications
 * Simple in-memory queue for daily/weekly digest notifications
 */

import connectDB from '@/lib/db/mongodb';
import mongoose from 'mongoose';

export interface QueuedNotification {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  type: 'new_product' | 'order_update' | 'promotion' | 'reminder' | 'general';
  frequency: 'immediate' | 'daily' | 'weekly';
  createdAt: Date;
}

// In-memory queue (will be replaced with Redis/BullMQ in production)
const notificationQueue: QueuedNotification[] = [];

/**
 * Add notification to queue
 */
export function queueNotification(notification: Omit<QueuedNotification, 'createdAt'>): void {
  notificationQueue.push({
    ...notification,
    createdAt: new Date(),
  });
}

/**
 * Get queued notifications for a specific frequency
 */
export function getQueuedNotifications(frequency: 'daily' | 'weekly'): QueuedNotification[] {
  return notificationQueue.filter((n) => n.frequency === frequency);
}

/**
 * Clear queued notifications for a specific frequency
 */
export function clearQueue(frequency: 'daily' | 'weekly'): void {
  const indexesToRemove: number[] = [];

  notificationQueue.forEach((n, index) => {
    if (n.frequency === frequency) {
      indexesToRemove.push(index);
    }
  });

  // Remove in reverse order to maintain indices
  indexesToRemove.reverse().forEach((index) => {
    notificationQueue.splice(index, 1);
  });
}

/**
 * Group queued notifications by user
 */
export function groupNotificationsByUser(
  notifications: QueuedNotification[]
): Map<string, QueuedNotification[]> {
  const grouped = new Map<string, QueuedNotification[]>();

  notifications.forEach((notification) => {
    const userId = notification.userId.toString();
    if (!grouped.has(userId)) {
      grouped.set(userId, []);
    }
    grouped.get(userId)!.push(notification);
  });

  return grouped;
}

/**
 * Create digest notification from multiple notifications
 */
export function createDigestNotification(
  notifications: QueuedNotification[]
): {
  title: string;
  body: string;
  url: string;
} {
  const count = notifications.length;

  if (count === 0) {
    return {
      title: 'No new notifications',
      body: 'You are all caught up!',
      url: '/',
    };
  }

  if (count === 1) {
    return {
      title: notifications[0].title,
      body: notifications[0].body,
      url: notifications[0].url || '/',
    };
  }

  // Count by type
  const typeCounts: Record<string, number> = {};
  notifications.forEach((n) => {
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
  });

  const parts: string[] = [];
  if (typeCounts.new_product) {
    parts.push(`${typeCounts.new_product} new product${typeCounts.new_product > 1 ? 's' : ''}`);
  }
  if (typeCounts.order_update) {
    parts.push(`${typeCounts.order_update} order update${typeCounts.order_update > 1 ? 's' : ''}`);
  }
  if (typeCounts.promotion) {
    parts.push(`${typeCounts.promotion} promotion${typeCounts.promotion > 1 ? 's' : ''}`);
  }

  const body = parts.length > 0 ? parts.join(', ') : `${count} new notifications`;

  return {
    title: `You have ${count} new notifications`,
    body,
    url: '/settings/notifications',
  };
}

/**
 * Check if notification should be queued based on user preference
 */
export async function shouldQueueNotification(
  userId: string | mongoose.Types.ObjectId,
  frequency: 'immediate' | 'daily' | 'weekly'
): Promise<boolean> {
  // If immediate, don't queue
  if (frequency === 'immediate') {
    return false;
  }

  // Queue for daily or weekly
  return true;
}

