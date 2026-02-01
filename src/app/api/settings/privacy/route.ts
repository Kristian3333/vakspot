// src/app/api/settings/privacy/route.ts
// GDPR Compliance: Privacy settings API

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Mock implementation - in production, these would be stored in the database
const userSettings: Record<string, { marketingEmails: boolean; profileVisible: boolean }> = {};

// GET - Get current privacy settings
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return user's settings or defaults
    const settings = userSettings[session.user.id] || {
      marketingEmails: true,
      profileVisible: true,
    };

    return NextResponse.json({ settings });
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
    const { marketingEmails, profileVisible } = body;

    // Store settings (in production, save to database)
    userSettings[session.user.id] = {
      marketingEmails: !!marketingEmails,
      profileVisible: !!profileVisible,
    };

    return NextResponse.json({
      success: true,
      settings: userSettings[session.user.id],
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
