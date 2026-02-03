// src/app/api/settings/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';

// PUT - Change email address
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const { newEmail, password } = body;

    // Validate input
    if (!newEmail || !password) {
      return NextResponse.json({ error: 'Alle velden zijn verplicht' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'Voer een geldig e-mailadres in' }, { status: 400 });
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({ error: 'Dit e-mailadres is al in gebruik' }, { status: 400 });
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    // Check if it's the same email
    if (user.email === normalizedEmail) {
      return NextResponse.json({ error: 'Nieuw e-mailadres is hetzelfde als het huidige' }, { status: 400 });
    }

    // Verify password
    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json({ error: 'Wachtwoord is onjuist' }, { status: 401 });
    }

    // Update email
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: normalizedEmail },
    });

    return NextResponse.json({ success: true, message: 'E-mailadres gewijzigd' });
  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
