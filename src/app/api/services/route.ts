// src/app/api/services/route.ts
// List available services for PROs

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/services - List all active services
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'PRO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pro profile with purchases
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        servicePurchases: {
          where: {
            expiresAt: { gt: new Date() }, // Only active purchases
          },
          select: {
            id: true,
            serviceId: true,
            purchasedAt: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!proProfile) {
      return NextResponse.json({ error: 'Pro profile not found' }, { status: 404 });
    }

    // Get all active services
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    // Map services with purchase status
    const servicesWithStatus = services.map((service) => {
      const activePurchase = proProfile.servicePurchases.find(
        (p) => p.serviceId === service.id
      );

      return {
        ...service,
        isActive: !!activePurchase,
        activePurchase: activePurchase || null,
      };
    });

    return NextResponse.json({ services: servicesWithStatus });
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
