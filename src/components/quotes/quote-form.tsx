// src/components/quotes/quote-form.tsx
'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { FileText, Euro, Calendar, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type AmountType = 'FIXED' | 'ESTIMATE' | 'HOURLY' | 'TO_DISCUSS';

interface QuoteFormProps {
  bidId: string;
  onSuccess?: (quote: any) => void;
  onCancel?: () => void;
  className?: string;
}

const AMOUNT_TYPE_OPTIONS: { value: AmountType; label: string; description: string }[] = [
  { value: 'FIXED', label: 'Vaste prijs', description: 'Exact bedrag voor de hele klus' },
  { value: 'ESTIMATE', label: 'Schatting', description: 'Geschatte kosten, kan afwijken' },
  { value: 'HOURLY', label: 'Uurtarief', description: 'Prijs per uur arbeid' },
  { value: 'TO_DISCUSS', label: 'Nader te bepalen', description: 'Prijs na inspectie bepalen' },
];

const VALIDITY_OPTIONS = [
  { value: 7, label: '1 week' },
  { value: 14, label: '2 weken' },
  { value: 30, label: '1 maand' },
  { value: 60, label: '2 maanden' },
];

export function QuoteForm({ bidId, onSuccess, onCancel, className }: QuoteFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [amountType, setAmountType] = useState<AmountType>('ESTIMATE');
  const [description, setDescription] = useState('');
  const [validDays, setValidDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (amountType !== 'TO_DISCUSS' && (isNaN(amountCents) || amountCents <= 0)) {
      setError('Vul een geldig bedrag in');
      return;
    }

    if (description.length < 10) {
      setError('Beschrijving moet minimaal 10 tekens bevatten');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidId,
          amount: amountType === 'TO_DISCUSS' ? 0 : amountCents,
          amountType,
          description,
          validDays,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Kon offerte niet versturen');
        return;
      }

      onSuccess?.(data.quote);
    } catch (err) {
      setError('Er is iets misgegaan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn('border-brand-200 bg-brand-50/30', className)}>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-brand-600" />
        <h3 className="font-semibold text-surface-900">Offerte versturen</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Type */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            Prijstype
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AMOUNT_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setAmountType(option.value)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all',
                  amountType === option.value
                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
                    : 'border-surface-200 hover:border-surface-300'
                )}
              >
                <span className="font-medium text-sm text-surface-900">{option.label}</span>
                <p className="text-xs text-surface-500 mt-0.5">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        {amountType !== 'TO_DISCUSS' && (
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-surface-700 mb-1">
              Bedrag {amountType === 'HOURLY' && '(per uur)'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Euro className="h-4 w-4 text-surface-400" />
              </div>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="block w-full pl-9 pr-4 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-surface-700 mb-1">
            Beschrijving
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Beschrijf wat er inbegrepen is in deze offerte, de werkzaamheden, materialen, etc."
            rows={4}
            className="block w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
          />
          <p className="text-xs text-surface-400 mt-1">
            {description.length}/2000 tekens (min. 10)
          </p>
        </div>

        {/* Validity Period */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Geldig tot
          </label>
          <div className="flex flex-wrap gap-2">
            {VALIDITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setValidDays(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-all',
                  validDays === option.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-surface-200 text-surface-600 hover:border-surface-300'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={loading} className="flex-1">
            <Send className="h-4 w-4 mr-2" />
            Offerte versturen
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
