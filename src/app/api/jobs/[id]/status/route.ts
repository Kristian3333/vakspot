// src/app/api/jobs/[id]/status/route.ts
// Job Status Transition API for Phase 7

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { JobStatus, StatusChangedBy } from '@prisma/client';
import { transitionJobStatus, isValidTransition } from '@/lib/job-state-machine';
import {
  sendProSelectedEmail,
  sendJobScheduledEmail,
  sendWorkStartedEmail,
  sendJobCompletedEmail,
  sendJobCancelledEmail,
} from '@/lib/email';

// POST - Transition job status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const jobId = params.id;
    const body = await request.json();
    const { toStatus, reason, startDate } = body;

    if (!toStatus) {
      return NextResponse.json({ error: 'Status is verplicht' }, { status: 400 });
    }

    // Get the job with related data
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: { include: { user: true } },
        acceptedBid: { include: { pro: { include: { user: true } } } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Klus niet gevonden' }, { status: 404 });
    }

    // Determine who is making the change and if they're authorized
    const isClient = job.client.user.id === session.user.id;
    const isPro = job.acceptedBid?.pro.user.id === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isClient && !isPro && !isAdmin) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    // Validate the requested transition
    if (!isValidTransition(job.status, toStatus as JobStatus)) {
      return NextResponse.json(
        { error: `Ongeldige statusovergang van ${job.status} naar ${toStatus}` },
        { status: 400 }
      );
    }

    // Determine changedBy based on who's making the request
    let changedBy: StatusChangedBy;
    if (isAdmin) {
      changedBy = 'ADMIN';
    } else if (isPro) {
      changedBy = 'PROFESSIONAL';
    } else {
      changedBy = 'CONSUMER';
    }

    // Validate PRO-specific actions
    const proOnlyStatuses: JobStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED_BY_PRO', 'CANCELLED_BY_PRO'];
    if (proOnlyStatuses.includes(toStatus as JobStatus) && !isPro && !isAdmin) {
      return NextResponse.json(
        { error: 'Alleen de vakman kan deze actie uitvoeren' },
        { status: 403 }
      );
    }

    // Validate consumer-specific actions
    const consumerOnlyStatuses: JobStatus[] = ['COMPLETED_BY_CONSUMER', 'CANCELLED_BY_CONSUMER'];
    if (consumerOnlyStatuses.includes(toStatus as JobStatus) && !isClient && !isAdmin) {
      return NextResponse.json(
        { error: 'Alleen de opdrachtgever kan deze actie uitvoeren' },
        { status: 403 }
      );
    }

    // Build additional data
    const additionalData: Record<string, any> = {};

    // Handle scheduled status with start date
    if (toStatus === 'SCHEDULED' && startDate) {
      additionalData.startDate = new Date(startDate);
    }

    // Execute the transition
    const result = await transitionJobStatus({
      jobId,
      toStatus: toStatus as JobStatus,
      changedBy,
      userId: session.user.id,
      reason,
      additionalData,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Phase 7.8: Send email notifications based on status change
    const conversationUrl = job.acceptedBid
      ? await prisma.conversation.findUnique({
          where: { bidId: job.acceptedBid.id },
          select: { id: true },
        }).then(conv => conv ? `/messages/${conv.id}` : '/pro/jobs')
      : '/pro/jobs';

    // Send emails based on the status transition (fire-and-forget)
    try {
      switch (toStatus) {
        case 'SELECTED':
          // Notify PRO that they were selected
          if (job.acceptedBid?.pro.user.email && job.acceptedBid.pro.user.emailBidUpdates) {
            sendProSelectedEmail({
              to: job.acceptedBid.pro.user.email,
              proName: job.acceptedBid.pro.user.name || 'Vakman',
              clientName: job.client.user.name || 'Klant',
              jobTitle: job.title,
              conversationUrl,
            }).catch(console.error);
          }
          break;

        case 'SCHEDULED':
          // Notify both parties about the scheduled date
          const scheduledDate = additionalData.startDate || new Date();
          // Notify client
          if (job.client.user.email && job.client.user.emailBidUpdates) {
            sendJobScheduledEmail({
              to: job.client.user.email,
              recipientName: job.client.user.name || 'Klant',
              jobTitle: job.title,
              startDate: scheduledDate,
              conversationUrl,
              isClient: true,
            }).catch(console.error);
          }
          // Notify PRO (confirmation)
          if (job.acceptedBid?.pro.user.email && job.acceptedBid.pro.user.emailBidUpdates) {
            sendJobScheduledEmail({
              to: job.acceptedBid.pro.user.email,
              recipientName: job.acceptedBid.pro.user.name || 'Vakman',
              jobTitle: job.title,
              startDate: scheduledDate,
              conversationUrl,
              isClient: false,
            }).catch(console.error);
          }
          break;

        case 'IN_PROGRESS':
          // Notify client that work has started
          if (job.client.user.email && job.client.user.emailBidUpdates) {
            sendWorkStartedEmail({
              to: job.client.user.email,
              recipientName: job.client.user.name || 'Klant',
              jobTitle: job.title,
              conversationUrl,
            }).catch(console.error);
          }
          break;

        case 'COMPLETED_BY_PRO':
          // Notify client that PRO marked job complete
          if (job.client.user.email && job.client.user.emailBidUpdates) {
            sendJobCompletedEmail({
              to: job.client.user.email,
              recipientName: job.client.user.name || 'Klant',
              jobTitle: job.title,
              completedBy: 'pro',
              conversationUrl,
              reviewUrl: `/client/jobs/${jobId}/review`,
            }).catch(console.error);
          }
          break;

        case 'COMPLETED_BY_CONSUMER':
          // Notify PRO that client marked job complete
          if (job.acceptedBid?.pro.user.email && job.acceptedBid.pro.user.emailBidUpdates) {
            sendJobCompletedEmail({
              to: job.acceptedBid.pro.user.email,
              recipientName: job.acceptedBid.pro.user.name || 'Vakman',
              jobTitle: job.title,
              completedBy: 'consumer',
              conversationUrl,
            }).catch(console.error);
          }
          break;

        case 'CANCELLED_BY_PRO':
          // Notify client that PRO cancelled
          if (job.client.user.email && job.client.user.emailBidUpdates) {
            sendJobCancelledEmail({
              to: job.client.user.email,
              recipientName: job.client.user.name || 'Klant',
              jobTitle: job.title,
              cancelledBy: 'pro',
              reason,
            }).catch(console.error);
          }
          break;

        case 'CANCELLED_BY_CONSUMER':
          // Notify PRO that client cancelled
          if (job.acceptedBid?.pro.user.email && job.acceptedBid.pro.user.emailBidUpdates) {
            sendJobCancelledEmail({
              to: job.acceptedBid.pro.user.email,
              recipientName: job.acceptedBid.pro.user.name || 'Vakman',
              jobTitle: job.title,
              cancelledBy: 'consumer',
              reason,
            }).catch(console.error);
          }
          break;
      }
    } catch (emailError) {
      console.error('Failed to send status change email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      job: result.job,
      message: `Status bijgewerkt naar ${toStatus}`,
    });
  } catch (error) {
    console.error('Job status transition error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}

// GET - Get status history for a job
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const jobId = params.id;

    // Get the job to verify access
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: { include: { user: true } },
        acceptedBid: { include: { pro: { include: { user: true } } } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Klus niet gevonden' }, { status: 404 });
    }

    // Check authorization
    const isClient = job.client.user.id === session.user.id;
    const isPro = job.acceptedBid?.pro.user.id === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isClient && !isPro && !isAdmin) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    // Get status history
    const history = await prisma.statusHistory.findMany({
      where: { jobId },
      orderBy: { changedAt: 'desc' },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Get status history error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
