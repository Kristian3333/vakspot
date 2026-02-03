// src/app/api/quotes/route.ts
// Phase 7: Formal quote feature for PROs

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createQuoteSchema = z.object({
  bidId: z.string().min(1),
  amount: z.number().min(0),
  amountType: z.enum(['FIXED', 'ESTIMATE', 'HOURLY', 'TO_DISCUSS']).default('ESTIMATE'),
  description: z.string().min(10).max(2000),
  validDays: z.number().min(1).max(90).default(14), // Quote valid for X days
});

// GET - Get quotes for a PRO or bid
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bidId = searchParams.get('bidId');

    if (session.user.role === 'PRO') {
      // Get PRO's quotes
      const proProfile = await prisma.proProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!proProfile) {
        return NextResponse.json({ error: 'Pro profile not found' }, { status: 404 });
      }

      const quotes = await prisma.quote.findMany({
        where: {
          bid: { proId: proProfile.id },
          ...(bidId && { bidId }),
        },
        include: {
          bid: {
            include: {
              job: {
                select: { id: true, title: true, status: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ quotes });
    }

    if (session.user.role === 'CLIENT') {
      // Get quotes for client's jobs
      const quotes = await prisma.quote.findMany({
        where: {
          bid: {
            job: {
              client: { userId: session.user.id },
            },
          },
          ...(bidId && { bidId }),
        },
        include: {
          bid: {
            include: {
              job: {
                select: { id: true, title: true, status: true },
              },
              pro: {
                include: {
                  user: { select: { name: true, image: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ quotes });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 403 });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

// POST - Create a new quote (PRO only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'PRO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createQuoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { bidId, amount, amountType, description, validDays } = parsed.data;

    // Verify the bid belongs to this PRO
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!proProfile) {
      return NextResponse.json({ error: 'Pro profile not found' }, { status: 404 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        job: {
          select: { id: true, status: true, title: true },
        },
      },
    });

    if (!bid || bid.proId !== proProfile.id) {
      return NextResponse.json({ error: 'Bid not found or not yours' }, { status: 404 });
    }

    // Check if job is in a valid state for quotes
    const validStatuses = ['CREATED', 'RESPONSES_RECEIVED', 'IN_CONVERSATION', 'QUOTE_RECEIVED', 'PUBLISHED'];
    if (!validStatuses.includes(bid.job.status)) {
      return NextResponse.json(
        { error: 'Kan geen offerte sturen voor deze klus' },
        { status: 400 }
      );
    }

    // Check if there's already a pending quote from this PRO for this bid
    const existingQuote = await prisma.quote.findFirst({
      where: {
        bidId,
        status: 'PENDING',
      },
    });

    if (existingQuote) {
      return NextResponse.json(
        { error: 'U heeft al een openstaande offerte voor deze klus' },
        { status: 400 }
      );
    }

    // Calculate valid until date
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    // Create the quote
    const quote = await prisma.quote.create({
      data: {
        bidId,
        amount,
        amountType,
        description,
        validUntil,
      },
    });

    // Phase 7: Auto-transition job to QUOTE_RECEIVED
    if (bid.job.status !== 'QUOTE_RECEIVED') {
      const previousStatus = bid.job.status;
      await prisma.job.update({
        where: { id: bid.job.id },
        data: {
          status: 'QUOTE_RECEIVED',
          statusChangedAt: new Date(),
          statusChangedBy: 'PROFESSIONAL',
        },
      });

      // Log status transition
      await prisma.statusHistory.create({
        data: {
          jobId: bid.job.id,
          fromStatus: previousStatus as any,
          toStatus: 'QUOTE_RECEIVED',
          changedBy: 'PROFESSIONAL',
          userId: session.user.id,
          reason: `Offerte ontvangen van ${proProfile.companyName}`,
        },
      });
    }

    // Create a system message in the conversation about the quote
    const conversation = await prisma.conversation.findUnique({
      where: { bidId },
    });

    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content: `📋 **Nieuwe offerte ontvangen**\n\nBedrag: €${(amount / 100).toFixed(2)} (${amountType === 'FIXED' ? 'Vaste prijs' : amountType === 'ESTIMATE' ? 'Schatting' : amountType === 'HOURLY' ? 'Uurtarief' : 'In overleg'})\nGeldig tot: ${validUntil.toLocaleDateString('nl-NL')}\n\n${description}`,
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}
