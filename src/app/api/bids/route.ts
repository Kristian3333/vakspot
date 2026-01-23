// src/app/api/bids/route.ts
// This API handles "interests" - PROs expressing interest in a job
// The Bid model is reused but simplified: amount is optional, focus is on messaging

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createBidSchema } from '@/lib/validations';

// GET - List interests (for pro: their interests, for client: interests on their jobs)
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
      // Get pro's interests
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
          conversation: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ bids });
    }

    if (session.user.role === 'CLIENT') {
      // Get interests on client's jobs
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
          conversation: {
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json({ bids });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching interests:', error);
    return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
  }
}

// POST - Express interest in a job (pro only)
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

    const { jobId, message, amount, amountType } = parsed.data;

    // Get pro profile
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!proProfile) {
      return NextResponse.json({ error: 'Pro profile not found' }, { status: 404 });
    }

    // Verify job exists and is available (PUBLISHED or already has interests but not yet accepted)
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    // Allow interest on PUBLISHED jobs (not ACCEPTED, COMPLETED, CANCELLED, etc.)
    const availableStatuses = ['PUBLISHED', 'IN_CONVERSATION'];
    if (!job || !availableStatuses.includes(job.status)) {
      return NextResponse.json({ error: 'Job not available' }, { status: 400 });
    }

    // Check if pro already expressed interest
    const existingBid = await prisma.bid.findUnique({
      where: {
        jobId_proId: { jobId, proId: proProfile.id },
      },
    });

    if (existingBid) {
      return NextResponse.json({ error: 'U heeft al interesse getoond in deze klus' }, { status: 400 });
    }

    // Create interest (bid) and conversation together
    const bid = await prisma.bid.create({
      data: {
        jobId,
        proId: proProfile.id,
        amount: amount || 0, // Default to 0 (price to be discussed)
        amountType: amountType || 'TO_DISCUSS',
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

    // Create initial message in conversation
    if (bid.conversation) {
      await prisma.message.create({
        data: {
          conversationId: bid.conversation.id,
          senderId: session.user.id,
          content: message,
        },
      });
    }

    // DON'T change job status here - keep it PUBLISHED so other PROs can see it
    // Status only changes to ACCEPTED when client accepts a PRO

    return NextResponse.json({ 
      bid,
      conversationId: bid.conversation?.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Error expressing interest:', error);
    return NextResponse.json({ error: 'Failed to express interest' }, { status: 500 });
  }
}
