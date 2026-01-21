// src/app/api/jobs/[id]/publish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id: jobId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Get the job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: {
          include: { user: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Klus niet gevonden' }, { status: 404 });
    }

    // Verify ownership
    if (job.client.user.id !== session.user.id) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    // Check if job is in draft status
    if (job.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Deze klus is al gepubliceerd' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!job.title || !job.description || !job.categoryId) {
      return NextResponse.json(
        { error: 'Vul alle verplichte velden in voordat u publiceert' },
        { status: 400 }
      );
    }

    // Publish the job
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    // Redirect back to the job page
    return NextResponse.redirect(new URL(`/client/jobs/${jobId}`, request.url));
  } catch (error) {
    console.error('Publish job error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
