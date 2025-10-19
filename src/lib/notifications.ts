/**
 * Notification Helper Functions
 * High-level functions for triggering notifications across the app
 */

import { sendToUser, sendToSegment, PushPayload } from '@/lib/webpush';
import { queueNotification } from '@/lib/notificationQueue';
import NotificationPreference from '@/models/NotificationPreference';
import connectDB from '@/lib/db/mongodb';
import mongoose from 'mongoose';
import { sendEmail } from '@/lib/email';

/**
 * Send order status notification
 */
export async function sendOrderNotification(
  userId: string | mongoose.Types.ObjectId,
  orderNumber: string,
  status: 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  options?: {
    trackingNumber?: string;
    url?: string;
  }
) {
  await connectDB();

  const statusMessages: Record<string, { title: string; body: string }> = {
    paid: {
      title: '✅ Payment Confirmed',
      body: `Your payment for order ${orderNumber} has been confirmed. We're preparing your order!`,
    },
    processing: {
      title: '📦 Order Processing',
      body: `Your order ${orderNumber} is being prepared for shipment.`,
    },
    shipped: {
      title: '🚚 Order Shipped',
      body: `Your order ${orderNumber} is on its way! ${options?.trackingNumber ? `Tracking: ${options.trackingNumber}` : ''}`,
    },
    delivered: {
      title: '🎉 Order Delivered',
      body: `Your order ${orderNumber} has been delivered. Enjoy your Dokimas products!`,
    },
    cancelled: {
      title: '❌ Order Cancelled',
      body: `Your order ${orderNumber} has been cancelled.`,
    },
  };

  const message = statusMessages[status];

  if (!message) {
    console.error('Invalid order status:', status);
    return;
  }

  const payload: PushPayload = {
    title: message.title,
    body: message.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    url: options?.url || `/dashboard/customer/orders`,
    data: {
      orderNumber,
      status,
      trackingNumber: options?.trackingNumber,
    },
  };

  // Send push notification
  await sendToUser(userId, payload, {
    saveToHistory: true,
    type: 'order_update',
  });

  // Also send email as fallback
  try {
    const User = (await import('@/models/User')).default;
    const user = await User.findById(userId);

    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: message.title,
        html: `
          <h2>${message.title}</h2>
          <p>${message.body}</p>
          <p><a href="${process.env.NEXTAUTH_URL}${payload.url}">View Order Details</a></p>
        `,
      });
    }
  } catch (error) {
    console.error('Failed to send order email:', error);
  }
}

/**
 * Send new product notification
 */
export async function sendNewProductNotification(
  productId: string | mongoose.Types.ObjectId,
  productData: {
    name: string;
    category: string;
    slug: string;
    image?: string;
  }
) {
  await connectDB();

  const payload: PushPayload = {
    title: '✨ New Arrival',
    body: `${productData.name} is now available in our ${productData.category} collection!`,
    icon: productData.image || '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    url: `/product/${productData.slug}`,
    data: {
      productId: productId.toString(),
      category: productData.category,
    },
  };

  // Send to users who have this category in their preferences
  const result = await sendToSegment(
    { categories: [productData.category] },
    payload,
    {
      saveToHistory: true,
      type: 'new_product',
    }
  );

  console.log(
    `New product notification sent: ${result.sent} successful, ${result.failed} failed`
  );

  return result;
}

/**
 * Send promotion notification
 */
export async function sendPromotionNotification(
  title: string,
  body: string,
  options?: {
    url?: string;
    icon?: string;
    targetCategory?: string;
    targetAll?: boolean;
  }
) {
  await connectDB();

  const payload: PushPayload = {
    title,
    body,
    icon: options?.icon || '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    url: options?.url || '/shop',
  };

  let result;

  if (options?.targetAll) {
    // Send to all subscribers
    const { sendToAll } = await import('@/lib/webpush');
    result = await sendToAll(payload, {
      saveToHistory: true,
      type: 'promotion',
    });
  } else if (options?.targetCategory) {
    // Send to category subscribers
    result = await sendToSegment(
      { categories: [options.targetCategory] },
      payload,
      {
        saveToHistory: true,
        type: 'promotion',
      }
    );
  } else {
    // Send to promotions category subscribers
    result = await sendToSegment(
      { categories: ['Promotions'] },
      payload,
      {
        saveToHistory: true,
        type: 'promotion',
      }
    );
  }

  console.log(`Promotion notification sent: ${result.sent} successful, ${result.failed} failed`);

  return result;
}

/**
 * Send low stock alert to admin
 */
export async function sendLowStockAlert(
  productName: string,
  currentStock: number,
  threshold: number
) {
  await connectDB();

  try {
    const User = (await import('@/models/User')).default;
    const admins = await User.find({ role: 'admin' });

    for (const admin of admins) {
      if (admin._id) {
        await sendToUser(
          admin._id,
          {
            title: '⚠️ Low Stock Alert',
            body: `${productName} is running low (${currentStock} left, threshold: ${threshold})`,
            icon: '/icons/icon-192.png',
            url: '/dashboard/admin/inventory',
          },
          {
            saveToHistory: true,
            type: 'reminder',
          }
        );
      }
    }
  } catch (error) {
    console.error('Failed to send low stock alert:', error);
  }
}

/**
 * Check user notification preferences
 */
export async function getUserNotificationPreferences(userId: string | mongoose.Types.ObjectId) {
  await connectDB();

  let preferences = await NotificationPreference.findOne({ userId });

  if (!preferences) {
    // Return default preferences
    return {
      enabled: true,
      categories: ['Aftershave', 'Oils', 'Deodorants', 'Cleansers', 'Promotions'],
      frequency: 'immediate' as const,
      channels: {
        push: true,
        email: true,
      },
    };
  }

  return preferences;
}

/**
 * Check if user should receive notification based on preferences
 */
export async function shouldSendNotification(
  userId: string | mongoose.Types.ObjectId,
  category: string,
  type: 'push' | 'email' = 'push'
): Promise<boolean> {
  const preferences = await getUserNotificationPreferences(userId);

  if (!preferences.enabled) {
    return false;
  }

  if (!preferences.channels[type]) {
    return false;
  }

  // If category is specified, check if user is subscribed to it
  if (category && !preferences.categories.includes(category)) {
    return false;
  }

  return true;
}

