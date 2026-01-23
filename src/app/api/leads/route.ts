// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateDistance } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'PRO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const maxDistance = searchParams.get('maxDistance');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get pro profile with categories
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        categories: { select: { categoryId: true } },
      },
    });

    if (!proProfile) {
      return NextResponse.json({ error: 'Pro profile not found' }, { status: 404 });
    }

    const proCategoryIds = proProfile.categories.map(c => c.categoryId);

    // Build query filters
    // Show all jobs that are available or accepted (not cancelled/completed)
    // This lets PROs see the market even for taken jobs
    const where: any = {
      status: { in: ['PUBLISHED', 'IN_CONVERSATION', 'ACCEPTED', 'IN_PROGRESS'] },
      // Exclude jobs the pro has already bid on (they'll see those in their own list)
      bids: {
        none: { proId: proProfile.id },
      },
    };

    // Only filter by category if specified or if pro has categories
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (proCategoryIds.length > 0) {
      where.categoryId = { in: proCategoryIds };
    }

    // Fetch jobs with interest count
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          images: { select: { id: true, url: true }, take: 1 },
          client: {
            select: {
              city: true,
              user: { select: { name: true } },
            },
          },
          _count: { select: { bids: true } },
        },
        orderBy: [
          // Show available jobs first, then accepted ones
          { status: 'asc' },
          { publishedAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    // Calculate distance and add interest count
    let processedJobs = jobs.map(job => ({
      ...job,
      interestCount: job._count.bids,
      isAccepted: ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(job.status),
      distance: (proProfile.locationLat && proProfile.locationLng && job.locationLat && job.locationLng)
        ? Math.round(calculateDistance(
            proProfile.locationLat,
            proProfile.locationLng,
            job.locationLat,
            job.locationLng
          ))
        : null,
    }));

    // Filter by distance if maxDistance is specified
    if (proProfile.locationLat && proProfile.locationLng && maxDistance) {
      const maxDist = parseInt(maxDistance);
      processedJobs = processedJobs.filter(job => {
        if (job.distance === null) return true;
        return job.distance <= maxDist;
      });
    }

    return NextResponse.json({
      leads: processedJobs,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
