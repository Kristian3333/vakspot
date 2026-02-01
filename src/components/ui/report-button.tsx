// src/components/ui/report-button.tsx
// DSA Compliance: Reusable "Melden" (Report) button component
'use client';

import { useState } from 'react';
import { Flag, X, AlertTriangle, Check } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

type ReportType = 'JOB' | 'PROFILE' | 'MESSAGE';
type ReportReason = 'SPAM' | 'FRAUD' | 'INAPPROPRIATE' | 'ILLEGAL' | 'HARASSMENT' | 'OTHER';

interface ReportButtonProps {
  type: ReportType;
  targetId: string;
  className?: string;
  variant?: 'icon' | 'text' | 'full';
}

const REASON_LABELS: Record<ReportReason, { label: string; description: string }> = {
  SPAM: { label: 'Spam', description: 'Ongewenste reclame of herhaalde berichten' },
  FRAUD: { label: 'Fraude', description: 'Misleidende informatie of oplichting' },
  INAPPROPRIATE: { label: 'Ongepast', description: 'Onprofessioneel of beledigend gedrag' },
  ILLEGAL: { label: 'Illegaal', description: 'Content die in strijd is met de wet' },
  HARASSMENT: { label: 'Intimidatie', description: 'Bedreigingen of pestgedrag' },
  OTHER: { label: 'Anders', description: 'Andere reden (beschrijf hieronder)' },
};

const TYPE_LABELS: Record<ReportType, string> = {
  JOB: 'klus',
  PROFILE: 'profiel',
  MESSAGE: 'bericht',
};

export function ReportButton({ type, targetId, className, variant = 'text' }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          targetId,
          reason,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Er ging iets mis');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setReason(null);
        setDescription('');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    setReason(null);
    setDescription('');
    setError(null);
    setIsSuccess(false);
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === 'icon' && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'p-2 rounded-lg text-surface-400 hover:text-error-500 hover:bg-error-50 transition-colors',
            className
          )}
          title="Melden"
        >
          <Flag className="h-4 w-4" />
        </button>
      )}

      {variant === 'text' && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-error-500 transition-colors',
            className
          )}
        >
          <Flag className="h-3.5 w-3.5" />
          Melden
        </button>
      )}

      {variant === 'full' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          leftIcon={<Flag className="h-4 w-4" />}
          className={cn('text-surface-500 hover:text-error-500', className)}
        >
          Melden
        </Button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-error-100">
                  <AlertTriangle className="h-5 w-5 text-error-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-surface-900">
                    {TYPE_LABELS[type].charAt(0).toUpperCase() + TYPE_LABELS[type].slice(1)} melden
                  </h2>
                  <p className="text-sm text-surface-500">
                    Meld ongepaste of illegale content
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5 text-surface-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 rounded-full bg-success-100 flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-success-600" />
                  </div>
                  <h3 className="font-semibold text-surface-900">Melding ontvangen</h3>
                  <p className="text-sm text-surface-500 mt-1">
                    Bedankt voor uw melding. Wij onderzoeken dit zo snel mogelijk.
                  </p>
                </div>
              ) : (
                <>
                  {/* Info box */}
                  <div className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                    <p className="text-sm text-surface-600">
                      <strong>Wat kunt u melden?</strong><br />
                      Spam, fraude, illegale content, intimidatie, of andere overtredingen van onze voorwaarden.
                      Wij bekijken elke melding zorgvuldig.
                    </p>
                  </div>

                  {/* Reason selection */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Reden van melding *
                    </label>
                    <div className="space-y-2">
                      {(Object.entries(REASON_LABELS) as [ReportReason, typeof REASON_LABELS[ReportReason]][]).map(
                        ([key, { label, description }]) => (
                          <label
                            key={key}
                            className={cn(
                              'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                              reason === key
                                ? 'border-brand-500 bg-brand-50'
                                : 'border-surface-200 hover:border-surface-300'
                            )}
                          >
                            <input
                              type="radio"
                              name="reason"
                              value={key}
                              checked={reason === key}
                              onChange={() => setReason(key)}
                              className="mt-0.5"
                            />
                            <div>
                              <span className="font-medium text-surface-900">{label}</span>
                              <p className="text-sm text-surface-500">{description}</p>
                            </div>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Toelichting (optioneel)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Beschrijf het probleem..."
                      rows={3}
                      maxLength={1000}
                      className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none"
                    />
                    <p className="text-xs text-surface-400 mt-1">
                      {description.length}/1000 tekens
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 rounded-lg bg-error-50 border border-error-200">
                      <p className="text-sm text-error-700">{error}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!isSuccess && (
              <div className="flex gap-3 p-4 border-t border-surface-200">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Annuleren
                </Button>
                <Button
                  variant="danger"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={!reason || isSubmitting}
                  className="flex-1"
                >
                  Melden
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
