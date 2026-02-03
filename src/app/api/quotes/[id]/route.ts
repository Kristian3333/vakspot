// src/app/api/quotes/[id]/route.ts
// Phase 7: Accept/reject quote

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

// GET - Get quote details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        bid: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true,
                client: { select: { userId: true } },
              },
            },
            pro: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Verify access
    const isClient = quote.bid.job.client.userId === session.user.id;
    const isPro = quote.bid.pro.user.id === session.user.id;

    if (!isClient && !isPro && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

// POST - Accept or reject a quote (client only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const session = await auth();

    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body as { action: 'accept' | 'reject' };

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        bid: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                status: true,
                client: { select: { userId: true } },
              },
            },
            pro: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Verify ownership
    if (quote.bid.job.client.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check quote status
    if (quote.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Deze offerte kan niet meer worden gewijzigd' },
        { status: 400 }
      );
    }

    // Check if quote expired
    if (new Date() > new Date(quote.validUntil)) {
      await prisma.quote.update({
        where: { id },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: 'Deze offerte is verlopen' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      // Accept the quote - this also accepts the bid and selects the PRO
      await prisma.$transaction([
        // Update quote status
        prisma.quote.update({
          where: { id },
          data: {
            status: 'ACCEPTED',
            acceptedAt: new Date(),
          },
        }),
        // Accept the bid
        prisma.bid.update({
          where: { id: quote.bidId },
          data: { status: 'ACCEPTED' },
        }),
        // Update job to SELECTED status
        prisma.job.update({
          where: { id: quote.bid.job.id },
          data: {
            status: 'SELECTED',
            acceptedBidId: quote.bidId,
            statusChangedAt: new Date(),
            statusChangedBy: 'CONSUMER',
          },
        }),
        // Reject all other pending bids
        prisma.bid.updateMany({
          where: {
            jobId: quote.bid.job.id,
            id: { not: quote.bidId },
            status: { in: ['PENDING', 'VIEWED'] },
          },
          data: { status: 'REJECTED' },
        }),
      ]);

      // Log status transition
      await prisma.statusHistory.create({
        data: {
          jobId: quote.bid.job.id,
          fromStatus: quote.bid.job.status as any,
          toStatus: 'SELECTED',
          changedBy: 'CONSUMER',
          userId: session.user.id,
          reason: `Offerte geaccepteerd van ${quote.bid.pro.companyName}`,
        },
      });

      // Send message in conversation
      const conversation = await prisma.conversation.findUnique({
        where: { bidId: quote.bidId },
      });

      if (conversation) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: session.user.id,
            content: `✅ **Offerte geaccepteerd!**\n\nU bent gekozen voor deze klus. Neem contact op om de details te bespreken.`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Offerte geaccepteerd',
        jobId: quote.bid.job.id,
      });
    } else {
      // Reject the quote
      await prisma.quote.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
        },
      });

      // Send message in conversation
      const conversation = await prisma.conversation.findUnique({
        where: { bidId: quote.bidId },
      });

      if (conversation) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: session.user.id,
            content: `❌ **Offerte afgewezen**\n\nDe opdrachtgever heeft besloten niet door te gaan met deze offerte. U kunt eventueel een aangepaste offerte sturen.`,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Offerte afgewezen',
      });
    }
  } catch (error) {
    console.error('Error processing quote action:', error);
    return NextResponse.json({ error: 'Failed to process quote' }, { status: 500 });
  }
}

// DELETE - Withdraw a quote (PRO only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const session = await auth();

    if (!session || session.user.role !== 'PRO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!proProfile) {
      return NextResponse.json({ error: 'Pro profile not found' }, { status: 404 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        bid: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (quote.bid.proId !== proProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (quote.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Kan alleen openstaande offertes intrekken' },
        { status: 400 }
      );
    }

    await prisma.quote.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });

    // Send message in conversation
    const conversation = await prisma.conversation.findUnique({
      where: { bidId: quote.bidId },
    });

    if (conversation) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content: `⏪ **Offerte ingetrokken**\n\nDe vakman heeft de offerte ingetrokken.`,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Offerte ingetrokken' });
  } catch (error) {
    console.error('Error withdrawing quote:', error);
    return NextResponse.json({ error: 'Failed to withdraw quote' }, { status: 500 });
  }
}
