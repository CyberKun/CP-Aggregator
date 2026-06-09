import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { subscription } = await req.json();
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ message: 'Invalid subscription' }, { status: 400 });
    }

    // Attempt to extract userId from cookies/token if available
    let userId = null;
    const token = req.cookies.get('token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (e) {
        // Ignore invalid token, we'll subscribe them as a guest
      }
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: userId,
      },
      create: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: userId,
      }
    });

    return NextResponse.json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
