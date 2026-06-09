const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.problem.findFirst({where: {platform: 'LEETCODE', tags: {has: 'dynamic-programming'}}}).then(console.log).finally(()=>prisma.$disconnect());
