// src/app/api/bids/[id]/accept/route.ts
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

    // Check if job can accept bids
    if (!['PUBLISHED', 'IN_CONVERSATION'].includes(bid.job.status)) {
      return NextResponse.json(
        { error: 'Deze klus kan geen offertes meer accepteren' },
        { status: 400 }
      );
    }

    // Check if bid is still pending
    if (bid.status !== 'PENDING' && bid.status !== 'VIEWED') {
      return NextResponse.json(
        { error: 'Deze offerte kan niet worden geaccepteerd' },
        { status: 400 }
      );
    }

    // Accept the bid and update job status in a transaction
    const [updatedBid, updatedJob] = await prisma.$transaction([
      // Accept this bid
      prisma.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      }),
      // Update job status and link accepted bid
      prisma.job.update({
        where: { id: bid.jobId },
        data: {
          status: 'ACCEPTED',
          acceptedBidId: bidId,
        },
      }),
      // Reject all other pending bids for this job
      prisma.bid.updateMany({
        where: {
          jobId: bid.jobId,
          id: { not: bidId },
          status: { in: ['PENDING', 'VIEWED'] },
        },
        data: { status: 'REJECTED' },
      }),
    ]);

    // Create a conversation if one doesn't exist
    const existingConversation = await prisma.conversation.findFirst({
      where: { bidId: bidId },
    });

    if (!existingConversation) {
      await prisma.conversation.create({
        data: {
          bidId: bidId,
          messages: {
            create: {
              senderId: session.user.id,
              content: `Uw offerte van €${(bid.amount / 100).toFixed(2)} is geaccepteerd! U kunt nu direct contact opnemen.`,
            },
          },
        },
      });
    }

    // Redirect back to the job page
    return NextResponse.redirect(new URL(`/client/jobs/${bid.jobId}`, request.url));
  } catch (error) {
    console.error('Accept bid error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
