// src/app/(dashboard)/pro/bids/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Select, Spinner, StatusBadge } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { MapPin, Euro, ChevronRight, FileText, MessageSquare } from 'lucide-react';

type Bid = {
  id: string;
  amount: number;
  amountType: string;
  message: string;
  status: string;
  createdAt: string;
  viewedAt: string | null;
  job: {
    id: string;
    title: string;
    locationCity: string;
    category: { name: string; icon: string | null };
    client: { city: string | null; user: { name: string | null } };
    images: { url: string }[];
  };
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'neutral' | 'primary' | 'success' | 'warning' | 'error' }> = {
  PENDING: { label: 'In afwachting', variant: 'neutral' },
  VIEWED: { label: 'Bekeken', variant: 'primary' },
  ACCEPTED: { label: 'Geaccepteerd', variant: 'success' },
  REJECTED: { label: 'Afgewezen', variant: 'error' },
  WITHDRAWN: { label: 'Ingetrokken', variant: 'neutral' },
};

export default function ProBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);

    fetch(`/api/bids?${params}`)
      .then(res => res.json())
      .then(data => {
        setBids(data.bids || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  const activeBids = bids.filter(b => ['PENDING', 'VIEWED'].includes(b.status));
  const acceptedBids = bids.filter(b => b.status === 'ACCEPTED');
  const otherBids = bids.filter(b => ['REJECTED', 'WITHDRAWN'].includes(b.status));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Mijn offertes</h1>
          <p className="mt-1 text-surface-600">Beheer uw verzonden offertes</p>
        </div>
        <Link href="/pro/leads">
          <Button>Nieuwe klussen</Button>
        </Link>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-surface-600">Filter:</span>
          <Select
            options={[
              { value: '', label: 'Alle offertes' },
              { value: 'PENDING', label: 'In afwachting' },
              { value: 'VIEWED', label: 'Bekeken' },
              { value: 'ACCEPTED', label: 'Geaccepteerd' },
              { value: 'REJECTED', label: 'Afgewezen' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-48"
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : bids.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">Geen offertes</h3>
          <p className="mt-1 text-surface-500">
            U heeft nog geen offertes verstuurd
          </p>
          <Link href="/pro/leads" className="mt-6 inline-block">
            <Button>Klussen bekijken</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Accepted bids */}
          {acceptedBids.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-100 text-xs font-bold text-success-600">
                  {acceptedBids.length}
                </span>
                Geaccepteerde offertes
              </h2>
              <div className="space-y-4">
                {acceptedBids.map((bid) => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            </div>
          )}

          {/* Active bids */}
          {activeBids.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                  {activeBids.length}
                </span>
                Actieve offertes
              </h2>
              <div className="space-y-4">
                {activeBids.map((bid) => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            </div>
          )}

          {/* Other bids */}
          {otherBids.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-surface-900 mb-4">
                Afgeronde offertes
              </h2>
              <div className="space-y-4">
                {otherBids.map((bid) => (
                  <BidCard key={bid.id} bid={bid} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BidCard({ bid }: { bid: Bid }) {
  const statusConfig = STATUS_CONFIG[bid.status] || STATUS_CONFIG.PENDING;
  const showMessage = bid.status === 'ACCEPTED';

  return (
    <Link href={showMessage ? `/messages?bid=${bid.id}` : `/pro/leads/${bid.job.id}`}>
      <Card hover className="group">
        <div className="flex gap-4">
          {/* Image */}
          {bid.job.images[0] ? (
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100">
              <img src={bid.job.images[0].url} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-surface-100">
              <FileText className="h-6 w-6 text-surface-300" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </StatusBadge>
                  {bid.viewedAt && bid.status === 'VIEWED' && (
                    <span className="text-xs text-surface-500">
                      Bekeken {formatRelativeTime(bid.viewedAt)}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                  {bid.job.title}
                </h3>
              </div>
              {showMessage ? (
                <MessageSquare className="h-5 w-5 text-brand-500 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-5 w-5 text-surface-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-surface-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {bid.job.locationCity}
              </span>
              <span className="flex items-center gap-1 font-medium text-surface-900">
                <Euro className="h-4 w-4" />
                {formatCurrency(bid.amount)}
              </span>
              <span className="text-surface-400">
                Verzonden {formatRelativeTime(bid.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
