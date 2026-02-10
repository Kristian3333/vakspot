// src/app/api/admin/dev-tools/switch-role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const switchRoleSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Check if in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Dev tools only available in development mode' },
        { status: 403 }
      );
    }

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    const body = await request.json();
    const validation = switchRoleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId } = validation.data;

    // Get the target user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        suspended: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    // Return user data for role switching
    // In a real implementation, this would update the session
    // For dev tools, we just return the user data
    return NextResponse.json({
      user,
      message: `Switched to user: ${user.email} (${user.role})`,
    });
  } catch (error) {
    console.error('Switch role error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
