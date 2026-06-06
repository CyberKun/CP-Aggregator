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

export async function PUT(req: NextRequest) {
  try {
    const authUser = getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const updateData: any = {};

    if (data.username) updateData.username = data.username;
    if (data.email) updateData.email = data.email;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    
    if (data.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.sub },
      data: updateData,
    });

    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({ message: 'Profile updated successfully', user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
