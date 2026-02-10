// src/app/api/admin/dev-tools/simulate-flow/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { transitionJobStatus } from '@/lib/job-state-machine';
import { z } from 'zod';
import { JobStatus } from '@prisma/client';

const simulateFlowSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  toStatus: z.nativeEnum(JobStatus, { errorMap: () => ({ message: 'Invalid job status' }) }),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check if in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Dev tools only available in development mode' },
        { status: 403 }
      );
    }

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    const body = await request.json();
    const validation = simulateFlowSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { jobId, toStatus, reason } = validation.data;

    // Use the state machine to transition the job status
    const result = await transitionJobStatus({
      jobId,
      toStatus,
      changedBy: 'ADMIN',
      userId: session.user.id,
      reason,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Statusovergang mislukt' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      job: result.job,
      message: `Job status changed to ${toStatus}`,
    });
  } catch (error) {
    console.error('Simulate flow error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan bij het simuleren van de flow' },
      { status: 500 }
    );
  }
}
