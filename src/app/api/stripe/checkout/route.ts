// src/app/api/stripe/checkout/route.ts
// Create Stripe Checkout session for service purchase

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'PRO') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId } = await request.json();

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Get pro profile
    const proProfile = await prisma.proProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
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
        { error: 'U heeft deze service al actief' },
        { status: 400 }
      );
    }

    // For free services, activate directly without Stripe
    if (service.price === 0) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + service.durationDays);

      const purchase = await prisma.servicePurchase.create({
        data: {
          proId: proProfile.id,
          serviceId: serviceId,
          price: service.price,
          expiresAt: expiresAt,
        },
      });

      return NextResponse.json({
        success: true,
        free: true,
        message: `Service "${service.name}" geactiveerd tot ${expiresAt.toLocaleDateString('nl-NL')}`,
        purchase,
      });
    }

    // Create Stripe Checkout session for paid services
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const checkoutSession = await getStripe().checkout.sessions.create({
      payment_method_types: ['card', 'ideal'], // Card and iDEAL for Dutch users
      mode: 'payment',
      customer_email: proProfile.user.email || undefined,
      client_reference_id: proProfile.id,
      metadata: {
        serviceId: service.id,
        proId: proProfile.id,
        userId: session.user.id,
        serviceName: service.name,
        durationDays: service.durationDays.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: service.name,
              description: `${service.description} (${service.durationDays} dagen)`,
            },
            unit_amount: service.price, // Price is already in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pro/services?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pro/services?canceled=true`,
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Er is iets misgegaan bij het aanmaken van de betaling' },
      { status: 500 }
    );
  }
}
