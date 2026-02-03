// src/lib/stripe.ts
// Stripe client configuration

import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when STRIPE_SECRET_KEY is not set
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility, export as stripe but call getStripe() when needed
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get webhooks() { return getStripe().webhooks; },
};

// Helper to format price for display
export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(priceInCents / 100);
}
