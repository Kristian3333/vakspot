// src/app/api/certificates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/certificates/[id]
 * Auth: PRO only, must own the certificate
 * Remove certificate from profile
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PRO') {
      return NextResponse.json(
        { error: 'Only professionals can delete certificates' },
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

    // Check if certificate exists and belongs to this PRO
    const certificate = await prisma.proCertificate.findUnique({
      where: { id: params.id },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    if (certificate.proId !== proProfile.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this certificate' },
        { status: 403 }
      );
    }

    // Delete the certificate
    await prisma.proCertificate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Failed to delete certificate:', error);
    return NextResponse.json(
      { error: 'Failed to delete certificate' },
      { status: 500 }
    );
  }
}
