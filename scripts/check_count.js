const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.turf.count();
  console.log('Current Turf count in Postgres:', count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
