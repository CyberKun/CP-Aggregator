import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Platform, ContestPhase } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    
    // Protect the cron route with a simple secret (you can define CRON_SECRET in .env)
    const expectedSecret = process.env.CRON_SECRET || 'cp-aggregator-cron-secret';
    if (secret !== expectedSecret) {
      return NextResponse.json({ message: 'Unauthorized cron request' }, { status: 401 });
    }

    console.log('Starting sync...');

    // Run all sync tasks in parallel
    await Promise.allSettled([
      syncCodeforcesContests(),
      syncLeetCodeContests(),
      syncCodeforcesProblems(),
      syncLeetCodeProblems(),
    ]);

    console.log('Sync completed.');
    return NextResponse.json({ message: 'Sync completed successfully' });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// ---- CODEFORCES CONTESTS ----
async function syncCodeforcesContests() {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list');
    const data = await res.json();
    if (data.status !== 'OK') return;

    const contests = data.result;
    for (const c of contests) {
      // Codeforces returns startTimeSeconds
      const startTime = new Date(c.startTimeSeconds * 1000);
      const endTime = new Date((c.startTimeSeconds + c.durationSeconds) * 1000);
      
      let phase: ContestPhase = ContestPhase.BEFORE;
      if (c.phase === 'BEFORE') phase = ContestPhase.BEFORE;
      else if (c.phase === 'CODING') phase = ContestPhase.CODING;
      else if (c.phase === 'PENDING_SYSTEM_TEST') phase = ContestPhase.PENDING_SYSTEM_TEST;
      else if (c.phase === 'SYSTEM_TEST') phase = ContestPhase.SYSTEM_TEST;
      else if (c.phase === 'FINISHED') phase = ContestPhase.FINISHED;

      await prisma.contest.upsert({
        where: { platform_externalId: { platform: Platform.CODEFORCES, externalId: c.id.toString() } },
        update: { name: c.name, startTime, endTime, phase },
        create: {
          platform: Platform.CODEFORCES,
          externalId: c.id.toString(),
          name: c.name,
          url: `https://codeforces.com/contest/${c.id}`,
          startTime,
          endTime,
          phase,
        }
      });
    }
  } catch (err) {
    console.error('Error syncing Codeforces contests', err);
  }
}

// ---- LEETCODE CONTESTS ----
async function syncLeetCodeContests() {
  try {
    const q = { query: '{ allContests { title titleSlug startTime duration } }' };
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q)
    });
    const data = await res.json();
    
    if (!data?.data?.allContests) return;
    const contests = data.data.allContests;

    // We only care about contests around now (past few years + future)
    // No need to insert 700+ contests if we only show upcoming/recent
    for (const c of contests) {
      const startTime = new Date(c.startTime * 1000);
      const endTime = new Date((c.startTime + c.duration) * 1000);
      const now = new Date();
      
      let phase: ContestPhase = ContestPhase.BEFORE;
      if (now >= startTime && now <= endTime) phase = ContestPhase.CODING;
      else if (now > endTime) phase = ContestPhase.FINISHED;

      const externalId = c.titleSlug;

      await prisma.contest.upsert({
        where: { platform_externalId: { platform: Platform.LEETCODE, externalId } },
        update: { name: c.title, startTime, endTime, phase },
        create: {
          platform: Platform.LEETCODE,
          externalId,
          name: c.title,
          url: `https://leetcode.com/contest/${c.titleSlug}`,
          startTime,
          endTime,
          phase,
        }
      });
    }
  } catch (err) {
    console.error('Error syncing LeetCode contests', err);
  }
}

// ---- CODEFORCES PROBLEMS ----
async function syncCodeforcesProblems() {
  try {
    const res = await fetch('https://codeforces.com/api/problemset.problems');
    const data = await res.json();
    if (data.status !== 'OK') return;

    const problems = data.result.problems;
    const statistics = data.result.problemStatistics;

    // We might not want to insert 9000 problems sequentially as it's slow.
    // Let's do it in chunks.
    const chunkSize = 100;
    for (let i = 0; i < problems.length; i += chunkSize) {
      const chunk = problems.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (p: any, idx: number) => {
        const stat = statistics[i + idx];
        const externalId = `${p.contestId}${p.index}`;
        
        await prisma.problem.upsert({
          where: { platform_externalId: { platform: Platform.CODEFORCES, externalId } },
          update: { 
            rating: p.rating || null,
            solvedCount: stat ? stat.solvedCount : 0,
            tags: p.tags || []
          },
          create: {
            platform: Platform.CODEFORCES,
            externalId,
            name: p.name,
            url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            rating: p.rating || null,
            difficulty: p.rating ? p.rating.toString() : null,
            solvedCount: stat ? stat.solvedCount : 0,
            tags: p.tags || []
          }
        });
      }));
    }
  } catch (err) {
    console.error('Error syncing Codeforces problems', err);
  }
}

// ---- LEETCODE PROBLEMS ----
async function syncLeetCodeProblems() {
  try {
    const res = await fetch('https://alfa-leetcode-api.onrender.com/problems?limit=2000'); // Fetch a large chunk
    const data = await res.json();
    
    if (!data.problemsetQuestionList) return;

    const problems = data.problemsetQuestionList;
    const chunkSize = 100;
    for (let i = 0; i < problems.length; i += chunkSize) {
      const chunk = problems.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (p: any) => {
        const externalId = p.titleSlug;
        
        await prisma.problem.upsert({
          where: { platform_externalId: { platform: Platform.LEETCODE, externalId } },
          update: { 
            difficulty: p.difficulty,
          },
          create: {
            platform: Platform.LEETCODE,
            externalId,
            name: p.title,
            url: `https://leetcode.com/problems/${p.titleSlug}`,
            difficulty: p.difficulty,
            tags: p.topicTags ? p.topicTags.map((t: any) => t.name) : []
          }
        });
      }));
    }
  } catch (err) {
    console.error('Error syncing LeetCode problems', err);
  }
}
