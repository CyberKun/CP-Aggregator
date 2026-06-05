const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const lcCount = await prisma.problem.count({ where: { platform: 'LEETCODE' } });
  const ccCount = await prisma.problem.count({ where: { platform: 'CODECHEF' } });
  console.log(`LeetCode: ${lcCount}`);
  console.log(`CodeChef: ${ccCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
