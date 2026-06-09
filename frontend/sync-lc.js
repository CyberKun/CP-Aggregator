const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  console.log('Fetching ACs...');
  const res = await fetch('https://leetcode.com/api/problems/algorithms/');
  const data = await res.json();
  const acsMap = new Map();
  for (const p of data.stat_status_pairs) {
    acsMap.set(p.stat.question__title_slug, p.stat.total_acs || 0);
  }

  console.log('Fetching GraphQL tags...');
  let allQuestions = [];
  let skip = 0;
  const limit = 100;
  while (true) {
    const query = `query problemsetQuestionList {
      problemsetQuestionList: questionList(categorySlug: "", limit: ${limit}, skip: ${skip}, filters: {}) {
        questions: data {
          title
          titleSlug
          difficulty
          topicTags { slug }
        }
      }
    }`;
    const gqlRes = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const gqlData = await gqlRes.json();
    const questions = gqlData?.data?.problemsetQuestionList?.questions;
    if (!questions || questions.length === 0) break;
    allQuestions.push(...questions);
    console.log(`Fetched ${allQuestions.length} questions...`);
    skip += limit;
  }
  
  const chunkSize = 200;
  for (let i = 0; i < allQuestions.length; i += chunkSize) {
    const chunk = allQuestions.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async (p) => {
      const tags = p.topicTags ? p.topicTags.map(t => t.slug) : [];
      await prisma.problem.upsert({
        where: { platform_externalId: { platform: 'LEETCODE', externalId: p.titleSlug } },
        update: {
          difficulty: p.difficulty,
          solvedCount: acsMap.get(p.titleSlug) || 0,
          tags
        },
        create: {
          platform: 'LEETCODE',
          externalId: p.titleSlug,
          name: p.title,
          url: 'https://leetcode.com/problems/' + p.titleSlug,
          difficulty: p.difficulty,
          solvedCount: acsMap.get(p.titleSlug) || 0,
          tags
        }
      });
    }));
    console.log('Synced ' + (i + chunk.length));
  }
}

run().then(() => console.log('Done')).catch(console.error).finally(() => prisma.$disconnect());
