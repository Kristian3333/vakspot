// src/app/api/cron/job-transitions/route.ts
// Cron job for automatic job status transitions
// Trigger via Vercel Cron or external service (e.g., every hour)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { JobStatus } from '@prisma/client';
import { sendSetStartDateReminderEmail } from '@/lib/email';

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    scheduledToInProgress: 0,
    createdToNoMatch: 0,
    createdToExpired: 0,
    nudgesSent: 0,
    errors: [] as string[],
  };

  const now = new Date();

  try {
    // 1. SCHEDULED → IN_PROGRESS: Jobs where startDate has passed
    const scheduledJobs = await prisma.job.findMany({
      where: {
        status: 'SCHEDULED',
        startDate: {
          lte: now,
        },
      },
      include: {
        client: { include: { user: true } },
        acceptedBid: { include: { pro: { include: { user: true } } } },
      },
    });

    for (const job of scheduledJobs) {
      try {
        await prisma.$transaction([
          prisma.job.update({
            where: { id: job.id },
            data: {
              status: 'IN_PROGRESS',
              startedAt: now,
              statusChangedAt: now,
              statusChangedBy: 'SYSTEM',
            },
          }),
          prisma.statusHistory.create({
            data: {
              jobId: job.id,
              fromStatus: 'SCHEDULED',
              toStatus: 'IN_PROGRESS',
              changedBy: 'SYSTEM',
              reason: 'Automatische overgang: startdatum bereikt',
            },
          }),
        ]);
        results.scheduledToInProgress++;
      } catch (err) {
        results.errors.push(`SCHEDULED→IN_PROGRESS failed for job ${job.id}: ${err}`);
      }
    }

    // 2. CREATED → NO_MATCH: Jobs with no responses after 14 days
    const noMatchDeadline = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const noResponseJobs = await prisma.job.findMany({
      where: {
        status: 'CREATED',
        createdAt: {
          lte: noMatchDeadline,
        },
        bids: {
          none: {},
        },
      },
    });

    for (const job of noResponseJobs) {
      try {
        await prisma.$transaction([
          prisma.job.update({
            where: { id: job.id },
            data: {
              status: 'NO_MATCH',
              statusChangedAt: now,
              statusChangedBy: 'SYSTEM',
            },
          }),
          prisma.statusHistory.create({
            data: {
              jobId: job.id,
              fromStatus: 'CREATED',
              toStatus: 'NO_MATCH',
              changedBy: 'SYSTEM',
              reason: 'Automatische overgang: geen reacties na 14 dagen',
            },
          }),
        ]);
        results.createdToNoMatch++;
      } catch (err) {
        results.errors.push(`CREATED→NO_MATCH failed for job ${job.id}: ${err}`);
      }
    }

    // 3. CREATED/RESPONSES_RECEIVED/IN_CONVERSATION → EXPIRED: Jobs inactive for 30 days
    const expiredDeadline = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const expirableStatuses: JobStatus[] = ['CREATED', 'RESPONSES_RECEIVED', 'IN_CONVERSATION', 'QUOTE_RECEIVED'];

    const inactiveJobs = await prisma.job.findMany({
      where: {
        status: { in: expirableStatuses },
        updatedAt: {
          lte: expiredDeadline,
        },
      },
    });

    for (const job of inactiveJobs) {
      try {
        await prisma.$transaction([
          prisma.job.update({
            where: { id: job.id },
            data: {
              status: 'EXPIRED',
              statusChangedAt: now,
              statusChangedBy: 'SYSTEM',
            },
          }),
          prisma.statusHistory.create({
            data: {
              jobId: job.id,
              fromStatus: job.status,
              toStatus: 'EXPIRED',
              changedBy: 'SYSTEM',
              reason: 'Automatische overgang: geen activiteit na 30 dagen',
            },
          }),
        ]);
        results.createdToExpired++;
      } catch (err) {
        results.errors.push(`→EXPIRED failed for job ${job.id}: ${err}`);
      }
    }

    // 4. Nudge emails: PRO hasn't set start date within 3 days of selection
    const nudgeDeadline = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const selectedJobsNeedingNudge = await prisma.job.findMany({
      where: {
        status: 'SELECTED',
        statusChangedAt: {
          lte: nudgeDeadline,
        },
        // Only nudge once per job - check if we haven't sent a nudge recently
        // Using a simple approach: only jobs that changed exactly 3-4 days ago
        AND: {
          statusChangedAt: {
            gte: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        client: { include: { user: true } },
        acceptedBid: { include: { pro: { include: { user: true } } } },
      },
    });

    for (const job of selectedJobsNeedingNudge) {
      if (job.acceptedBid?.pro.user.email && job.acceptedBid.pro.user.emailBidUpdates) {
        try {
          // Get conversation URL
          const conversation = await prisma.conversation.findUnique({
            where: { bidId: job.acceptedBid.id },
            select: { id: true },
          });
          const conversationUrl = conversation ? `/messages/${conversation.id}` : '/pro/jobs';

          const daysSinceSelection = Math.floor(
            (now.getTime() - new Date(job.statusChangedAt!).getTime()) / (1000 * 60 * 60 * 24)
          );
          await sendSetStartDateReminderEmail({
            to: job.acceptedBid.pro.user.email,
            proName: job.acceptedBid.pro.user.name || 'Vakman',
            clientName: job.client.user.name || 'Klant',
            jobTitle: job.title,
            daysSinceSelection,
            conversationUrl,
          });
          results.nudgesSent++;
        } catch (err) {
          results.errors.push(`Nudge email failed for job ${job.id}: ${err}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for compatibility with some cron services
export async function POST(request: NextRequest) {
  return GET(request);
}
