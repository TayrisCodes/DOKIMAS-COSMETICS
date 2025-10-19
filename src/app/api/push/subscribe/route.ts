import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongodb';
import Subscription from '@/models/Subscription';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth();
    const body = await request.json();

    const { subscription, preferences } = body;

    if (!subscription || !subscription.endpoint) {
      return errorResponse('Invalid subscription object', 400);
    }

    // Extract subscription details
    const { endpoint, keys } = subscription;

    if (!keys || !keys.p256dh || !keys.auth) {
      return errorResponse('Invalid subscription keys', 400);
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({ endpoint });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.userId = session?.user?.id || existingSubscription.userId;
      existingSubscription.keys = keys;

      if (preferences) {
        if (preferences.categories) {
          existingSubscription.prefs.categories = preferences.categories;
        }
        if (preferences.frequency) {
          existingSubscription.prefs.frequency = preferences.frequency;
        }
      }

      await existingSubscription.save();

      return successResponse(
        {
          subscription: existingSubscription,
          message: 'Subscription updated',
        },
        'Subscription updated successfully'
      );
    }

    // Create new subscription
    const newSubscription = await Subscription.create({
      userId: session?.user?.id || null,
      endpoint,
      keys,
      prefs: {
        categories: preferences?.categories || [],
        frequency: preferences?.frequency || 'immediate',
      },
    });

    return successResponse(
      {
        subscription: newSubscription,
        message: 'Subscription created',
      },
      'Subscription created successfully',
      201
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return errorResponse('Failed to save subscription', 500);
  }
}

