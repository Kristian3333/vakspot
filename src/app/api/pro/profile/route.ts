// src/app/api/pro/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get current pro's profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'PRO') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        proProfile: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    // Return in a format the edit form expects
    return NextResponse.json(user);
  } catch (error) {
    console.error('Get pro profile error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}

// PUT - Update pro profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'PRO') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    const body = await request.json();
    const {
      companyName,
      phone,
      description,
      serviceRadius,
      categories,
    } = body;

    // Find existing pro profile
    const existingProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Profiel niet gevonden' }, { status: 404 });
    }

    // Update pro profile
    const proProfile = await prisma.proProfile.update({
      where: { id: existingProfile.id },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(phone !== undefined && { phone }),
        ...(description !== undefined && { description }),
        ...(serviceRadius !== undefined && { serviceRadius }),
      },
    });

    // Update categories if provided
    if (categories && Array.isArray(categories)) {
      // Delete existing category relations
      await prisma.proCategory.deleteMany({
        where: { proId: existingProfile.id },
      });

      // Create new category relations
      if (categories.length > 0) {
        await prisma.proCategory.createMany({
          data: categories.map((categoryId: string) => ({
            proId: existingProfile.id,
            categoryId,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, profile: proProfile });
  } catch (error) {
    console.error('Update pro profile error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
