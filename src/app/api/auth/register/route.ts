// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerClientSchema, registerProSchema } from '@/lib/validations';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    // Validate based on role
    if (role === 'PRO') {
      const parsed = registerProSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validatiefout', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { email, password, name, companyName, kvkNumber, phone, city, postcode, categories, serviceRadius } = parsed.data;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Er bestaat al een account met dit e-mailadres' },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await hash(password, 12);

      // Create user with pro profile
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          role: Role.PRO,
          proProfile: {
            create: {
              companyName,
              kvkNumber,
              phone,
              locationCity: city,
              serviceRadius,
              categories: {
                create: categories.map((categoryId: string) => ({
                  categoryId,
                })),
              },
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return NextResponse.json({ success: true, user });
    } else {
      // Client registration
      const parsed = registerClientSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validatiefout', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { email, password, name, phone, city, postcode } = parsed.data;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Er bestaat al een account met dit e-mailadres' },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await hash(password, 12);

      // Create user with client profile
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          role: Role.CLIENT,
          clientProfile: {
            create: {
              phone,
              city,
              postcode,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return NextResponse.json({ success: true, user });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het registreren' },
      { status: 500 }
    );
  }
}
