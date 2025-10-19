/**
 * Web Push Notification Server Library
 * Handles sending push notifications using web-push library
 */

import webpush from 'web-push';
import Subscription from '@/models/Subscription';
import Notification from '@/models/Notification';
import connectDB from '@/lib/db/mongodb';
import mongoose from 'mongoose';

// Initialize VAPID details
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidContact = process.env.VAPID_CONTACT || 'mailto:admin@dokimas.com';

// Only initialize during runtime, not during build
let isVapidInitialized = false;

function initializeVapid() {
  if (isVapidInitialized) return;
  
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('⚠️ VAPID keys not configured. Push notifications will not work.');
    return;
  }

  try {
    webpush.setVapidDetails(vapidContact, vapidPublicKey, vapidPrivateKey);
    isVapidInitialized = true;
  } catch (error) {
    console.error('Failed to initialize VAPID:', error);
  }
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: Record<string, any>;
}

export interface NotificationFilter {
  userId?: string | mongoose.Types.ObjectId;
  categories?: string[];
  userIds?: string[] | mongoose.Types.ObjectId[];
}

/**
 * Send push notification to a single subscription
 */
export async function sendPushNotification(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  payload: PushPayload
): Promise<boolean> {
  try {
    // Initialize VAPID if not already done
    initializeVapid();
    
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
    return true;
  } catch (error: any) {
    console.error('Push notification error:', error);

    // Handle invalid subscriptions (410 Gone, 404 Not Found)
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log('Subscription expired, removing:', subscription.endpoint);
      await removeInvalidSubscription(subscription.endpoint);
    }

    return false;
  }
}

/**
 * Remove invalid subscription from database
 */
async function removeInvalidSubscription(endpoint: string): Promise<void> {
  try {
    await connectDB();
    await Subscription.deleteOne({ endpoint });
    console.log('Removed invalid subscription:', endpoint);
  } catch (error) {
    console.error('Error removing subscription:', error);
  }
}

/**
 * Send push notification to a specific user
 */
export async function sendToUser(
  userId: string | mongoose.Types.ObjectId,
  payload: PushPayload,
  options: {
    saveToHistory?: boolean;
    type?: 'new_product' | 'order_update' | 'promotion' | 'reminder' | 'general';
  } = {}
): Promise<number> {
  try {
    await connectDB();

    // Find all subscriptions for this user
    const subscriptions = await Subscription.find({ userId });

    if (subscriptions.length === 0) {
      console.log('No subscriptions found for user:', userId);
      return 0;
    }

    // Send to all subscriptions
    const results = await Promise.all(
      subscriptions.map((sub) => sendPushNotification(sub, payload))
    );

    const successCount = results.filter((r) => r).length;

    // Save to notification history
    if (options.saveToHistory !== false) {
      await Notification.create({
        userId,
        title: payload.title,
        body: payload.body,
        url: payload.url,
        icon: payload.icon,
        type: options.type || 'general',
        sentAt: new Date(),
        read: false,
        meta: payload.data || {},
      });
    }

    return successCount;
  } catch (error) {
    console.error('Error sending to user:', error);
    return 0;
  }
}

/**
 * Send push notifications to multiple users based on filter
 */
export async function sendToSegment(
  filter: NotificationFilter,
  payload: PushPayload,
  options: {
    saveToHistory?: boolean;
    type?: 'new_product' | 'order_update' | 'promotion' | 'reminder' | 'general';
  } = {}
): Promise<{ sent: number; failed: number }> {
  try {
    await connectDB();

    // Build query
    const query: any = {};

    if (filter.userId) {
      query.userId = filter.userId;
    } else if (filter.userIds && filter.userIds.length > 0) {
      query.userId = { $in: filter.userIds };
    }

    if (filter.categories && filter.categories.length > 0) {
      query['prefs.categories'] = { $in: filter.categories };
    }

    // Find matching subscriptions
    const subscriptions = await Subscription.find(query);

    if (subscriptions.length === 0) {
      console.log('No subscriptions found for filter:', filter);
      return { sent: 0, failed: 0 };
    }

    console.log(`Sending to ${subscriptions.length} subscriptions`);

    // Send to all subscriptions
    const results = await Promise.all(
      subscriptions.map((sub) => sendPushNotification(sub, payload))
    );

    const sent = results.filter((r) => r).length;
    const failed = results.length - sent;

    // Save to notification history for each unique user
    if (options.saveToHistory !== false) {
      const userIds = [...new Set(subscriptions.map((s) => s.userId).filter(Boolean))];

      await Notification.insertMany(
        userIds.map((userId) => ({
          userId,
          title: payload.title,
          body: payload.body,
          url: payload.url,
          icon: payload.icon,
          type: options.type || 'general',
          sentAt: new Date(),
          read: false,
          meta: payload.data || {},
        }))
      );
    }

    return { sent, failed };
  } catch (error) {
    console.error('Error sending to segment:', error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Send push notification to all subscribers
 */
export async function sendToAll(
  payload: PushPayload,
  options: {
    saveToHistory?: boolean;
    type?: 'new_product' | 'order_update' | 'promotion' | 'reminder' | 'general';
  } = {}
): Promise<{ sent: number; failed: number }> {
  return sendToSegment({}, payload, options);
}

/**
 * Send test notification to a specific subscription endpoint
 */
export async function sendTestNotification(endpoint: string): Promise<boolean> {
  try {
    await connectDB();

    const subscription = await Subscription.findOne({ endpoint });

    if (!subscription) {
      console.log('Subscription not found:', endpoint);
      return false;
    }

    const payload: PushPayload = {
      title: '🎉 Test Notification',
      body: 'If you see this, push notifications are working!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      url: '/',
    };

    return await sendPushNotification(subscription, payload);
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

/**
 * Get VAPID public key
 */
export function getVapidPublicKey(): string | undefined {
  return vapidPublicKey;
}

/**
 * Check if web push is configured
 */
export function isWebPushConfigured(): boolean {
  return !!(vapidPublicKey && vapidPrivateKey);
}

