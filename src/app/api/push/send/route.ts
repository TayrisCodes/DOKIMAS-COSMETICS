import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import { sendToSegment, sendToAll, PushPayload } from '@/lib/webpush';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session?.user || session.user.role !== 'admin') {
      return errorResponse('Unauthorized. Admin access required.', 403);
    }

    await connectDB();

    const body = await request.json();
    const { title, body: messageBody, url, icon, targetSegment, categories, userIds, type } = body;

    if (!title || !messageBody) {
      return errorResponse('Title and body are required', 400);
    }

    // Build payload
    const payload: PushPayload = {
      title,
      body: messageBody,
      icon: icon || '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      url: url || '/',
      data: {
        timestamp: Date.now(),
      },
    };

    let result;

    // Send based on target segment
    if (targetSegment === 'all') {
      result = await sendToAll(payload, {
        saveToHistory: true,
        type: type || 'general',
      });
    } else if (categories && categories.length > 0) {
      result = await sendToSegment(
        { categories },
        payload,
        {
          saveToHistory: true,
          type: type || 'general',
        }
      );
    } else if (userIds && userIds.length > 0) {
      result = await sendToSegment(
        { userIds },
        payload,
        {
          saveToHistory: true,
          type: type || 'general',
        }
      );
    } else {
      return errorResponse('No target segment specified', 400);
    }

    return successResponse({
      sent: result.sent,
      failed: result.failed,
      message: `Sent ${result.sent} notifications, ${result.failed} failed`,
    });
  } catch (error) {
    console.error('Send push error:', error);
    return errorResponse('Failed to send push notifications', 500);
  }
}

