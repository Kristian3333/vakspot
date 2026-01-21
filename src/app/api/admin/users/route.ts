// src/app/api/admin/users/route.ts
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }

    // Get users with related data
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          clientProfile: {
            select: {
              _count: {
                select: {
                  jobs: true,
                },
              },
            },
          },
          proProfile: {
            select: {
              companyName: true,
              verified: true,
              _count: {
                select: {
                  bids: true,
                },
              },
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Transform to flatten counts
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      proProfile: user.proProfile ? {
        companyName: user.proProfile.companyName,
        verified: user.proProfile.verified,
      } : null,
      _count: {
        jobs: user.clientProfile?._count?.jobs || 0,
        bids: user.proProfile?._count?.bids || 0,
      },
    }));

    return NextResponse.json({
      users: transformedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
