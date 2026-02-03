// src/app/api/admin/analytics/route.ts
// Analytics API for Phase 7.9 Reporting Dashboard

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { JobStatus } from '@prisma/client';
import { STATUS_LABELS } from '@/lib/job-state-machine';

// Funnel stages in order
const FUNNEL_STAGES: JobStatus[] = [
  'CREATED',
  'RESPONSES_RECEIVED',
  'IN_CONVERSATION',
  'QUOTE_RECEIVED',
  'SELECTED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED_BY_CONSUMER',
  'REVIEWED',
];

// Statuses that indicate job progression stopped
const STALL_STATUSES: JobStatus[] = [
  'CREATED',
  'RESPONSES_RECEIVED',
  'IN_CONVERSATION',
  'QUOTE_RECEIVED',
  'SELECTED',
  'SCHEDULED',
];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    // Get date range from query params (default: last 30 days)
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Status Distribution - count jobs by current status
    const statusDistribution = await prisma.job.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusDistributionData = statusDistribution.map((item) => ({
      status: item.status,
      label: STATUS_LABELS[item.status] || item.status,
      count: item._count.id,
    }));

    // 2. Conversion Funnel - count jobs that reached each stage
    // We need to count jobs where statusHistory includes each stage
    const funnelData = await Promise.all(
      FUNNEL_STAGES.map(async (stage) => {
        // Count jobs that have ever been in this status (from StatusHistory)
        const countFromHistory = await prisma.statusHistory.groupBy({
          by: ['jobId'],
          where: {
            OR: [
              { toStatus: stage },
              { fromStatus: stage },
            ],
          },
        });

        // Also count jobs currently in this status
        const currentCount = await prisma.job.count({
          where: { status: stage },
        });

        // Unique jobs that reached this stage
        const uniqueJobIds = new Set(countFromHistory.map((h) => h.jobId));

        // Add jobs currently in this status
        const jobsInStatus = await prisma.job.findMany({
          where: { status: stage },
          select: { id: true },
        });
        jobsInStatus.forEach((j) => uniqueJobIds.add(j.id));

        return {
          status: stage,
          label: STATUS_LABELS[stage] || stage,
          count: uniqueJobIds.size,
          currentCount,
        };
      })
    );

    // 3. Stalled Jobs - jobs that haven't progressed in X days
    const stallThresholdDays = 7;
    const stallDate = new Date();
    stallDate.setDate(stallDate.getDate() - stallThresholdDays);

    const stalledJobs = await Promise.all(
      STALL_STATUSES.map(async (status) => {
        const count = await prisma.job.count({
          where: {
            status,
            statusChangedAt: { lt: stallDate },
          },
        });

        return {
          status,
          label: STATUS_LABELS[status] || status,
          count,
          threshold: stallThresholdDays,
        };
      })
    );

    // Total stalled
    const totalStalled = stalledJobs.reduce((sum, s) => sum + s.count, 0);

    // 4. Average Transition Times - how long jobs spend in each status
    const transitionTimes = await prisma.$queryRaw<
      Array<{
        fromStatus: string;
        toStatus: string;
        avgMinutes: number;
        count: bigint;
      }>
    >`
      SELECT
        sh1."fromStatus",
        sh1."toStatus",
        AVG(EXTRACT(EPOCH FROM (sh1."changedAt" - COALESCE(sh_prev."changedAt", j."createdAt"))) / 60) as "avgMinutes",
        COUNT(*) as count
      FROM "StatusHistory" sh1
      LEFT JOIN LATERAL (
        SELECT "changedAt"
        FROM "StatusHistory" sh2
        WHERE sh2."jobId" = sh1."jobId"
          AND sh2."changedAt" < sh1."changedAt"
        ORDER BY sh2."changedAt" DESC
        LIMIT 1
      ) sh_prev ON true
      JOIN "Job" j ON j.id = sh1."jobId"
      WHERE sh1."changedAt" > ${startDate}
      GROUP BY sh1."fromStatus", sh1."toStatus"
      ORDER BY count DESC
    `;

    const transitionTimesData = transitionTimes.map((t) => ({
      from: t.fromStatus,
      fromLabel: STATUS_LABELS[t.fromStatus as JobStatus] || t.fromStatus,
      to: t.toStatus,
      toLabel: STATUS_LABELS[t.toStatus as JobStatus] || t.toStatus,
      avgMinutes: Math.round(Number(t.avgMinutes) || 0),
      avgHours: Math.round((Number(t.avgMinutes) || 0) / 60 * 10) / 10,
      avgDays: Math.round((Number(t.avgMinutes) || 0) / 1440 * 10) / 10,
      count: Number(t.count),
    }));

    // 5. Monthly Trends - jobs created per month (last 12 months)
    const monthlyTrends = await prisma.$queryRaw<
      Array<{
        month: Date;
        created: bigint;
        completed: bigint;
        cancelled: bigint;
      }>
    >`
      SELECT
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as created,
        COUNT(*) FILTER (WHERE status IN ('COMPLETED_BY_CONSUMER', 'COMPLETED_BY_PRO', 'REVIEWED', 'COMPLETED')) as completed,
        COUNT(*) FILTER (WHERE status IN ('CANCELLED_BY_CONSUMER', 'CANCELLED_BY_PRO')) as cancelled
      FROM "Job"
      WHERE "createdAt" > NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;

    const monthlyTrendsData = monthlyTrends.map((t) => ({
      month: t.month.toISOString().slice(0, 7), // YYYY-MM format
      created: Number(t.created),
      completed: Number(t.completed),
      cancelled: Number(t.cancelled),
      completionRate: Number(t.completed) / Number(t.created) * 100 || 0,
    }));

    // 6. Conversion Killers - identify where jobs drop off most
    const conversionKillers = [];
    for (let i = 0; i < funnelData.length - 1; i++) {
      const current = funnelData[i];
      const next = funnelData[i + 1];
      const dropoff = current.count - next.count;
      const dropoffRate = current.count > 0 ? (dropoff / current.count) * 100 : 0;

      conversionKillers.push({
        from: current.status,
        fromLabel: current.label,
        to: next.status,
        toLabel: next.label,
        dropoff,
        dropoffRate: Math.round(dropoffRate * 10) / 10,
        severity: dropoffRate > 50 ? 'high' : dropoffRate > 25 ? 'medium' : 'low',
      });
    }

    // Sort by dropoff rate (highest first)
    conversionKillers.sort((a, b) => b.dropoffRate - a.dropoffRate);

    // 7. Summary Metrics
    const totalJobs = await prisma.job.count();
    const completedJobs = await prisma.job.count({
      where: {
        status: { in: ['COMPLETED_BY_CONSUMER', 'COMPLETED_BY_PRO', 'REVIEWED', 'COMPLETED'] },
      },
    });
    const reviewedJobs = await prisma.job.count({
      where: { status: 'REVIEWED' },
    });

    const summary = {
      totalJobs,
      completedJobs,
      reviewedJobs,
      overallCompletionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100 * 10) / 10 : 0,
      reviewRate: completedJobs > 0 ? Math.round((reviewedJobs / completedJobs) * 100 * 10) / 10 : 0,
      totalStalled,
      period: { days, startDate: startDate.toISOString() },
    };

    return NextResponse.json({
      summary,
      statusDistribution: statusDistributionData,
      conversionFunnel: funnelData,
      conversionKillers,
      stalledJobs,
      transitionTimes: transitionTimesData,
      monthlyTrends: monthlyTrendsData.reverse(), // Oldest first for charts
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan bij het ophalen van analytics' },
      { status: 500 }
    );
  }
}

// Export analytics data as CSV
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    const { type } = await request.json();

    let csvData = '';
    const now = new Date().toISOString().slice(0, 10);

    if (type === 'status-distribution') {
      const data = await prisma.job.groupBy({
        by: ['status'],
        _count: { id: true },
      });

      csvData = 'Status,Label,Count\n';
      data.forEach((item) => {
        csvData += `${item.status},"${STATUS_LABELS[item.status] || item.status}",${item._count.id}\n`;
      });
    } else if (type === 'jobs-full') {
      const jobs = await prisma.job.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          statusChangedAt: true,
          locationCity: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10000, // Limit to 10k records
      });

      csvData = 'ID,Title,Status,Created,Last Status Change,City,Category\n';
      jobs.forEach((job) => {
        csvData += `${job.id},"${job.title.replace(/"/g, '""')}",${job.status},${job.createdAt.toISOString()},${job.statusChangedAt?.toISOString() || ''},"${job.locationCity}","${job.category.name}"\n`;
      });
    } else if (type === 'transitions') {
      const transitions = await prisma.statusHistory.findMany({
        select: {
          jobId: true,
          fromStatus: true,
          toStatus: true,
          changedBy: true,
          changedAt: true,
          reason: true,
        },
        orderBy: { changedAt: 'desc' },
        take: 10000,
      });

      csvData = 'Job ID,From Status,To Status,Changed By,Changed At,Reason\n';
      transitions.forEach((t) => {
        csvData += `${t.jobId},${t.fromStatus},${t.toStatus},${t.changedBy},${t.changedAt.toISOString()},"${(t.reason || '').replace(/"/g, '""')}"\n`;
      });
    } else if (type === 'monthly-summary') {
      const monthlyData = await prisma.$queryRaw<
        Array<{
          month: Date;
          total: bigint;
          completed: bigint;
          cancelled: bigint;
          reviewed: bigint;
        }>
      >`
        SELECT
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status IN ('COMPLETED_BY_CONSUMER', 'COMPLETED_BY_PRO', 'REVIEWED', 'COMPLETED')) as completed,
          COUNT(*) FILTER (WHERE status IN ('CANCELLED_BY_CONSUMER', 'CANCELLED_BY_PRO')) as cancelled,
          COUNT(*) FILTER (WHERE status = 'REVIEWED') as reviewed
        FROM "Job"
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `;

      csvData = 'Month,Total Jobs,Completed,Cancelled,Reviewed,Completion Rate %\n';
      monthlyData.forEach((m) => {
        const rate = Number(m.total) > 0 ? Math.round((Number(m.completed) / Number(m.total)) * 100 * 10) / 10 : 0;
        csvData += `${m.month.toISOString().slice(0, 7)},${m.total},${m.completed},${m.cancelled},${m.reviewed},${rate}\n`;
      });
    } else {
      return NextResponse.json({ error: 'Ongeldig export type' }, { status: 400 });
    }

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="vakspot-${type}-${now}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan bij het exporteren' },
      { status: 500 }
    );
  }
}
