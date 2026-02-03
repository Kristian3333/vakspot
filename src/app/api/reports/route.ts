// src/app/api/reports/route.ts
// DSA Compliance: Users can report illegal or inappropriate content

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createReportSchema = z.object({
  type: z.enum(['JOB', 'PROFILE', 'MESSAGE']),
  targetId: z.string().min(1),
  reason: z.enum(['SPAM', 'FRAUD', 'INAPPROPRIATE', 'ILLEGAL', 'HARASSMENT', 'OTHER']),
  description: z.string().max(1000).optional(),
});

// GET - Get reports (admin only) or user's own reports
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Admin can see all reports
    if (session.user.role === 'ADMIN') {
      const where: any = {};
      if (status) where.status = status;
      if (type) where.type = type;

      const reports = await prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get stats
      const stats = await prisma.report.groupBy({
        by: ['status'],
        _count: true,
      });

      const typeStats = await prisma.report.groupBy({
        by: ['type'],
        where: { status: 'OPEN' },
        _count: true,
      });

      return NextResponse.json({
        reports,
        stats: {
          byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
          byType: typeStats.reduce((acc, t) => ({ ...acc, [t.type]: t._count }), {}),
        },
      });
    }

    // Regular users can only see their own reports
    const reports = await prisma.report.findMany({
      where: { reporterId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, targetId, reason, description } = parsed.data;

    // Verify the target exists and get details for flagging
    let targetExists = false;
    let jobToFlag: { id: string; status: string } | null = null;

    switch (type) {
      case 'JOB':
        const job = await prisma.job.findUnique({
          where: { id: targetId },
          select: { id: true, status: true },
        });
        targetExists = !!job;
        if (job) jobToFlag = job;
        break;
      case 'PROFILE':
        const profile = await prisma.proProfile.findUnique({ where: { id: targetId } });
        targetExists = !!profile;
        break;
      case 'MESSAGE':
        // For messages, also flag the associated job
        const message = await prisma.message.findUnique({
          where: { id: targetId },
          include: {
            conversation: {
              include: {
                bid: {
                  select: { jobId: true },
                },
              },
            },
          },
        });
        targetExists = !!message;
        if (message?.conversation?.bid?.jobId) {
          const associatedJob = await prisma.job.findUnique({
            where: { id: message.conversation.bid.jobId },
            select: { id: true, status: true },
          });
          if (associatedJob) jobToFlag = associatedJob;
        }
        break;
    }

    if (!targetExists) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 });
    }

    // Check for duplicate reports from same user
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        type,
        targetId,
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'U heeft dit al gemeld. Wij onderzoeken uw melding.' },
        { status: 400 }
      );
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        type,
        targetId,
        reporterId: session.user.id,
        reason,
        description,
      },
    });

    // Phase 7: Automatically flag associated job for review (DSA compliance)
    // Only flag if job is in an active/in-progress status (not already completed/cancelled)
    const nonFlaggableStatuses = [
      'FLAGGED', 'COMPLETED_BY_CONSUMER', 'COMPLETED_BY_PRO', 'COMPLETED',
      'REVIEWED', 'CANCELLED_BY_CONSUMER', 'CANCELLED_BY_PRO', 'EXPIRED',
    ];

    if (jobToFlag && !nonFlaggableStatuses.includes(jobToFlag.status)) {
      const previousStatus = jobToFlag.status;
      await prisma.job.update({
        where: { id: jobToFlag.id },
        data: {
          status: 'FLAGGED',
          statusChangedAt: new Date(),
          statusChangedBy: 'SYSTEM',
        },
      });

      // Log status transition for audit
      await prisma.statusHistory.create({
        data: {
          jobId: jobToFlag.id,
          fromStatus: previousStatus as any,
          toStatus: 'FLAGGED',
          changedBy: 'SYSTEM',
          userId: session.user.id,
          reason: `Gemeld via DSA procedure: ${reason}${description ? ` - ${description.substring(0, 100)}` : ''}`,
        },
      });
    }

    return NextResponse.json({ report, message: 'Melding ontvangen. Bedankt voor uw feedback.' }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
