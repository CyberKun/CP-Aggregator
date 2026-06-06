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

    const platforms = await prisma.userPlatform.findMany({
      where: { userId: authUser.sub }
    });

    if (platforms.length === 0) {
      return NextResponse.json({ message: 'No platforms linked' }, { status: 400 });
    }

    let newSolved = 0;

    for (const p of platforms) {
      if (p.platform === Platform.CODEFORCES) {
        newSolved += await syncCodeforcesUser(authUser.sub, p.handle);
      } else if (p.platform === Platform.LEETCODE) {
        newSolved += await syncLeetCodeUser(authUser.sub, p.handle);
      }

      await prisma.userPlatform.update({
        where: { id: p.id },
        data: { syncedAt: new Date() }
      });
    }

    return NextResponse.json({ message: 'Sync complete', newSolved });
  } catch (error) {
    console.error('User sync error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function syncCodeforcesUser(userId: string, handle: string): Promise<number> {
  let count = 0;
  try {
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const data = await res.json();
    if (data.status !== 'OK') return 0;

    const submissions = data.result;
    const solvedSet = new Set<string>();

    for (const sub of submissions) {
      if (sub.verdict === 'OK') {
        solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`);
      }
    }

    // Get all matching problems in one query
    const problems = await prisma.problem.findMany({
      where: {
        platform: Platform.CODEFORCES,
        externalId: { in: Array.from(solvedSet) }
      },
      select: { id: true }
    });

    // Bulk insert with skipDuplicates
    if (problems.length > 0) {
      await prisma.userSolvedProblem.createMany({
        data: problems.map((p) => ({
          userId,
          problemId: p.id,
          platform: Platform.CODEFORCES
        })),
        skipDuplicates: true
      });
    }
    
    // --- Fetch Attempted Contests ---
    try {
      const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
      const ratingData = await ratingRes.json();
      if (ratingData.status === 'OK') {
        const ratingChanges = ratingData.result;
        
        // Find matching contests
        const attemptedContestIds = ratingChanges.map((rc: any) => rc.contestId.toString());
        const attemptedContests = await prisma.contest.findMany({
          where: {
            platform: Platform.CODEFORCES,
            externalId: { in: attemptedContestIds }
          },
          select: { id: true, externalId: true }
        });

        if (attemptedContests.length > 0) {
          const contestIdMap = new Map(attemptedContests.map(c => [c.externalId, c.id]));
          
          await prisma.userAttemptedContest.createMany({
            data: ratingChanges
              .filter((rc: any) => contestIdMap.has(rc.contestId.toString()))
              .map((rc: any) => ({
                userId,
                contestId: contestIdMap.get(rc.contestId.toString())!,
                platform: Platform.CODEFORCES,
                ratingChange: rc.newRating - rc.oldRating,
                rank: rc.rank
              })),
            skipDuplicates: true
          });
        }
      }
    } catch (e) {
      console.error('Codeforces attempted contest sync error', e);
    }
    
    // Update the solvedCount in UserPlatform
    await prisma.userPlatform.updateMany({
      where: { userId, platform: Platform.CODEFORCES },
      data: { solvedCount: solvedSet.size }
    });
    
    return solvedSet.size;
  } catch (err) {
    console.error('Codeforces user sync error', err);
  }
  return 0;
}

async function syncLeetCodeUser(userId: string, handle: string): Promise<number> {
  let count = 0;
  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}/acSubmission`);
    const data = await res.json();
    
    // alfa api returns { count, submission: [ { title, titleSlug, timestamp, statusDisplay } ] }
    if (!data.submission) return 0;

    const solvedSet = new Set<string>();
    for (const sub of data.submission) {
      if (sub.statusDisplay === 'Accepted') {
        solvedSet.add(sub.titleSlug);
      }
    }

    // Get all matching problems in one query
    const problems = await prisma.problem.findMany({
      where: {
        platform: Platform.LEETCODE,
        externalId: { in: Array.from(solvedSet) }
      },
      select: { id: true }
    });

    // Bulk insert with skipDuplicates
    if (problems.length > 0) {
      await prisma.userSolvedProblem.createMany({
        data: problems.map((p) => ({
          userId,
          problemId: p.id,
          platform: Platform.LEETCODE
        })),
        skipDuplicates: true
      });
    }
    
    // Fetch total solved count
    let totalSolved = solvedSet.size;
    try {
      const solvedRes = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}/solved`);
      const solvedData = await solvedRes.json();
      if (solvedData && solvedData.solvedProblem) {
        totalSolved = solvedData.solvedProblem;
      }
    } catch (e) {
      console.error('Failed to fetch total solved for LeetCode', e);
    }

    // --- Fetch Attempted Contests ---
    try {
      const contestRes = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}/contest`);
      const contestData = await contestRes.json();
      if (contestData && contestData.contestParticipation) {
        const participations = contestData.contestParticipation.filter((cp: any) => cp.attended);
        
        // Find matching contests
        const attemptedContestIds = participations.map((cp: any) => cp.contest.title.toLowerCase().replace(/ /g, '-'));
        const attemptedContests = await prisma.contest.findMany({
          where: {
            platform: Platform.LEETCODE,
            externalId: { in: attemptedContestIds }
          },
          select: { id: true, externalId: true }
        });

        if (attemptedContests.length > 0) {
          const contestIdMap = new Map(attemptedContests.map(c => [c.externalId, c.id]));
          
          let previousRating = 1500; // Default starting rating
          // Alfa returns in order, we can calculate rating change if we sort by finishTimeInSeconds
          const sortedParticipations = [...participations].sort((a, b) => a.finishTimeInSeconds - b.finishTimeInSeconds);
          
          const mappedData = sortedParticipations.map((cp: any) => {
            const externalId = cp.contest.title.toLowerCase().replace(/ /g, '-');
            const ratingChange = Math.round(cp.rating - previousRating);
            previousRating = cp.rating;
            
            return {
              userId,
              contestId: contestIdMap.get(externalId)!,
              platform: Platform.LEETCODE,
              ratingChange,
              rank: cp.ranking
            };
          }).filter(data => data.contestId); // only keep those we found a contestId for

          await prisma.userAttemptedContest.createMany({
            data: mappedData,
            skipDuplicates: true
          });
        }
      }
    } catch (e) {
      console.error('LeetCode attempted contest sync error', e);
    }

    // --- Heuristic for recent unrated contests ---
    // LeetCode takes days to update ratings. If a user had an AC submission DURING a recent contest, they participated.
    try {
      if (data.submission && data.submission.length > 0) {
        const recentContests = await prisma.contest.findMany({
          where: {
            platform: Platform.LEETCODE,
            startTime: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          }
        });

        const recentAttemptedIds = new Set<number>();
        for (const sub of data.submission) {
          const subTime = parseInt(sub.timestamp) * 1000;
          for (const c of recentContests) {
            const startTime = c.startTime.getTime();
            const endTime = c.endTime ? c.endTime.getTime() : startTime + (c.durationSeconds * 1000);
            if (subTime >= startTime && subTime <= endTime) {
              recentAttemptedIds.add(c.id);
            }
          }
        }

        if (recentAttemptedIds.size > 0) {
          await prisma.userAttemptedContest.createMany({
            data: Array.from(recentAttemptedIds).map(contestId => ({
              userId,
              contestId,
              platform: Platform.LEETCODE,
              ratingChange: 0,
              rank: null
            })),
            skipDuplicates: true
          });
        }
      }
    } catch (e) {
      console.error('LeetCode recent submission heuristic error', e);
    }

    // Update the solvedCount in UserPlatform
    await prisma.userPlatform.updateMany({
      where: { userId, platform: Platform.LEETCODE },
      data: { solvedCount: totalSolved }
    });

    return totalSolved;
  } catch (err) {
    console.error('LeetCode user sync error', err);
  }
  return 0;
}
