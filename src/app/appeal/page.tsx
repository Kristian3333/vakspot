// src/app/appeal/page.tsx
// P2B Compliance: Appeal form for suspended users
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Textarea } from '@/components/ui';
import { ArrowLeft, Scale, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AppealPage() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 20) {
      setError('Uw toelichting moet minimaal 20 tekens bevatten');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SUSPENSION',
          reason: reason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Er ging iets mis');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <Card className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-success-600" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 mb-2">
              Bezwaar ontvangen
            </h1>
            <p className="text-surface-600 mb-6">
              Bedankt voor uw bezwaar. Wij zullen dit binnen 14 werkdagen beoordelen.
              U ontvangt een e-mail wanneer er een beslissing is genomen.
            </p>
            <Button onClick={() => router.push('/suspended')}>
              Terug naar overzicht
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Back link */}
        <Link
          href="/suspended"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug
        </Link>

        <Card>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-brand-100">
              <Scale className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">Bezwaar maken</h1>
              <p className="text-surface-600">
                Leg uit waarom u denkt dat de schorsing onterecht is
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-lg bg-surface-50 border border-surface-200 mb-6">
            <h2 className="font-medium text-surface-900 mb-2">Wat gebeurt er met uw bezwaar?</h2>
            <ul className="text-sm text-surface-600 space-y-2">
              <li>• Uw bezwaar wordt door ons team beoordeeld</li>
              <li>• Wij nemen binnen 14 werkdagen een beslissing</li>
              <li>• U ontvangt een e-mail met de uitkomst</li>
              <li>• Bij goedkeuring wordt uw account direct hersteld</li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Uw toelichting *
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Leg uit waarom u denkt dat de schorsing onterecht is. Geef zo veel mogelijk details..."
                rows={6}
              />
              <p className="text-xs text-surface-500 mt-1">
                Minimaal 20 tekens ({reason.length}/2000)
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-error-50 border border-error-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-error-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error-700">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/suspended')}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                isLoading={submitting}
                disabled={reason.trim().length < 20}
                className="flex-1"
              >
                Bezwaar indienen
              </Button>
            </div>
          </form>
        </Card>

        {/* Legal notice */}
        <p className="text-center text-xs text-surface-400 mt-6">
          Conform de Platform-to-Business verordening (P2B) heeft u het recht om bezwaar te maken
          tegen beslissingen die invloed hebben op uw gebruik van het platform. Uw persoonsgegevens
          worden verwerkt volgens ons{' '}
          <Link href="/privacy" className="text-brand-600 hover:underline">
            privacybeleid
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
