// src/app/api/certificates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { CertificateStatus } from '@prisma/client';

// Validation schema for adding a certificate
const addCertificateSchema = z.object({
  certificateTypeId: z.string().min(1, 'Certificate type is required'),
  certificateNumber: z.string().optional(),
  issuingBody: z.string().optional(),
  issuedAt: z.string().optional(),
});

/**
 * GET /api/certificates
 * Auth: PRO only
 * Returns list of current PRO's certificates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PRO') {
      return NextResponse.json(
        { error: 'Only professionals can view certificates' },
        { status: 403 }
      );
    }

    // Get PRO profile
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!proProfile) {
      return NextResponse.json({ certificates: [] });
    }

    // Get all certificates for this PRO
    const certificates = await prisma.proCertificate.findMany({
      where: {
        proId: proProfile.id,
      },
      include: {
        certificateType: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            description: true,
            clientLabel: true,
            requiredHours: true,
            validityYears: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error('Failed to fetch certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/certificates
 * Auth: PRO only
 * Add a new certificate to PRO profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PRO') {
      return NextResponse.json(
        { error: 'Only professionals can add certificates' },
        { status: 403 }
      );
    }

    // Get PRO profile
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!proProfile) {
      return NextResponse.json(
        { error: 'Professional profile not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = addCertificateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { certificateTypeId, certificateNumber, issuingBody, issuedAt } = parsed.data;

    // Create certificate with PENDING status
    const certificate = await prisma.proCertificate.create({
      data: {
        proId: proProfile.id,
        certificateTypeId,
        status: CertificateStatus.PENDING,
        certificateNumber: certificateNumber || null,
        issuingBody: issuingBody || null,
        issuedAt: issuedAt ? new Date(issuedAt) : null,
      },
      include: {
        certificateType: {
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            description: true,
            clientLabel: true,
            requiredHours: true,
            validityYears: true,
          },
        },
      },
    });

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    console.error('Failed to add certificate:', error);
    return NextResponse.json(
      { error: 'Failed to add certificate' },
      { status: 500 }
    );
  }
}
