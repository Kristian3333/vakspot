// src/app/api/admin/verify/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    const body = await request.json();
    const { verified } = body;

    if (typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'Ongeldige waarde' }, { status: 400 });
    }

    const proProfile = await prisma.proProfile.update({
      where: { id },
      data: { verified },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // TODO: Send email notification to pro about verification status

    return NextResponse.json({ proProfile });
  } catch (error) {
    console.error('Update verification error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
