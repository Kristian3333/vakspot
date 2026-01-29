// src/app/(dashboard)/pro/services/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { Package, Check, Clock, Sparkles, ArrowRight } from 'lucide-react';

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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  async function handlePurchase(serviceId: string) {
    setPurchasing(serviceId);
    setMessage(null);

    try {
      const res = await fetch(`/api/services/${serviceId}/purchase`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        fetchServices(); // Refresh the list
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
                ) : service.price > 0 ? (
                  <Button disabled className="w-full" variant="secondary">
                    Binnenkort beschikbaar
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePurchase(service.id)}
                    disabled={purchasing === service.id}
                    className="w-full"
                  >
                    {purchasing === service.id ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Activeren...
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
        <h3 className="font-semibold text-blue-900">Binnenkort: Premium Services</h3>
        <p className="text-blue-800 text-sm mt-2">
          We werken aan premium services waarmee u nog meer zichtbaarheid krijgt.
          Denk aan uitgelichte profielen, prioriteit in zoekresultaten en meer.
          Houd deze pagina in de gaten!
        </p>
      </Card>
    </div>
  );
}
