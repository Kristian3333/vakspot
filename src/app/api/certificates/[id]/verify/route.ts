// src/app/api/certificates/[id]/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { generateVerificationToken, getVerificationEmailContent } from '@/lib/certificates';
import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors when RESEND_API_KEY is not set
let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = 'VakSpot <noreply@vakspot.nl>';

// Validation schema
const verifySchema = z.object({
  verificationEmail: z.string().email('Valid email address required'),
});

/**
 * POST /api/certificates/[id]/verify
 * Auth: PRO only, must own the certificate
 * Trigger verification email to issuing body
 */
export async function POST(
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
        { error: 'Only professionals can verify certificates' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { verificationEmail } = parsed.data;

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
      include: {
        certificateType: true,
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }

    if (certificate.proId !== proProfile.id) {
      return NextResponse.json(
        { error: 'You do not have permission to verify this certificate' },
        { status: 403 }
      );
    }

    // Generate verification token
    const token = generateVerificationToken();

    // Update certificate with verification info
    await prisma.proCertificate.update({
      where: { id: params.id },
      data: {
        verificationEmail,
        verificationToken: token,
        verificationSentAt: new Date(),
      },
    });

    // Send verification email
    const proName = session.user.name || proProfile.companyName;
    const certName = certificate.certificateType.name;
    const emailContent = getVerificationEmailContent(proName, certName, token);

    const client = getResend();
    if (client) {
      try {
        await client.emails.send({
          from: FROM_EMAIL,
          to: verificationEmail,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        console.log('[Verify Email] Sent successfully to:', verificationEmail);
      } catch (emailError) {
        console.error('[Verify Email] Failed to send:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log('[Verify Email] RESEND_API_KEY not configured, skipping email');
    }

    return NextResponse.json({
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
