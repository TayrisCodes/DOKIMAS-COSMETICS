import { NextResponse } from 'next/server';
import { getVapidPublicKey } from '@/lib/webpush';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET() {
  try {
    const publicKey = getVapidPublicKey();

    if (!publicKey) {
      return errorResponse('VAPID keys not configured', 500);
    }

    return successResponse(
      { publicKey },
      'VAPID public key retrieved'
    );
  } catch (error) {
    console.error('VAPID key error:', error);
    return errorResponse('Failed to get VAPID key', 500);
  }
}

