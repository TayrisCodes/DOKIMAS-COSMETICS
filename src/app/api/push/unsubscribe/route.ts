import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Subscription from '@/models/Subscription';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return errorResponse('Endpoint is required', 400);
    }

    // Remove subscription
    const result = await Subscription.deleteOne({ endpoint });

    if (result.deletedCount === 0) {
      return errorResponse('Subscription not found', 404);
    }

    return successResponse(
      { message: 'Unsubscribed successfully' },
      'Unsubscribed successfully'
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return errorResponse('Failed to unsubscribe', 500);
  }
}

