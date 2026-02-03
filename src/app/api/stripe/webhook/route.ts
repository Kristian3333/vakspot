// src/app/api/stripe/webhook/route.ts
// Stripe webhook handler for payment events

import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

// Disable body parsing - we need the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', session.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const { serviceId, proId, durationDays } = session.metadata || {};

  if (!serviceId || !proId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Check if purchase already exists (idempotency)
  const existingPurchase = await prisma.servicePurchase.findFirst({
    where: {
      proId,
      serviceId,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingPurchase) {
    console.log('Purchase already exists for session:', session.id);
    return;
  }

  // Get service to get the price
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    console.error('Service not found:', serviceId);
    return;
  }

  // Calculate expiry date
  const days = parseInt(durationDays || '30', 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  // Create purchase record
  const purchase = await prisma.servicePurchase.create({
    data: {
      proId,
      serviceId,
      price: session.amount_total || service.price,
      expiresAt,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string || null,
    },
  });

  console.log('Purchase created:', purchase.id, 'for session:', session.id);

  // If service is a sponsorship service, update the PRO's jobs
  if (service.name.toLowerCase().includes('gesponsord') ||
      service.name.toLowerCase().includes('sponsor')) {
    await activateSponsorshipForPro(proId, days);
  }
}

async function activateSponsorshipForPro(proId: string, days: number) {
  const sponsoredUntil = new Date();
  sponsoredUntil.setDate(sponsoredUntil.getDate() + days);

  // Get all active jobs for this PRO's clients and sponsor them
  // Note: This is a placeholder - actual implementation depends on business logic
  // For now, we just log it
  console.log(`Sponsorship activated for PRO ${proId} until ${sponsoredUntil.toISOString()}`);
}
