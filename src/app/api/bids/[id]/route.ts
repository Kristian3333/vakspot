// src/app/api/bids/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get bid details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      include: {
        pro: {
          include: {
            user: { select: { name: true, image: true } },
            categories: { include: { category: true } },
            reviews: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: {
                job: { select: { title: true } },
              },
            },
          },
        },
        job: {
          include: {
            category: true,
            client: {
              include: { user: { select: { name: true } } },
            },
          },
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              include: {
                sender: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Check authorization
    const isProOwner = session.user.role === 'PRO' && bid.pro.userId === session.user.id;
    const isClientOwner = session.user.role === 'CLIENT' && bid.job.client.userId === session.user.id;
    
    if (!isProOwner && !isClientOwner && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark bid as viewed if client is viewing
    if (isClientOwner && bid.status === 'PENDING') {
      await prisma.bid.update({
        where: { id: params.id },
        data: { status: 'VIEWED', viewedAt: new Date() },
      });
    }

    return NextResponse.json({ bid });
  } catch (error) {
    console.error('Error fetching bid:', error);
    return NextResponse.json({ error: 'Failed to fetch bid' }, { status: 500 });
  }
}

// PATCH - Update bid status (accept/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body; // 'accept', 'reject', 'withdraw'

    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      include: {
        pro: true,
        job: {
          include: { client: true },
        },
      },
    });

    if (!bid) {
      return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
    }

    // Handle different actions based on role
    if (action === 'accept') {
      // Only client can accept
      if (session.user.role !== 'CLIENT' || bid.job.client.userId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Update bid and job in transaction
      const [updatedBid] = await prisma.$transaction([
        prisma.bid.update({
          where: { id: params.id },
          data: { status: 'ACCEPTED' },
        }),
        prisma.job.update({
          where: { id: bid.jobId },
          data: {
            status: 'ACCEPTED',
            acceptedBidId: params.id,
          },
        }),
        // Reject all other bids
        prisma.bid.updateMany({
          where: {
            jobId: bid.jobId,
            id: { not: params.id },
            status: { in: ['PENDING', 'VIEWED'] },
          },
          data: { status: 'REJECTED' },
        }),
      ]);

      return NextResponse.json({ bid: updatedBid });
    }

    if (action === 'reject') {
      // Only client can reject
      if (session.user.role !== 'CLIENT' || bid.job.client.userId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const updatedBid = await prisma.bid.update({
        where: { id: params.id },
        data: { status: 'REJECTED' },
      });

      return NextResponse.json({ bid: updatedBid });
    }

    if (action === 'withdraw') {
      // Only pro can withdraw their own bid
      if (session.user.role !== 'PRO' || bid.pro.userId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (bid.status === 'ACCEPTED') {
        return NextResponse.json({ error: 'Cannot withdraw accepted bid' }, { status: 400 });
      }

      const updatedBid = await prisma.bid.update({
        where: { id: params.id },
        data: { status: 'WITHDRAWN' },
      });

      return NextResponse.json({ bid: updatedBid });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating bid:', error);
    return NextResponse.json({ error: 'Failed to update bid' }, { status: 500 });
  }
}
