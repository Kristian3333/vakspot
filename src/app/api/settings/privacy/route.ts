// src/app/api/settings/privacy/route.ts
// GDPR Compliance: Privacy settings API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Chat retention options (in days) - internal constant, not exported from route
const CHAT_RETENTION_OPTIONS = [
  { value: 90, label: '3 maanden' },
  { value: 180, label: '6 maanden' },
  { value: 365, label: '1 jaar' },
  { value: 730, label: '2 jaar (standaard)' },
] as const;

// GET - Get current privacy settings
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailMarketing: true,
        profileVisible: true,
        chatRetentionDays: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      settings: {
        marketingEmails: user.emailMarketing,
        profileVisible: user.profileVisible,
        chatRetentionDays: user.chatRetentionDays ?? 730,
      },
      retentionOptions: CHAT_RETENTION_OPTIONS,
    });
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Update privacy settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { marketingEmails, profileVisible, chatRetentionDays } = body;

    // Validate chat retention days if provided
    if (chatRetentionDays !== undefined) {
      const validOptions = CHAT_RETENTION_OPTIONS.map((o) => o.value) as readonly number[];
      if (!validOptions.includes(chatRetentionDays)) {
        return NextResponse.json(
          { error: 'Invalid chat retention period' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailMarketing: marketingEmails !== undefined ? !!marketingEmails : undefined,
        profileVisible: profileVisible !== undefined ? !!profileVisible : undefined,
        chatRetentionDays: chatRetentionDays !== undefined ? chatRetentionDays : undefined,
      },
      select: {
        emailMarketing: true,
        profileVisible: true,
        chatRetentionDays: true,
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        marketingEmails: updated.emailMarketing,
        profileVisible: updated.profileVisible,
        chatRetentionDays: updated.chatRetentionDays ?? 730,
      },
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
