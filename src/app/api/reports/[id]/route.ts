// src/app/api/reports/[id]/route.ts
// Admin endpoints for managing individual reports

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateReportSchema = z.object({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']),
  resolution: z.string().max(1000).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// GET - Get a single report (admin only)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Fetch target details based on type
    let targetDetails = null;
    switch (report.type) {
      case 'JOB':
        targetDetails = await prisma.job.findUnique({
          where: { id: report.targetId },
          include: {
            client: { select: { user: { select: { name: true, email: true } } } },
            category: { select: { name: true } },
          },
        });
        break;
      case 'PROFILE':
        targetDetails = await prisma.proProfile.findUnique({
          where: { id: report.targetId },
          include: { user: { select: { name: true, email: true } } },
        });
        break;
      case 'MESSAGE':
        targetDetails = await prisma.message.findUnique({
          where: { id: report.targetId },
          include: { sender: { select: { name: true, email: true } } },
        });
        break;
    }

    return NextResponse.json({ report, targetDetails });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

// PATCH - Update report status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, resolution } = parsed.data;

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: ['RESOLVED', 'DISMISSED'].includes(status) ? new Date() : null,
        resolvedBy: ['RESOLVED', 'DISMISSED'].includes(status) ? session.user.id : null,
      },
    });

    // Log the action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        action: status === 'RESOLVED' ? 'RESOLVE_REPORT' : 'DISMISS_REPORT',
        targetType: 'report',
        targetId: id,
        reason: resolution,
      },
    });

    return NextResponse.json({ report: updatedReport });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
