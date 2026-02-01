// src/app/api/admin/users/[id]/suspend/route.ts
// P2B Compliance: Account suspension with reason (required by P2B regulation)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const suspendSchema = z.object({
  reason: z.string().min(10, 'Reden moet minimaal 10 tekens bevatten'),
});

const unsuspendSchema = z.object({
  reason: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

// POST - Suspend a user
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = suspendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { reason } = parsed.data;

    // Can't suspend yourself
    if (id === session.user.id) {
      return NextResponse.json({ error: 'U kunt uzelf niet schorsen' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    // Can't suspend other admins
    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'U kunt geen andere admins schorsen' }, { status: 403 });
    }

    // Suspend the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        suspended: true,
        suspendedAt: new Date(),
        suspensionReason: reason,
        suspendedBy: session.user.id,
      },
    });

    // Log the action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        action: 'SUSPEND_USER',
        targetType: 'user',
        targetId: id,
        reason,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Gebruiker is geschorst',
      user: {
        id: updatedUser.id,
        suspended: updatedUser.suspended,
        suspendedAt: updatedUser.suspendedAt,
      },
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json({ error: 'Failed to suspend user' }, { status: 500 });
  }
}

// DELETE - Unsuspend a user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Optionally get reason for unsuspension
    let reason: string | undefined;
    try {
      const body = await request.json();
      const parsed = unsuspendSchema.safeParse(body);
      if (parsed.success) {
        reason = parsed.data.reason;
      }
    } catch {
      // No body provided, that's okay
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    if (!user.suspended) {
      return NextResponse.json({ error: 'Gebruiker is niet geschorst' }, { status: 400 });
    }

    // Unsuspend the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        suspended: false,
        suspendedAt: null,
        suspensionReason: null,
        suspendedBy: null,
      },
    });

    // Log the action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        action: 'UNSUSPEND_USER',
        targetType: 'user',
        targetId: id,
        reason: reason || 'Schorsing opgeheven',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Schorsing is opgeheven',
      user: {
        id: updatedUser.id,
        suspended: updatedUser.suspended,
      },
    });
  } catch (error) {
    console.error('Error unsuspending user:', error);
    return NextResponse.json({ error: 'Failed to unsuspend user' }, { status: 500 });
  }
}
