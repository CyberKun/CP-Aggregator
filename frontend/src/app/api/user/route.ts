import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.sub },
      include: {
        platforms: true,
        solvedProblems: {
          select: { problem: { select: { externalId: true } } }
        },
        attemptedContests: {
          select: { contest: { select: { externalId: true } } }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const totalSolved = user.platforms.reduce((acc, platform) => acc + platform.solvedCount, 0);
    const solvedProblemIds = user.solvedProblems.map(sp => sp.problem.externalId);
    const attemptedContestIds = user.attemptedContests.map(ac => ac.contest.externalId);

    // Exclude password
    const { password, solvedProblems, attemptedContests, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      ...userWithoutPassword,
      totalSolved,
      solvedProblemIds,
      attemptedContestIds
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
