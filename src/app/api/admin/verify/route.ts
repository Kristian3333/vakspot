// src/app/api/admin/verify/route.ts
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

    // Get all pro profiles
    const pros = await prisma.proProfile.findMany({
      orderBy: [
        { verified: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Transform to flatten category data
    const transformedPros = pros.map(pro => ({
      ...pro,
      categories: pro.categories.map(c => ({
        id: c.category.id,
        name: c.category.name,
      })),
    }));

    return NextResponse.json({ pros: transformedPros });
  } catch (error) {
    console.error('Get pros error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
