// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    // Get user stats
    const [totalUsers, clientCount, proCount, adminCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'PRO' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    // Get job stats (Phase 7 statuses)
    // Active = CREATED, RESPONSES_RECEIVED, IN_CONVERSATION, QUOTE_RECEIVED (+ legacy PUBLISHED)
    // In Progress = SELECTED, SCHEDULED, IN_PROGRESS (+ legacy ACCEPTED)
    // Completed = COMPLETED_BY_CONSUMER, COMPLETED_BY_PRO, REVIEWED (+ legacy COMPLETED)
    const [totalJobs, activeJobs, inProgressJobs, completedJobs] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({
        where: {
          status: { in: ['CREATED', 'RESPONSES_RECEIVED', 'IN_CONVERSATION', 'QUOTE_RECEIVED', 'PUBLISHED', 'DRAFT'] },
        },
      }),
      prisma.job.count({
        where: {
          status: { in: ['SELECTED', 'SCHEDULED', 'IN_PROGRESS', 'ACCEPTED'] },
        },
      }),
      prisma.job.count({
        where: {
          status: { in: ['COMPLETED_BY_CONSUMER', 'COMPLETED_BY_PRO', 'COMPLETED', 'REVIEWED'] },
        },
      }),
    ]);

    // Get bid stats
    const [totalBids, acceptedBids, pendingBids] = await Promise.all([
      prisma.bid.count(),
      prisma.bid.count({ where: { status: 'ACCEPTED' } }),
      prisma.bid.count({ where: { status: { in: ['PENDING', 'VIEWED'] } } }),
    ]);

    // Get review stats
    const reviewStats = await prisma.review.aggregate({
      _count: true,
      _avg: { rating: true },
    });

    // Get recent activity
    const recentJobs = await prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        client: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
    });

    const recentBids = await prisma.bid.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        pro: {
          select: {
            companyName: true,
            user: { select: { name: true } },
          },
        },
        job: {
          select: { title: true },
        },
      },
    });

    // Get unverified pros
    const unverifiedPros = await prisma.proProfile.findMany({
      where: { verified: false },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        locationCity: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        categories: {
          select: {
            category: {
              select: { name: true },
            },
          },
          take: 3,
        },
      },
    });

    // Transform unverifiedPros to flatten category names
    const transformedUnverifiedPros = unverifiedPros.map(pro => ({
      ...pro,
      city: pro.locationCity,
      categories: pro.categories.map(c => ({ name: c.category.name })),
    }));

    return NextResponse.json({
      users: {
        total: totalUsers,
        clients: clientCount,
        pros: proCount,
        admins: adminCount,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,        // Jobs waiting for PRO interest/selection
        inProgress: inProgressJobs, // Jobs with PRO selected, work ongoing
        completed: completedJobs,   // Jobs finished
      },
      bids: {
        total: totalBids,
        accepted: acceptedBids,
        pending: pendingBids,
      },
      reviews: {
        total: reviewStats._count,
        avgRating: reviewStats._avg.rating || 0,
      },
      recentActivity: {
        jobs: recentJobs,
        bids: recentBids,
      },
      unverifiedPros: transformedUnverifiedPros,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan' },
      { status: 500 }
    );
  }
}
