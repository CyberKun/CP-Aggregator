import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Platform } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const size = parseInt(url.searchParams.get('size') || '20', 10);
    const platformStr = url.searchParams.get('platform');
    const minRating = url.searchParams.get('minRating');
    const maxRating = url.searchParams.get('maxRating');
    const difficulty = url.searchParams.get('difficulty');
    const tagsStr = url.searchParams.get('tags');
    const sortStr = url.searchParams.get('sort'); // e.g. "rating,desc"

    const whereClause: any = {};

    if (platformStr && platformStr !== 'ALL') {
      const platform = platformStr.toUpperCase() as Platform;
      if (Object.values(Platform).includes(platform)) {
        whereClause.platform = platform;
      }
    }

    if (minRating) {
      whereClause.rating = { ...whereClause.rating, gte: parseInt(minRating, 10) };
    }
    if (maxRating) {
      whereClause.rating = { ...whereClause.rating, lte: parseInt(maxRating, 10) };
    }
    if (difficulty) {
      const diffs = difficulty.split(',').map(d => d.trim());
      whereClause.difficulty = { in: diffs, mode: 'insensitive' };
    }
    if (tagsStr) {
      const tags = tagsStr.split(',').map(t => t.trim());
      whereClause.tags = { hasSome: tags }; // array overlap in Postgres
    }

    let orderBy: any = {};
    if (sortStr) {
      const [field, dir] = sortStr.split(',');
      if (field === 'rating' || field === 'solvedCount') {
        orderBy[field] = dir === 'desc' ? 'desc' : 'asc';
      }
    } else {
      orderBy = { rating: 'asc' }; // default
    }
    
    const status = url.searchParams.get('status');
    if (status && status !== 'all') {
      const authHeader = req.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { verifyToken } = await import('@/lib/auth');
          const payload = verifyToken(token);
          if (payload) {
            if (status === 'solved') {
              whereClause.solvedBy = { some: { userId: payload.sub as string } };
            } else if (status === 'unsolved') {
              whereClause.solvedBy = { none: { userId: payload.sub as string } };
            }
          }
        } catch (e) {
          console.error("Invalid token for status filter", e);
        }
      }
    }

    const totalElements = await prisma.problem.count({ where: whereClause });
    const content = await prisma.problem.findMany({
      where: whereClause,
      orderBy,
      skip: page * size,
      take: size,
    });

    const totalPages = Math.ceil(totalElements / size);

    return NextResponse.json({
      content,
      pageable: {
        pageNumber: page,
        pageSize: size,
      },
      totalElements,
      totalPages,
      last: page >= totalPages - 1,
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
