// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        clientProfile: {
          select: {
            phone: true,
            address: true,
            city: true,
            postcode: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, city, postcode, address } = body;

    // Update user basic info
    const userData: { name?: string; email?: string } = {};
    if (name !== undefined) userData.name = name;
    if (email !== undefined) userData.email = email.toLowerCase();

    if (Object.keys(userData).length > 0) {
      // Check if email is already taken by another user
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: email.toLowerCase(),
            NOT: { id: session.user.id },
          },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: 'Dit e-mailadres is al in gebruik' },
            { status: 400 }
          );
        }
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: userData,
      });
    }

    // Update client profile if applicable
    if (session.user.role === 'CLIENT') {
      const clientProfileData: {
        phone?: string;
        city?: string;
        postcode?: string;
        address?: string;
      } = {};
      
      if (phone !== undefined) clientProfileData.phone = phone || null;
      if (city !== undefined) clientProfileData.city = city || null;
      if (postcode !== undefined) clientProfileData.postcode = postcode || null;
      if (address !== undefined) clientProfileData.address = address || null;

      if (Object.keys(clientProfileData).length > 0) {
        await prisma.clientProfile.upsert({
          where: { userId: session.user.id },
          update: clientProfileData,
          create: {
            userId: session.user.id,
            ...clientProfileData,
          },
        });
      }
    }

    // Get updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
