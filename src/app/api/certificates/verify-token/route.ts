// src/app/api/certificates/verify-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CertificateStatus } from '@prisma/client';

/**
 * GET /api/certificates/verify-token?token=xxx
 * Public endpoint - handles verification link click from email
 * No auth required (clicked from email by issuing body)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find certificate with this token
    const certificate = await prisma.proCertificate.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 404 }
      );
    }

    // Update certificate to VERIFIED status
    await prisma.proCertificate.update({
      where: { id: certificate.id },
      data: {
        status: CertificateStatus.VERIFIED,
        verifiedAt: new Date(),
        verificationToken: null, // Clear the token
      },
    });

    // Redirect to success page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/certificate-verified?success=true`;

    return NextResponse.redirect(redirectUrl, { status: 302 });
  } catch (error) {
    console.error('Failed to verify certificate:', error);
    return NextResponse.json(
      { error: 'Failed to verify certificate' },
      { status: 500 }
    );
  }
}
