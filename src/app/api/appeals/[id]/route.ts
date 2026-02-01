// src/app/api/appeals/[id]/route.ts
// Admin endpoint for managing individual appeals

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateAppealSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED']),
  resolution: z.string().max(1000).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// PATCH - Update appeal status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateAppealSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, resolution } = parsed.data;

    const appeal = await prisma.appeal.findUnique({ where: { id } });
    if (!appeal) {
      return NextResponse.json({ error: 'Appeal not found' }, { status: 404 });
    }

    // Update appeal
    const updatedAppeal = await prisma.appeal.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: ['APPROVED', 'REJECTED'].includes(status) ? new Date() : null,
        resolvedBy: ['APPROVED', 'REJECTED'].includes(status) ? session.user.id : null,
      },
    });

    // If appeal is approved and it's a suspension appeal, unsuspend the user
    if (status === 'APPROVED' && appeal.type === 'SUSPENSION') {
      await prisma.user.update({
        where: { id: appeal.userId },
        data: {
          suspended: false,
          suspendedAt: null,
          suspensionReason: null,
          suspendedBy: null,
        },
      });
    }

    // Log the action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        action: status === 'APPROVED' ? 'APPROVE_APPEAL' : 'REJECT_APPEAL',
        targetType: 'appeal',
        targetId: id,
        reason: resolution,
      },
    });

    return NextResponse.json({ appeal: updatedAppeal });
  } catch (error) {
    console.error('Error updating appeal:', error);
    return NextResponse.json({ error: 'Failed to update appeal' }, { status: 500 });
  }
}
