import { config } from 'dotenv';
config(); // Load .env file

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking current job statuses...');
  
  const jobs = await prisma.$queryRaw`SELECT status, COUNT(*)::int as count FROM "Job" GROUP BY status`;
  console.log('Current statuses:', jobs);

  console.log('\nUpdating old statuses...');
  
  const r1 = await prisma.$executeRaw`UPDATE "Job" SET status = 'PUBLISHED' WHERE status = 'IN_CONVERSATION'`;
  console.log(`IN_CONVERSATION -> PUBLISHED: ${r1} rows`);
  
  const r2 = await prisma.$executeRaw`UPDATE "Job" SET status = 'ACCEPTED' WHERE status = 'IN_PROGRESS'`;
  console.log(`IN_PROGRESS -> ACCEPTED: ${r2} rows`);
  
  const r3 = await prisma.$executeRaw`UPDATE "Job" SET status = 'COMPLETED' WHERE status = 'CANCELLED'`;
  console.log(`CANCELLED -> COMPLETED: ${r3} rows`);

  const after = await prisma.$queryRaw`SELECT status, COUNT(*)::int as count FROM "Job" GROUP BY status`;
  console.log('\nAfter fix:', after);
  
  console.log('\nDone! Now run: npx prisma db push');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
