// src/app/api/appeals/route.ts
// P2B Compliance: Appeal route for users to contest suspensions

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createAppealSchema = z.object({
  type: z.enum(['SUSPENSION', 'REPORT_DECISION', 'CONTENT_REMOVAL']),
  reason: z.string().min(20, 'Toelichting moet minimaal 20 tekens bevatten').max(2000),
});

// GET - Get user's appeals
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin can see all appeals
    if (session.user.role === 'ADMIN') {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');

      const where: any = {};
      if (status) where.status = status;

      const appeals = await prisma.appeal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      const stats = await prisma.appeal.groupBy({
        by: ['status'],
        _count: true,
      });

      return NextResponse.json({
        appeals,
        stats: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      });
    }

    // Regular users can only see their own appeals
    const appeals = await prisma.appeal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ appeals });
  } catch (error) {
    console.error('Error fetching appeals:', error);
    return NextResponse.json({ error: 'Failed to fetch appeals' }, { status: 500 });
  }
}

// POST - Create a new appeal
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createAppealSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, reason } = parsed.data;

    // Check for existing pending appeal of same type
    const existingAppeal = await prisma.appeal.findFirst({
      where: {
        userId: session.user.id,
        type,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });

    if (existingAppeal) {
      return NextResponse.json(
        { error: 'U heeft al een bezwaar ingediend. Wacht op de beoordeling.' },
        { status: 400 }
      );
    }

    // Create the appeal
    const appeal = await prisma.appeal.create({
      data: {
        userId: session.user.id,
        type,
        reason,
      },
    });

    return NextResponse.json({
      appeal,
      message: 'Uw bezwaar is ontvangen. Wij nemen dit zo snel mogelijk in behandeling.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating appeal:', error);
    return NextResponse.json({ error: 'Failed to create appeal' }, { status: 500 });
  }
}
