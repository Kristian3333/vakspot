// src/app/(dashboard)/admin/verify/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Spinner, Avatar } from '@/components/ui';
import { 
  ArrowLeft,
  ShieldCheck,
  ShieldX,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

type ProProfile = {
  id: string;
  companyName: string | null;
  bio: string | null;
  phone: string | null;
  city: string | null;
  postcode: string | null;
  kvkNumber: string | null;
  verified: boolean;
  workRadius: number | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
  categories: Array<{ id: string; name: string }>;
};

export default function AdminVerifyPage() {
  const [pros, setPros] = useState<ProProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPros();
  }, []);

  const loadPros = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      const data = await res.json();
      setPros(data.pros || []);
    } catch (error) {
      console.error('Failed to load pros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, verified: boolean) => {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/verify/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      });
      loadPros();
    } catch (error) {
      console.error('Failed to update verification:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const unverifiedPros = pros.filter(p => !p.verified);
  const verifiedPros = pros.filter(p => p.verified);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar dashboard
        </Link>
        <h1 className="text-2xl font-bold text-surface-900">Pro verificatie</h1>
        <p className="text-surface-600 mt-1">
          {unverifiedPros.length} wachtend op verificatie
        </p>
      </div>

      {/* Unverified Pros */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <ShieldX className="h-5 w-5 text-warning-500" />
          Te verifiëren ({unverifiedPros.length})
        </h2>
        
        {unverifiedPros.length === 0 ? (
          <Card className="text-center py-12">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success-500" />
            <h3 className="mt-4 text-lg font-medium text-surface-900">
              Alle pro&apos;s zijn geverifieerd!
            </h3>
            <p className="mt-2 text-surface-500">
              Er zijn geen vakmensen die wachten op verificatie.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {unverifiedPros.map((pro) => (
              <ProCard 
                key={pro.id} 
                pro={pro} 
                onVerify={handleVerify}
                loading={actionLoading === pro.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recently Verified */}
      {verifiedPros.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success-500" />
            Recent geverifieerd ({verifiedPros.length})
          </h2>
          <div className="space-y-4">
            {verifiedPros.slice(0, 5).map((pro) => (
              <ProCard 
                key={pro.id} 
                pro={pro} 
                onVerify={handleVerify}
                loading={actionLoading === pro.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProCard({ 
  pro, 
  onVerify, 
  loading 
}: { 
  pro: ProProfile; 
  onVerify: (id: string, verified: boolean) => void;
  loading: boolean;
}) {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Profile info */}
        <div className="flex items-start gap-4 flex-1">
          <Avatar 
            src={pro.user.image} 
            name={pro.user.name || pro.companyName} 
            size="lg" 
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-surface-900">
                {pro.companyName || pro.user.name || 'Geen naam'}
              </h3>
              <Badge variant={pro.verified ? 'success' : 'warning'} size="sm">
                {pro.verified ? 'Geverifieerd' : 'Wachtend'}
              </Badge>
            </div>
            
            {pro.user.name && pro.companyName && (
              <p className="text-sm text-surface-600">{pro.user.name}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-3 text-sm text-surface-500">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {pro.user.email}
              </span>
              {pro.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {pro.phone}
                </span>
              )}
              {pro.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {pro.city} {pro.postcode}
                </span>
              )}
              {pro.kvkNumber && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  KvK: {pro.kvkNumber}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Aangemeld {formatDate(pro.createdAt)}
              </span>
            </div>

            {/* Categories */}
            {pro.categories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {pro.categories.map((cat) => (
                  <Badge key={cat.id} variant="neutral" size="sm">
                    {cat.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Bio */}
            {pro.bio && (
              <p className="mt-3 text-sm text-surface-600 line-clamp-2">
                {pro.bio}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col gap-2 sm:ml-4">
          {pro.verified ? (
            <Button
              variant="outline"
              size="sm"
              className="text-error-600"
              onClick={() => onVerify(pro.id, false)}
              isLoading={loading}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Intrekken
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => onVerify(pro.id, true)}
                isLoading={loading}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Verifiëren
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-error-600"
                onClick={() => onVerify(pro.id, false)}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Afwijzen
              </Button>
            </>
          )}
          {pro.kvkNumber && (
            <a
              href={`https://www.kvk.nl/zoeken/?source=all&q=${pro.kvkNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              KvK checken
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
