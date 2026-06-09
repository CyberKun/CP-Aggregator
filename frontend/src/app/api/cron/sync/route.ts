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

    // Run sync tasks sequentially to avoid Prisma connection pool exhaustion
    await syncCodeforcesContests();
    await syncLeetCodeContests();
    await syncAtCoderContests();
    await syncCodeChefContests();
    
    await syncCodeforcesProblems();
    await syncLeetCodeProblems();
    await syncAtCoderProblems();
    await syncCodeChefProblems();

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
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    for (const c of contests) {
      // Codeforces returns startTimeSeconds
      const startTime = new Date(c.startTimeSeconds * 1000);
      const endTime = new Date((c.startTimeSeconds + c.durationSeconds) * 1000);
      
      // Skip old finished contests to save time and prevent timeout
      if (c.phase === 'FINISHED' && endTime < thirtyDaysAgo) {
        continue;
      }
      
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
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (endTime < thirtyDaysAgo) continue;
      
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
    // Let's do it in chunks, only processing the newest 300 problems to prevent timeout.
    const chunkSize = 100;
    const maxProblems = Math.min(problems.length, 300);
    for (let i = 0; i < maxProblems; i += chunkSize) {
      const chunk = problems.slice(i, i + chunkSize);
      
      for (const p of chunk) {
        const idx = chunk.indexOf(p);
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
      }
    }
  } catch (err) {
    console.error('Error syncing Codeforces problems', err);
  }
}

