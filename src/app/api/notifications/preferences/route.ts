import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import NotificationPreference from '@/models/NotificationPreference';
import Subscription from '@/models/Subscription';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    // Get user preferences
    let preferences = await NotificationPreference.findOne({
      userId: session.user.id,
    });

    // Create default preferences if not exists
    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId: session.user.id,
        enabled: true,
        categories: ['Aftershave', 'Oils', 'Deodorants', 'Cleansers', 'Promotions'],
        frequency: 'immediate',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
        channels: {
          push: true,
          email: true,
        },
      });
    }

    return successResponse({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    return errorResponse('Failed to fetch preferences', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const body = await request.json();
    const { enabled, categories, frequency, quietHours, channels } = body;

    // Update or create preferences
    const preferences = await NotificationPreference.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          ...(enabled !== undefined && { enabled }),
          ...(categories && { categories }),
          ...(frequency && { frequency }),
          ...(quietHours && { quietHours }),
          ...(channels && { channels }),
        },
      },
      { upsert: true, new: true }
    );

    // Update subscription preferences as well
    if (categories || frequency) {
      await Subscription.updateMany(
        { userId: session.user.id },
        {
          $set: {
            ...(categories && { 'prefs.categories': categories }),
            ...(frequency && { 'prefs.frequency': frequency }),
          },
        }
      );
    }

    return successResponse({
      preferences,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return errorResponse('Failed to update preferences', 500);
  }
}

