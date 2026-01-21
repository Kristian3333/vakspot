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

    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!proProfile) {
      return NextResponse.json({ error: 'Profiel niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ profile: proProfile });
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
      name,
      companyName,
      phone,
      city,
      postcode,
      bio,
      kvkNumber,
      workRadius,
      categoryIds,
    } = body;

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

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
        companyName: companyName || existingProfile.companyName,
        phone: phone || existingProfile.phone,
        locationCity: city || existingProfile.locationCity,
        kvkNumber: kvkNumber || existingProfile.kvkNumber,
        description: bio || existingProfile.description,
        serviceRadius: workRadius || existingProfile.serviceRadius,
      },
    });

    // Update categories if provided
    if (categoryIds && Array.isArray(categoryIds)) {
      // Delete existing category relations
      await prisma.proCategory.deleteMany({
        where: { proId: existingProfile.id },
      });

      // Create new category relations
      if (categoryIds.length > 0) {
        await prisma.proCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
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