// ---- LEETCODE PROBLEMS ----
async function syncLeetCodeProblems() {
  try {
    // 1. Fetch total ACs from old API
    const res = await fetch('https://leetcode.com/api/problems/algorithms/');
    const data = await res.json();
    if (!data.stat_status_pairs) return;
    
    const acsMap = new Map<string, number>();
    for (const p of data.stat_status_pairs) {
      acsMap.set(p.stat.question__title_slug, p.stat.total_acs || 0);
    }

    // 2. Fetch tags and metadata from GraphQL with pagination
    let allQuestions: any[] = [];
    let skip = 0;
    const limit = 100;
    
    // Only fetch the newest 300 questions to prevent timeout
    while (skip < 300) {
      const query = `
        query problemsetQuestionList {
          problemsetQuestionList: questionList(categorySlug: "", limit: ${limit}, skip: ${skip}, filters: {}) {
            questions: data {
              title
              titleSlug
              difficulty
              topicTags { slug }
            }
          }
        }
      `;

      const gqlRes = await fetch('https://leetcode.com/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const gqlData = await gqlRes.json();
      const questions = gqlData?.data?.problemsetQuestionList?.questions;
      
      if (!questions || questions.length === 0) break;
      allQuestions.push(...questions);
      skip += limit;
    }
    
    if (allQuestions.length === 0) return;

    const chunkSize = 200;
    for (let i = 0; i < allQuestions.length; i += chunkSize) {
      const chunk = allQuestions.slice(i, i + chunkSize);
      
      for (const p of chunk) {
        const externalId = p.titleSlug;
        const difficulty = p.difficulty; // "Easy", "Medium", "Hard"
        const tags = p.topicTags ? p.topicTags.map((t: any) => t.slug) : [];
        const solvedCount = acsMap.get(externalId) || 0;
        
        await prisma.problem.upsert({
          where: { platform_externalId: { platform: Platform.LEETCODE, externalId } },
          update: { 
            difficulty,
            solvedCount,
            tags
          },
          create: {
            platform: Platform.LEETCODE,
            externalId,
            name: p.title,
            url: `https://leetcode.com/problems/${externalId}`,
            difficulty,
            solvedCount,
            tags
          }
        });
      }
    }
  } catch (err) {
    console.error('Error syncing LeetCode problems', err);
  }
}

// ---- ATCODER CONTESTS ----
async function syncAtCoderContests() {
  try {
    const res = await fetch('https://kenkoooo.com/atcoder/resources/contests.json');
    const contests = await res.json();
    if (!Array.isArray(contests)) return;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Only sync contests from the last 30 days + future ones
    const recentContests = contests.filter((c: any) => {
      const endTime = new Date((c.start_epoch_second + c.duration_second) * 1000);
      return endTime >= thirtyDaysAgo;
    });

    const chunkSize = 50;
    for (let i = 0; i < recentContests.length; i += chunkSize) {
      const chunk = recentContests.slice(i, i + chunkSize);
      
      for (const c of chunk) {
        const startTime = new Date(c.start_epoch_second * 1000);
        const endTime = new Date((c.start_epoch_second + c.duration_second) * 1000);
        
        let phase: ContestPhase = ContestPhase.BEFORE;
        if (now >= startTime && now <= endTime) phase = ContestPhase.CODING;
        else if (now > endTime) phase = ContestPhase.FINISHED;

        await prisma.contest.upsert({
          where: { platform_externalId: { platform: Platform.ATCODER, externalId: c.id } },
          update: { name: c.title, startTime, endTime, phase },
          create: {
            platform: Platform.ATCODER,
            externalId: c.id,
            name: c.title,
            url: `https://atcoder.jp/contests/${c.id}`,
            startTime,
            endTime,
            phase,
          }
        });
      }
    }
    console.log(`Synced ${recentContests.length} AtCoder contests`);
  } catch (err) {
    console.error('Error syncing AtCoder contests', err);
  }
}

// ---- CODECHEF CONTESTS ----
async function syncCodeChefContests() {
  try {
    const res = await fetch('https://www.codechef.com/api/list/contests/all');
    const data = await res.json();
    if (data.status !== 'success') return;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const allContests = [
      ...(data.present_contests || []),
      ...(data.future_contests || []),
      ...(data.past_contests || [])
    ].filter(c => {
      const endTime = new Date(c.contest_end_date_iso);
      return endTime >= thirtyDaysAgo;
    });

    const chunkSize = 50;
    for (let i = 0; i < allContests.length; i += chunkSize) {
      const chunk = allContests.slice(i, i + chunkSize);
      
      for (const c of chunk) {
        const startTime = new Date(c.contest_start_date_iso);
        const endTime = new Date(c.contest_end_date_iso);
        
        let phase: ContestPhase = ContestPhase.BEFORE;
        if (now >= startTime && now <= endTime) phase = ContestPhase.CODING;
        else if (now > endTime) phase = ContestPhase.FINISHED;

        await prisma.contest.upsert({
          where: { platform_externalId: { platform: Platform.CODECHEF, externalId: c.contest_code } },
          update: { name: c.contest_name, startTime, endTime, phase },
          create: {
            platform: Platform.CODECHEF,
            externalId: c.contest_code,
            name: c.contest_name,
            url: `https://www.codechef.com/${c.contest_code}`,
            startTime,
            endTime,
            phase,
          }
        });
      }
    }
    console.log(`Synced ${allContests.length} CodeChef contests`);
  } catch (err) {
    console.error('Error syncing CodeChef contests', err);
  }
}

// ---- ATCODER PROBLEMS ----
async function syncAtCoderProblems() {
  try {
    const [probsRes, modelsRes] = await Promise.all([
      fetch('https://kenkoooo.com/atcoder/resources/problems.json'),
      fetch('https://kenkoooo.com/atcoder/resources/problem-models.json')
    ]);
    const problems = await probsRes.json();
    const models = await modelsRes.json();
    
    if (!Array.isArray(problems)) return;

    // Kenkoooo problems are usually in contest chronological order, newer at the end.
    // Let's just process the last 300 to prevent timeouts.
    const recentProblems = problems.slice(-300);

    const chunkSize = 100;
    for (let i = 0; i < recentProblems.length; i += chunkSize) {
      const chunk = recentProblems.slice(i, i + chunkSize);
      
      for (const p of chunk) {
        const externalId = p.id;
        const model = models[externalId];
        const difficulty = model && model.difficulty !== undefined ? Math.round(model.difficulty) : null;
        // Negative difficulty means gray/easy, AtCoder sets min rating for display at 0 usually
        const rating = difficulty !== null ? Math.max(0, difficulty) : null;
        
        await prisma.problem.upsert({
          where: { platform_externalId: { platform: Platform.ATCODER, externalId } },
          update: { 
            rating: rating,
          },
          create: {
            platform: Platform.ATCODER,
            externalId,
            name: p.title,
            url: `https://atcoder.jp/contests/${p.contest_id}/tasks/${p.id}`,
            rating: rating,
            difficulty: rating !== null ? rating.toString() : null,
            tags: []
          }
        });
      }
    }
  } catch (err) {
    console.error('Error syncing AtCoder problems', err);
  }
}

// ---- CODECHEF PROBLEMS ----
async function syncCodeChefProblems() {
  try {
    // Limit to max 300 latest problems to prevent timeouts
    for (let page = 1; page <= 1; page++) {
      const res = await fetch(`https://www.codechef.com/api/list/problems?page=${page}&limit=300`);
      const data = await res.json();
      
      if (data.status !== 'success' || !data.data || data.data.length === 0) continue;

      const problems = data.data;
      const chunkSize = 200;
      
      for (let i = 0; i < problems.length; i += chunkSize) {
        const chunk = problems.slice(i, i + chunkSize);
        
        for (const p of chunk) {
          const externalId = p.code;
          const rating = parseInt(p.difficulty_rating);
          const validRating = (isNaN(rating) || rating === -1) ? null : rating;
          
          await prisma.problem.upsert({
            where: { platform_externalId: { platform: Platform.CODECHEF, externalId } },
            update: { 
              rating: validRating,
              solvedCount: parseInt(p.successful_submissions) || 0
            },
            create: {
              platform: Platform.CODECHEF,
              externalId,
              name: p.name,
              url: `https://www.codechef.com/problems/${p.code}`,
              rating: validRating,
              difficulty: validRating !== null ? validRating.toString() : null,
              solvedCount: parseInt(p.successful_submissions) || 0,
              tags: []
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error syncing CodeChef problems', err);
  }
}
