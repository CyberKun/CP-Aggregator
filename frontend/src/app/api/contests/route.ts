import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Platform } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const platformsParam = url.searchParams.get('platforms');
    const upcomingOnly = url.searchParams.get('upcoming') === 'true';

    let platforms: Platform[] = [];
    if (platformsParam) {
      platforms = platformsParam.split(',')
        .map(p => p.trim().toUpperCase())
        .filter(p => Object.values(Platform).includes(p as Platform)) as Platform[];
    } else {
      platforms = Object.values(Platform); // default all
    }

    const now = new Date();

    const whereClause: any = {
      platform: { in: platforms }
    };

    if (upcomingOnly) {
      whereClause.startTime = { gt: now };
    }

    const contests = await prisma.contest.findMany({
      where: whereClause,
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
