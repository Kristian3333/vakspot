// src/app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { updateJobSchema } from '@/lib/validations';
import { JobStatus } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/jobs/[id] - Get job details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const isPublic = job.status === JobStatus.PUBLISHED;

    if (!isOwner && !isAdmin && !isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Hide sensitive info for non-owners
    if (!isOwner && !isAdmin) {
      // Remove client details for public view
      const { client, ...publicJob } = job;
      return NextResponse.json({
        ...publicJob,
        client: { user: { name: client.user.name } },
      });
    }

    return NextResponse.json(job);
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
    const { id } = await params;
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

    // Can only edit draft jobs
    if (job.status !== JobStatus.DRAFT) {
      return NextResponse.json(
        { error: 'Can only edit draft jobs' },
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

    const updatedJob = await prisma.job.update({
      where: { id },
      data: parsed.data,
      select: { id: true, title: true, status: true },
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Failed to update job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Cancel job
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Can't cancel completed or already cancelled jobs
    if ([JobStatus.COMPLETED, JobStatus.CANCELLED, JobStatus.REVIEWED].includes(job.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel this job' },
        { status: 400 }
      );
    }

    // Mark as cancelled instead of deleting
    const cancelledJob = await prisma.job.update({
      where: { id },
      data: { status: JobStatus.CANCELLED },
      select: { id: true, status: true },
    });

    return NextResponse.json(cancelledJob);
  } catch (error) {
    console.error('Failed to cancel job:', error);
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
}
