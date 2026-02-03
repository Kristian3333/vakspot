// src/app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateJobSchema } from '@/lib/validations';
import { JobStatus } from '@prisma/client';

interface RouteParams {
  params: { id: string };
}

// GET /api/jobs/[id] - Get job details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const session = await auth();

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        client: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
        images: { orderBy: { order: 'asc' } },
        bids: {
          orderBy: { createdAt: 'desc' },
          include: {
            pro: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
        _count: { select: { bids: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check access
    const isOwner = session?.user?.id === job.client.user.id;
    const isAdmin = session?.user?.role === 'ADMIN';
    const isPro = session?.user?.role === 'PRO';
    // Jobs are available to PROs during active phases (before completion/cancellation)
    const availableStatuses = [
      'CREATED', 'RESPONSES_RECEIVED', 'IN_CONVERSATION', 'QUOTE_RECEIVED',
      'SELECTED', 'SCHEDULED', 'IN_PROGRESS',
      // Legacy statuses for backwards compatibility
      'PUBLISHED', 'ACCEPTED',
    ];
    const isAvailable = availableStatuses.includes(job.status);

    // PROs can view available jobs
    if (!isOwner && !isAdmin && !isAvailable) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Hide sensitive info for non-owners (pros and public viewers)
    if (!isOwner && !isAdmin) {
      const { bids, ...jobWithoutBids } = job;
      return NextResponse.json({
        job: {
          ...jobWithoutBids,
          client: { 
            city: job.client.city,
            user: { name: job.client.user.name } 
          },
        },
      });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Failed to fetch job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id] - Update job
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.client.user.id !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Can only edit jobs that haven't received responses yet
    // In Phase 7, CREATED jobs are auto-published, so we allow edits only before first response
    const editableStatuses: JobStatus[] = [JobStatus.DRAFT, JobStatus.CREATED];
    if (!editableStatuses.includes(job.status)) {
      return NextResponse.json(
        { error: 'Kan alleen klussen bewerken die nog geen reacties hebben' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { categoryId, images, ...directFields } = parsed.data;

    const updateData: Parameters<typeof prisma.job.update>[0]['data'] = {
      ...directFields,
    };

    if (categoryId) {
      updateData.category = { connect: { id: categoryId } };
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      select: { id: true, title: true, status: true },
    });

    if (images && images.length > 0) {
      await prisma.jobImage.deleteMany({ where: { jobId: id } });
      await prisma.jobImage.createMany({
        data: images.map((url, index) => ({
          jobId: id,
          url,
          order: index,
        })),
      });
    }

    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    console.error('Failed to update job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete or cancel job
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
        bids: { select: { id: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.client.user.id !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Can't delete completed, reviewed, or already cancelled jobs
    const nonDeletableStatuses: JobStatus[] = [
      JobStatus.COMPLETED,
      JobStatus.COMPLETED_BY_CONSUMER,
      JobStatus.COMPLETED_BY_PRO,
      JobStatus.REVIEWED,
      JobStatus.CANCELLED_BY_CONSUMER,
      JobStatus.CANCELLED_BY_PRO,
    ];
    if (nonDeletableStatuses.includes(job.status)) {
      return NextResponse.json(
        { error: 'Deze klus kan niet meer worden verwijderd' },
        { status: 400 }
      );
    }

    // If job has no bids, delete it completely
    if (job.bids.length === 0) {
      // Delete related records first (images)
      await prisma.jobImage.deleteMany({ where: { jobId: id } });
      
      // Delete the job
      await prisma.job.delete({ where: { id } });

      return NextResponse.json({ deleted: true, message: 'Klus verwijderd' });
    }

    // If job has bids/conversations, mark as cancelled by consumer
    const cancelledJob = await prisma.job.update({
      where: { id },
      data: {
        status: JobStatus.CANCELLED_BY_CONSUMER,
        cancelledAt: new Date(),
        statusChangedAt: new Date(),
        statusChangedBy: 'CONSUMER',
      },
      select: { id: true, status: true },
    });

    // Log to status history
    await prisma.statusHistory.create({
      data: {
        jobId: id,
        fromStatus: job.status,
        toStatus: JobStatus.CANCELLED_BY_CONSUMER,
        changedBy: 'CONSUMER',
        userId: session.user.id,
        reason: 'Klus verwijderd door opdrachtgever',
      },
    });

    return NextResponse.json({
      job: cancelledJob,
      message: 'Klus geannuleerd (had al reacties)'
    });
  } catch (error) {
    console.error('Failed to delete job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
