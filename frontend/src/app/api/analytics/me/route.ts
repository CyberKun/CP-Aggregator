import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const solvedProblems = await prisma.userSolvedProblem.findMany({
      where: { userId: authUser.sub },
      include: { problem: true }
    });

    const platformCount: Record<string, number> = {};
    const difficultyCount: Record<string, number> = {};
    const tagCount: Record<string, number> = {};

    solvedProblems.forEach(sp => {
      const p = sp.problem;

      // Platform
      platformCount[p.platform] = (platformCount[p.platform] || 0) + 1;

      // Difficulty
      if (p.difficulty) {
        difficultyCount[p.difficulty] = (difficultyCount[p.difficulty] || 0) + 1;
      }

      // Tags
      if (p.tags && p.tags.length > 0) {
        p.tags.forEach(t => {
          tagCount[t] = (tagCount[t] || 0) + 1;
        });
      }
    });

    const formatData = (record: Record<string, number>) => {
      return Object.entries(record)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort descending
    };

    return NextResponse.json({
      platformData: formatData(platformCount),
      difficultyData: formatData(difficultyCount),
      tagData: formatData(tagCount).slice(0, 20) // Only top 20 tags
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
