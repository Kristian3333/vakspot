// src/app/(dashboard)/pro/services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { Package, Check, Clock, Sparkles, ArrowRight, CreditCard, CheckCircle2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  activePurchase: {
    id: string;
    purchasedAt: string;
    expiresAt: string;
  } | null;
}

export default function ProServicesPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      setMessage({
        type: 'success',
        text: 'Betaling geslaagd! Uw service is nu actief.',
      });
      // Clear URL params
      window.history.replaceState({}, '', '/pro/services');
    } else if (canceled === 'true') {
      setMessage({
        type: 'error',
        text: 'Betaling geannuleerd. U kunt het later opnieuw proberen.',
      });
      window.history.replaceState({}, '', '/pro/services');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (res.ok) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(serviceId: string, price: number) {
    setPurchasing(serviceId);
    setMessage(null);

    try {
      // Use Stripe checkout for all services (free ones handled server-side)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.free) {
          // Free service was activated directly
          setMessage({ type: 'success', text: data.message });
          fetchServices();
        } else if (data.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.url;
          return; // Don't clear purchasing state since we're redirecting
        }
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Er is iets misgegaan' });
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Services</h1>
        <p className="text-gray-600 mt-1">
          Vergroot uw zichtbaarheid en krijg meer klussen met onze services.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Services Grid */}
      {services.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Geen services beschikbaar</h3>
          <p className="text-gray-600 mt-2">
            Er zijn momenteel geen services beschikbaar. Kom later terug!
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="p-6 relative overflow-hidden">
              {/* Active Badge */}
              {service.isActive && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Actief
                  </Badge>
                </div>
              )}

              {/* Service Icon */}
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                {service.price === 0 ? (
                  <Package className="w-6 h-6 text-blue-600" />
                ) : (
                  <Sparkles className="w-6 h-6 text-blue-600" />
                )}
              </div>

              {/* Service Info */}
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <p className="text-gray-600 text-sm mt-2">{service.description}</p>

              {/* Price & Duration */}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="font-semibold text-gray-900">
                  {service.price === 0 ? 'Gratis' : `€${(service.price / 100).toFixed(2)}`}
                </span>
                <span className="text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {service.durationDays} dagen
                </span>
              </div>

              {/* Expiry info if active */}
              {service.isActive && service.activePurchase && (
                <p className="text-sm text-gray-500 mt-3">
                  Actief tot {new Date(service.activePurchase.expiresAt).toLocaleDateString('nl-NL')}
                </p>
              )}

              {/* Action Button */}
              <div className="mt-6">
                {service.isActive ? (
                  <Button disabled className="w-full" variant="secondary">
                    <Check className="w-4 h-4 mr-2" />
                    Geactiveerd
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase(service.id, service.price)}
                    disabled={purchasing === service.id}
                    className="w-full"
                  >
                    {purchasing === service.id ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        {service.price > 0 ? 'Doorsturen naar betaling...' : 'Activeren...'}
                      </>
                    ) : service.price > 0 ? (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Kopen
                      </>
                    ) : (
                      <>
                        Activeren
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Section */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Veilig betalen met Stripe</h3>
            <p className="text-blue-800 text-sm mt-1">
              Alle betalingen worden veilig verwerkt via Stripe. U kunt betalen met iDEAL
              of creditcard. Na succesvolle betaling wordt uw service direct geactiveerd.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
