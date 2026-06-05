import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { Platform } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { platform, handle } = await req.json();

    if (!platform || !handle) {
      return NextResponse.json({ message: 'Platform and handle are required' }, { status: 400 });
    }

    const validPlatform = platform.toUpperCase() as Platform;
    if (!Object.values(Platform).includes(validPlatform)) {
      return NextResponse.json({ message: 'Invalid platform' }, { status: 400 });
    }

    // Check if user already has this platform configured
    const existing = await prisma.userPlatform.findUnique({
      where: {
        userId_platform: {
          userId: authUser.sub,
          platform: validPlatform,
        }
      }
    });

    if (existing) {
      // Update existing
      const updated = await prisma.userPlatform.update({
        where: { id: existing.id },
        data: { handle },
      });
      return NextResponse.json(updated);
    } else {
      // Create new
      const created = await prisma.userPlatform.create({
        data: {
          userId: authUser.sub,
          platform: validPlatform,
          handle,
        }
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Error adding platform:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const platformStr = url.searchParams.get('platform');

    if (!platformStr) {
      return NextResponse.json({ message: 'Platform parameter is required' }, { status: 400 });
    }

    const platform = platformStr.toUpperCase() as Platform;

    await prisma.userPlatform.delete({
      where: {
        userId_platform: {
          userId: authUser.sub,
          platform,
        }
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting platform:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
