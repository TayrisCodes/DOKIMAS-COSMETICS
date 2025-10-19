import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import { sendToUser, PushPayload } from '@/lib/webpush';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const payload: PushPayload = {
      title: '🎉 Test Notification',
      body: 'This is a test notification from Dokimas Cosmetics. If you see this, push notifications are working perfectly!',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      url: '/',
    };

    const sent = await sendToUser(session.user.id, payload, {
      saveToHistory: false, // Don't save test notifications
    });

    if (sent === 0) {
      return errorResponse(
        'No active subscriptions found. Please enable notifications first.',
        404
      );
    }

    return successResponse({
      sent,
      message: 'Test notification sent successfully',
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return errorResponse('Failed to send test notification', 500);
  }
}

