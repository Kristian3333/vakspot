// src/app/api/bids/[id]/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendBidAcceptedEmail, sendBidRejectedEmail } from '@/lib/email';

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
        pro: {
          include: { user: true },
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

    // Check if job can accept bids (must be PUBLISHED)
    if (bid.job.status !== 'PUBLISHED') {
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

    // Get all other bids for this job (to send rejection messages)
    const otherBids = await prisma.bid.findMany({
      where: {
        jobId: bid.jobId,
        id: { not: bidId },
        status: { in: ['PENDING', 'VIEWED'] },
      },
      include: {
        conversation: true,
        pro: {
          include: { user: true },
        },
      },
    });

    // Accept the bid and update job status in a transaction
    await prisma.$transaction([
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

    // Send acceptance message to the chosen PRO
    const acceptedConversation = await prisma.conversation.findFirst({
      where: { bidId: bidId },
    });

    if (acceptedConversation) {
      await prisma.message.create({
        data: {
          conversationId: acceptedConversation.id,
          senderId: session.user.id,
          content: `🎉 Goed nieuws! U bent gekozen voor deze klus. Neem gerust contact op om de details te bespreken.`,
        },
      });
      
      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: acceptedConversation.id },
        data: { updatedAt: new Date() },
      });
    }

    // Send rejection messages to all other PROs
    const rejectionMessage = `Bedankt voor uw interesse in "${bid.job.title}". Helaas heeft de opdrachtgever gekozen voor een andere vakman. We wensen u veel succes bij volgende klussen!`;

    for (const otherBid of otherBids) {
      if (otherBid.conversation) {
        await prisma.message.create({
          data: {
            conversationId: otherBid.conversation.id,
            senderId: session.user.id,
            content: rejectionMessage,
          },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: otherBid.conversation.id },
          data: { updatedAt: new Date() },
        });
      }

      // Send rejection email to this PRO (fire-and-forget)
      if (otherBid.pro.user.email) {
        sendBidRejectedEmail({
          to: otherBid.pro.user.email,
          jobTitle: bid.job.title,
        }).catch(console.error);

        // Create in-app notification
        prisma.notification.create({
          data: {
            userId: otherBid.pro.userId,
            type: 'BID_REJECTED',
            title: 'Andere vakman gekozen',
            message: `Helaas is een andere vakman gekozen voor "${bid.job.title}"`,
            link: `/pro/leads`,
          },
        }).catch(console.error);
      }
    }

    // Send acceptance email to the chosen PRO (fire-and-forget)
    if (bid.pro.user.email) {
      sendBidAcceptedEmail({
        to: bid.pro.user.email,
        clientName: bid.job.client.user.name || 'Klant',
        jobTitle: bid.job.title,
        conversationUrl: acceptedConversation ? `/messages/${acceptedConversation.id}` : `/pro/leads`,
      }).catch(console.error);

      // Create in-app notification for accepted PRO
      prisma.notification.create({
        data: {
          userId: bid.pro.userId,
          type: 'BID_ACCEPTED',
          title: 'Gefeliciteerd! Je bent gekozen!',
          message: `Je bent gekozen voor "${bid.job.title}"`,
          link: acceptedConversation ? `/messages/${acceptedConversation.id}` : `/pro/leads`,
        },
      }).catch(console.error);
    }

    // Return JSON response instead of redirect (better for client-side handling)
    return NextResponse.json({ 
      success: true,
      message: 'Vakman geaccepteerd',
      jobId: bid.jobId,
      acceptedProName: bid.pro.companyName || bid.pro.user.name,
      rejectedCount: otherBids.length,
    });
  } catch (error) {
    console.error('Accept bid error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
