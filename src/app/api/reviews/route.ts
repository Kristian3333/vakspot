// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createReviewSchema } from '@/lib/validations';

// GET - Get reviews for a pro
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proId = searchParams.get('proId');

    if (!proId) {
      return NextResponse.json({ error: 'Pro ID required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { proId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            category: { select: { name: true } },
            client: {
              select: { user: { select: { name: true, image: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST - Create a review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { jobId, rating, title, content, qualityRating, communicationRating, timelinessRating, valueRating } = parsed.data;

    // Verify job belongs to client and is completed
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        client: { userId: session.user.id },
        status: { in: ['COMPLETED', 'ACCEPTED'] },
      },
      include: {
        acceptedBid: { select: { proId: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found or not eligible for review' }, { status: 400 });
    }

    if (!job.acceptedBid) {
      return NextResponse.json({ error: 'No accepted bid found' }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { jobId },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'Review already exists for this job' }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        jobId,
        proId: job.acceptedBid.proId,
        rating,
        title,
        content,
        qualityRating,
        communicationRating,
        timelinessRating,
        valueRating,
      },
    });

    // Update job status
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'REVIEWED' },
    });

    // Update pro's average rating
    const allReviews = await prisma.review.findMany({
      where: { proId: job.acceptedBid.proId },
      select: { rating: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.proProfile.update({
      where: { id: job.acceptedBid.proId },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
