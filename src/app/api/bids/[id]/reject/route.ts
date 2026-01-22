// src/app/api/bids/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id: bidId } = params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Get the bid with job details
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        job: {
          include: {
            client: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!bid) {
      return NextResponse.json({ error: 'Offerte niet gevonden' }, { status: 404 });
    }

    // Verify the user is the job owner
    if (bid.job.client.user.id !== session.user.id) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    // Check if bid can be rejected
    if (bid.status !== 'PENDING' && bid.status !== 'VIEWED') {
      return NextResponse.json(
        { error: 'Deze offerte kan niet worden afgewezen' },
        { status: 400 }
      );
    }

    // Reject the bid
    await prisma.bid.update({
      where: { id: bidId },
      data: { status: 'REJECTED' },
    });

    // Check if this was called via form submit or fetch
    const acceptHeader = request.headers.get('accept');
    if (acceptHeader?.includes('application/json')) {
      return NextResponse.json({ success: true, message: 'Offerte afgewezen' });
    }

    // Redirect back to the job page
    return NextResponse.redirect(new URL(`/client/jobs/${bid.jobId}`, request.url));
  } catch (error) {
    console.error('Reject bid error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
