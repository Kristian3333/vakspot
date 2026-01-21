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
    const limit = parseInt(searchParams.get('limit') || '10');

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
    const where: any = {
      status: 'PUBLISHED',
      // Exclude jobs the pro has already bid on
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
    // If no categories specified and pro has no categories, show all published jobs

    // Fetch jobs
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
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    // Filter by distance if pro has location and maxDistance is specified
    let filteredJobs = jobs;
    if (proProfile.locationLat && proProfile.locationLng && maxDistance) {
      const maxDist = parseInt(maxDistance);
      
      filteredJobs = jobs.filter(job => {
        if (!job.locationLat || !job.locationLng) return true;
        const distance = calculateDistance(
          proProfile.locationLat!,
          proProfile.locationLng!,
          job.locationLat,
          job.locationLng
        );
        return distance <= maxDist;
      }).map(job => ({
        ...job,
        distance: job.locationLat && job.locationLng
          ? Math.round(calculateDistance(
              proProfile.locationLat!,
              proProfile.locationLng!,
              job.locationLat,
              job.locationLng
            ))
          : null,
      }));
    }

    return NextResponse.json({
      leads: filteredJobs,
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
