import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Notification from '@/models/Notification';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      const result = await Notification.updateMany(
        { userId: session.user.id, read: false },
        { $set: { read: true } }
      );

      return successResponse({
        updated: result.modifiedCount,
        message: 'All notifications marked as read',
      });
    }

    if (!notificationId) {
      return errorResponse('Notification ID is required', 400);
    }

    // Mark single notification as read
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: session.user.id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    return successResponse({
      notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark read error:', error);
    return errorResponse('Failed to update notification', 500);
  }
}

