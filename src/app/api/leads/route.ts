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
    const showAll = searchParams.get('showAll') === 'true';
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
      status: { in: ['PUBLISHED', 'ACCEPTED'] },
      // Exclude jobs the pro has already bid on (they'll see those in their own list)
      bids: {
        none: { proId: proProfile.id },
      },
    };

    // Category filtering logic:
    // - If specific categoryId is provided, use that
    // - If showAll=true, don't filter by category at all
    // - Otherwise (recommended), use PRO's categories
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (!showAll && proCategoryIds.length > 0) {
      // Only filter by pro's categories when NOT showing all
      where.categoryId = { in: proCategoryIds };
    }
    // If showAll=true and no categoryId, don't add category filter (show everything)

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
        // Fetch more and sort in JS to handle sponsored + status properly
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    // Calculate distance and add interest count
    const now = new Date();
    let processedJobs = jobs.map(job => ({
      ...job,
      interestCount: job._count.bids,
      isAccepted: ['ACCEPTED', 'COMPLETED'].includes(job.status),
      isSponsored: job.sponsoredUntil && new Date(job.sponsoredUntil) > now,
      distance: (proProfile.locationLat && proProfile.locationLng && job.locationLat && job.locationLng)
        ? Math.round(calculateDistance(
            proProfile.locationLat,
            proProfile.locationLng,
            job.locationLat,
            job.locationLng
          ))
        : null,
    }));

    // Sort: sponsored jobs first, then by accepted status, then by date
    processedJobs.sort((a, b) => {
      // 1. Sponsored jobs first
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;

      // 2. If both sponsored, higher sponsor level first
      if (a.isSponsored && b.isSponsored) {
        if ((a.sponsorLevel || 0) !== (b.sponsorLevel || 0)) {
          return (b.sponsorLevel || 0) - (a.sponsorLevel || 0);
        }
      }

      // 3. Available jobs before accepted
      if (a.isAccepted !== b.isAccepted) {
        return a.isAccepted ? 1 : -1;
      }

      // 4. Newer jobs first
      return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
    });

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
