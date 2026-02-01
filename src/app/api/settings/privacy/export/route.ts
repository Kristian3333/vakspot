// src/app/api/settings/privacy/export/route.ts
// GDPR Compliance: Data export request (right of access)

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Request data export
export async function POST() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In production, this would:
    // 1. Create a background job to compile all user data
    // 2. Generate a downloadable file (JSON/CSV)
    // 3. Send an email with a secure download link
    // 4. Log the request for compliance purposes

    // For now, we'll create a notification to simulate the request
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'SYSTEM',
        title: 'Gegevensexport aangevraagd',
        message: 'Uw verzoek om gegevensexport is ontvangen. U ontvangt binnen 72 uur een e-mail met een download link.',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Export request received. You will receive an email within 72 hours.',
    });
  } catch (error) {
    console.error('Error requesting data export:', error);
    return NextResponse.json({ error: 'Failed to request export' }, { status: 500 });
  }
}
