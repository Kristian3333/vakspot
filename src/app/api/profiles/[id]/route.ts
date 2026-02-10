// src/app/api/profiles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CertificateStatus } from '@prisma/client';

/**
 * GET /api/profiles/[id]
 * Public endpoint - get public profile for any user
 * No auth required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        role: true,
        profileVisible: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if profile is visible
    if (!user.profileVisible) {
      return NextResponse.json(
        { error: 'Profile is not public' },
        { status: 404 }
      );
    }

    // Return different data based on role
    if (user.role === 'PRO') {
      // Get PRO profile with full details
      const proProfile = await prisma.proProfile.findUnique({
        where: { userId: user.id },
        include: {
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  icon: true,
                },
              },
            },
          },
          certificates: {
            where: {
              status: CertificateStatus.VERIFIED, // Only show verified certificates
            },
            include: {
              certificateType: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  category: true,
                  clientLabel: true,
                  requiredHours: true,
                  validityYears: true,
                },
              },
            },
            orderBy: {
              verifiedAt: 'desc',
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              title: true,
              content: true,
              createdAt: true,
              response: true,
              respondedAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10, // Limit to recent reviews
          },
        },
      });

      if (!proProfile) {
        return NextResponse.json(
          { error: 'Professional profile not found' },
          { status: 404 }
        );
      }

      // Build profile response
      const profile = {
        id: user.id,
        name: user.name,
        role: user.role,
        memberSince: user.createdAt,
        companyName: proProfile.companyName,
        description: proProfile.description,
        locationCity: proProfile.locationCity,
        verified: proProfile.verified,
        avgRating: proProfile.avgRating,
        totalReviews: proProfile.totalReviews,
        responseRate: proProfile.responseRate,
        categories: proProfile.categories.map((pc) => ({
          id: pc.category.id,
          name: pc.category.name,
          slug: pc.category.slug,
          icon: pc.category.icon,
          yearsExp: pc.yearsExp,
        })),
        certificates: proProfile.certificates.map((cert) => ({
          id: cert.id,
          status: cert.status,
          verifiedAt: cert.verifiedAt,
          expiresAt: cert.expiresAt,
          certificateType: cert.certificateType,
        })),
        reviews: proProfile.reviews,
      };

      return NextResponse.json({ profile });
    } else if (user.role === 'CLIENT') {
      // Get job count for client
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: user.id },
      });

      let jobCount = 0;
      if (clientProfile) {
        jobCount = await prisma.job.count({
          where: { clientId: clientProfile.id },
        });
      }

      // Return minimal client profile (no contact details)
      const profile = {
        id: user.id,
        name: user.name,
        role: user.role,
        memberSince: user.createdAt,
        jobCount,
      };

      return NextResponse.json({ profile });
    } else {
      // Admin or other roles - return minimal info
      const profile = {
        id: user.id,
        name: user.name,
        role: user.role,
        memberSince: user.createdAt,
      };

      return NextResponse.json({ profile });
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
