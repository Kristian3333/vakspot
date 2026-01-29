// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createJobSchema } from '@/lib/validations';
import { JobStatus } from '@prisma/client';
import { geocodePostcode } from '@/lib/geo/dutch-postcodes';

// GET /api/jobs - List jobs (for client's own jobs or public published jobs)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') as JobStatus | null;
    const categoryId = searchParams.get('categoryId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // If authenticated, get user's jobs
    if (session?.user?.role === 'CLIENT') {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!clientProfile) {
        return NextResponse.json({ jobs: [], total: 0 });
      }

      const where = {
        clientId: clientProfile.id,
        ...(status && { status }),
        ...(categoryId && { categoryId }),
      };

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            title: true,
            status: true,
            budgetMin: true,
            budgetMax: true,
            budgetType: true,
            locationCity: true,
            timeline: true,
            createdAt: true,
            publishedAt: true,
            category: {
              select: { id: true, name: true, slug: true, icon: true },
            },
            images: {
              select: { id: true, url: true },
              take: 1,
              orderBy: { order: 'asc' },
            },
            _count: {
              select: { bids: true },
            },
          },
        }),
        prisma.job.count({ where }),
      ]);

      return NextResponse.json({
        jobs,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    // Public endpoint - only published jobs
    const where = {
      status: JobStatus.PUBLISHED,
      ...(categoryId && { categoryId }),
    };

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        budgetMin: true,
        budgetMax: true,
        budgetType: true,
        locationCity: true,
        timeline: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        images: {
          select: { id: true, url: true },
          take: 1,
        },
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job (auto-publish)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'CLIENT' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only clients can create jobs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get or create client profile
    let clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!clientProfile) {
      clientProfile = await prisma.clientProfile.create({
        data: { userId: session.user.id },
      });
    }

    const {
      title,
      description,
      categoryId,
      budgetMin,
      budgetMax,
      budgetType,
      locationCity,
      locationPostcode,
      locationAddress,
      timeline,
      startDate,
      images,
    } = parsed.data;

    // Geocode postal code to get coordinates
    const coords = geocodePostcode(locationPostcode);
    const locationLat = coords?.lat || null;
    const locationLng = coords?.lng || null;

    // Create the job (auto-publish)
    const job = await prisma.job.create({
      data: {
        title,
        description,
        categoryId,
        clientId: clientProfile.id,
        budgetMin: budgetMin || null,
        budgetMax: budgetMax || null,
        budgetType: budgetType || 'TO_DISCUSS',
        locationCity,
        locationPostcode,
        locationAddress: locationAddress || null,
        locationLat,
        locationLng,
        timeline: timeline || 'FLEXIBLE',
        startDate: startDate || null,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        // Create images if provided
        ...(images && images.length > 0 && {
          images: {
            create: (images as string[]).map((url: string, index: number) => ({
              url,
              order: index,
            })),
          },
        }),
      },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Failed to create job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
