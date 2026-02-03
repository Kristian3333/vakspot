// scripts/migrate-job-statuses.ts
// Migration script to update job statuses from legacy values to new Phase 7 values
// Run with: npx ts-node scripts/migrate-job-statuses.ts
// Or: npx tsx scripts/migrate-job-statuses.ts

import { PrismaClient, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateJobStatuses() {
  console.log('Starting job status migration...\n');

  // Get counts before migration
  const beforeCounts = await getStatusCounts();
  console.log('Status counts before migration:');
  Object.entries(beforeCounts).forEach(([status, count]) => {
    if (count > 0) console.log(`  ${status}: ${count}`);
  });
  console.log('');

  // Migration mappings
  const migrations = [
    {
      from: 'DRAFT' as JobStatus,
      to: 'CREATED' as JobStatus,
      description: 'DRAFT → CREATED (unpublished drafts become created jobs)',
    },
    {
      from: 'PUBLISHED' as JobStatus,
      to: 'CREATED' as JobStatus,
      description: 'PUBLISHED → CREATED (published jobs are now created jobs)',
    },
    {
      from: 'ACCEPTED' as JobStatus,
      to: 'SELECTED' as JobStatus,
      description: 'ACCEPTED → SELECTED (accepted bid means PRO was selected)',
    },
    {
      from: 'COMPLETED' as JobStatus,
      to: 'COMPLETED_BY_CONSUMER' as JobStatus,
      description: 'COMPLETED → COMPLETED_BY_CONSUMER (legacy completions assumed consumer confirmed)',
    },
  ];

  let totalMigrated = 0;

  for (const migration of migrations) {
    try {
      const result = await prisma.job.updateMany({
        where: { status: migration.from },
        data: {
          status: migration.to,
          statusChangedAt: new Date(),
          statusChangedBy: 'SYSTEM',
        },
      });

      if (result.count > 0) {
        console.log(`✅ ${migration.description}`);
        console.log(`   Migrated ${result.count} jobs\n`);
        totalMigrated += result.count;

        // Log to StatusHistory for audit trail
        const migratedJobs = await prisma.job.findMany({
          where: { status: migration.to },
          select: { id: true },
        });

        // Create status history entries for migrated jobs
        await prisma.statusHistory.createMany({
          data: migratedJobs.map(job => ({
            jobId: job.id,
            fromStatus: migration.from,
            toStatus: migration.to,
            changedBy: 'SYSTEM',
            reason: 'Phase 7 migration: status enum consolidation',
          })),
          skipDuplicates: true,
        });
      } else {
        console.log(`ℹ️  ${migration.description}`);
        console.log(`   No jobs to migrate\n`);
      }
    } catch (error) {
      console.error(`❌ Failed: ${migration.description}`);
      console.error(`   Error: ${error}\n`);
    }
  }

  // Get counts after migration
  const afterCounts = await getStatusCounts();
  console.log('Status counts after migration:');
  Object.entries(afterCounts).forEach(([status, count]) => {
    if (count > 0) console.log(`  ${status}: ${count}`);
  });

  console.log(`\n✅ Migration complete! Total jobs migrated: ${totalMigrated}`);
}

async function getStatusCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  const results = await prisma.job.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  for (const result of results) {
    counts[result.status] = result._count.status;
  }

  return counts;
}

// Dry run mode - just shows what would be migrated
async function dryRun() {
  console.log('🔍 DRY RUN - No changes will be made\n');

  const legacyStatuses = ['DRAFT', 'PUBLISHED', 'ACCEPTED', 'COMPLETED'] as JobStatus[];

  for (const status of legacyStatuses) {
    const count = await prisma.job.count({
      where: { status },
    });

    if (count > 0) {
      const targetStatus = getTargetStatus(status);
      console.log(`  ${status} → ${targetStatus}: ${count} jobs would be migrated`);
    }
  }
}

function getTargetStatus(legacy: JobStatus): JobStatus {
  switch (legacy) {
    case 'DRAFT':
    case 'PUBLISHED':
      return 'CREATED';
    case 'ACCEPTED':
      return 'SELECTED';
    case 'COMPLETED':
      return 'COMPLETED_BY_CONSUMER';
    default:
      return legacy;
  }
}

// Main execution
const isDryRun = process.argv.includes('--dry-run');

if (isDryRun) {
  dryRun()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
} else {
  migrateJobStatuses()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
