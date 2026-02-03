// src/components/quotes/quote-card.tsx
'use client';

import { useState } from 'react';
import { Button, Card, Badge } from '@/components/ui';
import {
  FileText,
  Euro,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Undo2,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN';
type AmountType = 'FIXED' | 'ESTIMATE' | 'HOURLY' | 'TO_DISCUSS';

interface Quote {
  id: string;
  amount: number;
  amountType: AmountType;
  description: string;
  status: QuoteStatus;
  validUntil: string;
  createdAt: string;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
}

interface QuoteCardProps {
  quote: Quote;
  isClient: boolean;
  onAction?: (quoteId: string, action: 'accept' | 'reject' | 'withdraw') => void;
  onRefresh?: () => void;
  className?: string;
}

const AMOUNT_TYPE_LABELS: Record<AmountType, string> = {
  FIXED: 'Vaste prijs',
  ESTIMATE: 'Schatting',
  HOURLY: 'Uurtarief',
  TO_DISCUSS: 'Nader te bepalen',
};

const STATUS_CONFIG: Record<QuoteStatus, {
  label: string;
  variant: 'neutral' | 'primary' | 'success' | 'warning' | 'error';
  icon: typeof CheckCircle2;
}> = {
  PENDING: { label: 'In afwachting', variant: 'warning', icon: Clock },
  ACCEPTED: { label: 'Geaccepteerd', variant: 'success', icon: CheckCircle2 },
  REJECTED: { label: 'Afgewezen', variant: 'error', icon: XCircle },
  EXPIRED: { label: 'Verlopen', variant: 'neutral', icon: AlertTriangle },
  WITHDRAWN: { label: 'Ingetrokken', variant: 'neutral', icon: Undo2 },
};

export function QuoteCard({ quote, isClient, onAction, onRefresh, className }: QuoteCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusConfig = STATUS_CONFIG[quote.status];
  const StatusIcon = statusConfig.icon;
  const isPending = quote.status === 'PENDING';
  const isExpired = new Date(quote.validUntil) < new Date();
  const validUntilDate = new Date(quote.validUntil);

  const handleAction = async (action: 'accept' | 'reject' | 'withdraw') => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const method = action === 'withdraw' ? 'DELETE' : 'POST';
      const body = action === 'withdraw' ? undefined : JSON.stringify({ action });

      const res = await fetch(`/api/quotes/${quote.id}`, {
        method,
        headers: action !== 'withdraw' ? { 'Content-Type': 'application/json' } : undefined,
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Actie mislukt');
        return;
      }

      onAction?.(quote.id, action);
      onRefresh?.();
    } catch (err) {
      setError('Er is iets misgegaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn(
      'border-l-4',
      quote.status === 'ACCEPTED' ? 'border-l-success-500 bg-success-50/30' :
      quote.status === 'REJECTED' ? 'border-l-error-500 bg-error-50/30' :
      quote.status === 'EXPIRED' ? 'border-l-surface-400 bg-surface-50' :
      quote.status === 'WITHDRAWN' ? 'border-l-surface-400 bg-surface-50' :
      'border-l-brand-500 bg-brand-50/30',
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-600" />
          <span className="font-semibold text-surface-900">Offerte</span>
        </div>
        <Badge variant={statusConfig.variant} size="sm">
          <StatusIcon className="h-3 w-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Amount */}
      <div className="mt-4">
        {quote.amount > 0 ? (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-surface-900">
              {formatCurrency(quote.amount)}
            </span>
            <span className="text-sm text-surface-500">
              {AMOUNT_TYPE_LABELS[quote.amountType]}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-surface-400" />
            <span className="text-surface-600">{AMOUNT_TYPE_LABELS[quote.amountType]}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mt-3 p-3 bg-white/50 rounded-lg border border-surface-200">
        <p className="text-sm text-surface-700 whitespace-pre-wrap">{quote.description}</p>
      </div>

      {/* Validity */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-surface-400" />
        <span className={cn(
          isExpired && quote.status === 'PENDING' ? 'text-error-600' : 'text-surface-500'
        )}>
          {isPending && !isExpired ? (
            <>Geldig tot {validUntilDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</>
          ) : isExpired && quote.status === 'PENDING' ? (
            <>Verlopen op {validUntilDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</>
          ) : quote.acceptedAt ? (
            <>Geaccepteerd op {new Date(quote.acceptedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</>
          ) : quote.rejectedAt ? (
            <>Afgewezen op {new Date(quote.rejectedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</>
          ) : (
            <>Verstuurd op {new Date(quote.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</>
          )}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-2 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      {isPending && !isExpired && (
        <div className="mt-4 pt-4 border-t border-surface-200">
          {isClient ? (
            <div className="flex gap-3">
              <Button
                onClick={() => handleAction('accept')}
                isLoading={loading}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accepteren
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('reject')}
                isLoading={loading}
                className="flex-1 border-error-200 text-error-600 hover:bg-error-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Afwijzen
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => handleAction('withdraw')}
              isLoading={loading}
              size="sm"
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Offerte intrekken
            </Button>
          )}
        </div>
      )}

      {/* Expired warning for pending quotes */}
      {isPending && isExpired && (
        <div className="mt-4 pt-4 border-t border-surface-200">
          <div className="flex items-center gap-2 text-sm text-warning-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Deze offerte is verlopen</span>
          </div>
        </div>
      )}
    </Card>
  );
}
