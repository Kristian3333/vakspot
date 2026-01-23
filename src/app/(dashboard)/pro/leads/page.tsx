// src/app/(dashboard)/pro/leads/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Badge, Spinner, Button } from '@/components/ui';
import { formatRelativeTime, cn } from '@/lib/utils';
import { 
  MapPin, ChevronRight, Briefcase, MessageSquare, CheckCircle2, 
  Clock, XCircle, Search
} from 'lucide-react';

type Bid = {
  id: string;
  status: string;
  createdAt: string;
  jobId: string;
  job: {
    id: string;
    title: string;
    description: string;
    status: string;
    locationCity: string;
    category: { id: string; name: string };
    images: { url: string }[];
    client: {
      city: string | null;
      user: { name: string | null };
    };
  };
  conversation: { id: string } | null;
};

const BID_STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'primary'; icon: any }> = {
  PENDING: { label: 'In afwachting', variant: 'warning', icon: Clock },
  VIEWED: { label: 'Bekeken', variant: 'primary', icon: Clock },
  ACCEPTED: { label: 'Geaccepteerd', variant: 'success', icon: CheckCircle2 },
  REJECTED: { label: 'Niet gekozen', variant: 'neutral', icon: XCircle },
  WITHDRAWN: { label: 'Ingetrokken', variant: 'neutral', icon: XCircle },
};

export default function ProLeadsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bids')
      .then(res => res.json())
      .then(data => {
        setBids(data.bids || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // Group by status - accepted first, then pending, then closed
  const acceptedBids = bids.filter(b => b.status === 'ACCEPTED');
  const pendingBids = bids.filter(b => ['PENDING', 'VIEWED'].includes(b.status));
  const closedBids = bids.filter(b => ['REJECTED', 'WITHDRAWN'].includes(b.status));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Mijn klussen</h1>
          <p className="mt-1 text-surface-600">Klussen waar u interesse in heeft getoond</p>
        </div>
        <Link href="/pro/jobs">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Zoek klussen
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {bids.length === 0 && (
        <Card className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">Nog geen klussen</h3>
          <p className="mt-1 text-surface-500">
            Bekijk beschikbare klussen en toon uw interesse
          </p>
          <Link href="/pro/jobs" className="mt-6 inline-block">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Bekijk beschikbare klussen
            </Button>
          </Link>
        </Card>
      )}

      {/* Accepted bids - shown first with emphasis */}
      {acceptedBids.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success-600" />
            <h2 className="font-semibold text-surface-900">Geaccepteerde klussen ({acceptedBids.length})</h2>
          </div>
          <div className="space-y-3">
            {acceptedBids.map((bid) => (
              <BidCard key={bid.id} bid={bid} />
            ))}
          </div>
        </div>
      )}

      {/* Pending bids */}
      {pendingBids.length > 0 && (
        <div className="mb-8">
          {acceptedBids.length > 0 && (
            <h2 className="font-semibold text-surface-900 mb-4">In afwachting ({pendingBids.length})</h2>
          )}
          <div className="space-y-3">
            {pendingBids.map((bid) => (
              <BidCard key={bid.id} bid={bid} />
            ))}
          </div>
        </div>
      )}

      {/* Closed bids */}
      {closedBids.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 mt-8">
            <div className="h-px flex-1 bg-surface-200" />
            <span className="text-sm text-surface-500 px-2">Afgesloten ({closedBids.length})</span>
            <div className="h-px flex-1 bg-surface-200" />
          </div>
          <div className="space-y-3">
            {closedBids.map((bid) => (
              <BidCard key={bid.id} bid={bid} closed />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BidCard({ bid, closed = false }: { bid: Bid; closed?: boolean }) {
  const statusConfig = BID_STATUS_CONFIG[bid.status] || BID_STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const isAccepted = bid.status === 'ACCEPTED';

  // Link to conversation if available, otherwise to job detail
  const href = bid.conversation ? `/messages/${bid.conversation.id}` : `/pro/jobs/${bid.job.id}`;

  return (
    <Link href={href}>
      <Card 
        hover={!closed}
        className={cn(
          'group',
          closed && 'opacity-60 bg-surface-50',
          isAccepted && 'border-success-200 bg-success-50/30'
        )}
      >
        <div className="flex gap-4">
          {/* Thumbnail */}
          {bid.job.images?.[0] ? (
            <div className={cn(
              "h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-100",
              closed && "grayscale"
            )}>
              <img src={bid.job.images[0].url} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-surface-100 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-surface-300" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="neutral" size="sm">{bid.job.category?.name}</Badge>
                  <Badge variant={statusConfig.variant} size="sm" className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <h3 className={cn(
                  "mt-1 font-semibold text-surface-900 transition-colors",
                  !closed && "group-hover:text-brand-600"
                )}>
                  {bid.job.title}
                </h3>
              </div>
              {bid.conversation ? (
                <MessageSquare className={cn(
                  "h-5 w-5 text-surface-400 flex-shrink-0",
                  !closed && "group-hover:text-brand-500"
                )} />
              ) : (
                <ChevronRight className="h-5 w-5 text-surface-400 flex-shrink-0" />
              )}
            </div>

            <p className="mt-1 text-sm text-surface-600 line-clamp-1">
              {bid.job.client.user.name || 'Opdrachtgever'} • {bid.job.locationCity}
            </p>

            <div className="mt-2 flex items-center gap-4 text-xs text-surface-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {bid.job.locationCity}
              </span>
              <span>Interesse getoond {formatRelativeTime(bid.createdAt)}</span>
            </div>

            {isAccepted && (
              <div className="mt-2 flex items-center gap-1 text-sm text-success-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">U bent gekozen voor deze klus!</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
