// src/app/api/bids/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createBidSchema } from '@/lib/validations';

// GET - List bids (for pro: their bids, for client: bids on their jobs)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    if (session.user.role === 'PRO') {
      // Get pro's bids
      const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!proProfile) {
        return NextResponse.json({ error: 'Pro profile not found' }, { status: 404 });
      }

      const where: any = { proId: proProfile.id };
      if (status) where.status = status;

      const bids = await prisma.bid.findMany({
        where,
        include: {
          job: {
            include: {
              category: { select: { id: true, name: true, icon: true } },
              client: {
                select: {
                  city: true,
                  user: { select: { name: true } },
                },
              },
              images: { select: { url: true }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ bids });
    }

    if (session.user.role === 'CLIENT') {
      // Get bids on client's jobs
      if (!jobId) {
        return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
      }

      // Verify job belongs to client
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          client: { userId: session.user.id },
        },
      });

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const bids = await prisma.bid.findMany({
        where: { jobId },
        include: {
          pro: {
            include: {
              user: { select: { name: true, image: true } },
              categories: {
                include: { category: { select: { name: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ bids });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching bids:', error);
    return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 });
  }
}

// POST - Create a bid (pro only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'PRO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createBidSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { jobId, amount, amountType, message } = parsed.data;

    // Get pro profile
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!proProfile) {
      return NextResponse.json({ error: 'Pro profile not found' }, { status: 404 });
    }

    // Verify job exists and is published
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Job not available for bidding' }, { status: 400 });
    }

    // Check if pro already bid on this job
    const existingBid = await prisma.bid.findUnique({
      where: {
        jobId_proId: { jobId, proId: proProfile.id },
      },
    });

    if (existingBid) {
      return NextResponse.json({ error: 'You have already bid on this job' }, { status: 400 });
    }

    // Create bid and conversation
    const bid = await prisma.bid.create({
      data: {
        jobId,
        proId: proProfile.id,
        amount,
        amountType,
        message,
        conversation: {
          create: {},
        },
      },
      include: {
        conversation: true,
        job: {
          select: { title: true },
        },
      },
    });

    // Update job status if first bid
    const bidCount = await prisma.bid.count({ where: { jobId } });
    if (bidCount === 1) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'IN_CONVERSATION' },
      });
    }

    return NextResponse.json({ bid }, { status: 201 });
  } catch (error) {
    console.error('Error creating bid:', error);
    return NextResponse.json({ error: 'Failed to create bid' }, { status: 500 });
  }
}
