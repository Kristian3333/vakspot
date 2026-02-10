// src/app/api/certificates/types/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/certificates/types
 * Public endpoint - returns all active certificate types
 */
export async function GET(request: NextRequest) {
  try {
    const types = await prisma.certificateType.findMany({
      where: {
        active: true,
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
      select: {
        id: true,
        code: true,
        name: true,
        category: true,
        description: true,
        clientLabel: true,
        requiredHours: true,
        validityYears: true,
        active: true,
        order: true,
      },
    });

    return NextResponse.json({ types });
  } catch (error) {
    console.error('Failed to fetch certificate types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificate types' },
      { status: 500 }
    );
  }
}
