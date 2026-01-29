// src/app/api/services/[id]/purchase/route.ts
// Purchase a service (free for now, payment integration later)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id: serviceId } = params;

    if (!session || session.user.role !== 'PRO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pro profile
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!proProfile) {
      return NextResponse.json({ error: 'Pro profile not found' }, { status: 404 });
    }

    // Get service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.active) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check if already has active purchase
    const existingPurchase = await prisma.servicePurchase.findFirst({
      where: {
        proId: proProfile.id,
        serviceId: serviceId,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'U heeft deze service al actief', purchase: existingPurchase },
        { status: 400 }
      );
    }

    // For now, only allow free services (price = 0)
    // TODO: Add Stripe/Mollie payment integration for paid services
    if (service.price > 0) {
      return NextResponse.json(
        { error: 'Betaalde services zijn nog niet beschikbaar' },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + service.durationDays);

    // Create purchase
    const purchase = await prisma.servicePurchase.create({
      data: {
        proId: proProfile.id,
        serviceId: serviceId,
        price: service.price,
        expiresAt: expiresAt,
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Service "${service.name}" geactiveerd tot ${expiresAt.toLocaleDateString('nl-NL')}`,
      purchase,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to purchase service:', error);
    return NextResponse.json({ error: 'Failed to purchase service' }, { status: 500 });
  }
}
