// src/app/api/settings/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get current user's notification preferences
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        emailNewMessages: true,
        emailNewInterest: true,
        emailBidUpdates: true,
        emailNewJobs: true,
        emailMarketing: true,
        emailWeeklyDigest: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({
      role: user.role,
      preferences: {
        emailNewMessages: user.emailNewMessages,
        emailNewInterest: user.emailNewInterest,
        emailBidUpdates: user.emailBidUpdates,
        emailNewJobs: user.emailNewJobs,
        emailMarketing: user.emailMarketing,
        emailWeeklyDigest: user.emailWeeklyDigest,
      },
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}

// PUT - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const {
      emailNewMessages,
      emailNewInterest,
      emailBidUpdates,
      emailNewJobs,
      emailMarketing,
      emailWeeklyDigest,
    } = body;

    // Update user's notification preferences
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(typeof emailNewMessages === 'boolean' && { emailNewMessages }),
        ...(typeof emailNewInterest === 'boolean' && { emailNewInterest }),
        ...(typeof emailBidUpdates === 'boolean' && { emailBidUpdates }),
        ...(typeof emailNewJobs === 'boolean' && { emailNewJobs }),
        ...(typeof emailMarketing === 'boolean' && { emailMarketing }),
        ...(typeof emailWeeklyDigest === 'boolean' && { emailWeeklyDigest }),
      },
      select: {
        emailNewMessages: true,
        emailNewInterest: true,
        emailBidUpdates: true,
        emailNewJobs: true,
        emailMarketing: true,
        emailWeeklyDigest: true,
      },
    });

    return NextResponse.json({ success: true, preferences: user });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
