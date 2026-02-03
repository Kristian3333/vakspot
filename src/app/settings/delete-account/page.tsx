// src/app/settings/delete-account/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'confirm'>('info');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'VERWIJDEREN') {
      setError('Typ "VERWIJDEREN" om te bevestigen');
      return;
    }

    if (!password) {
      setError('Voer uw wachtwoord in');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch('/api/settings/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Account verwijderen mislukt');
      }

      // Sign out and redirect
      await signOut({ redirect: false });
      router.push('/?deleted=true');
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar instellingen
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100">
              <Trash2 className="h-5 w-5 text-error-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-error-900">Account verwijderen</h1>
              <p className="text-error-600">Deze actie kan niet ongedaan worden gemaakt</p>
            </div>
          </div>
        </div>

        {step === 'info' && (
          <>
            {/* Warning Card */}
            <Card className="mb-6 border-warning-200 bg-warning-50">
              <div className="flex gap-4">
                <AlertTriangle className="h-6 w-6 text-warning-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-semibold text-warning-900 mb-2">Let op!</h2>
                  <p className="text-warning-800">
                    Als u uw account verwijdert, worden de volgende gegevens permanent verwijderd:
                  </p>
                </div>
              </div>
            </Card>

            {/* What will be deleted */}
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Wat wordt verwijderd?</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-error-100 text-error-600 text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium text-surface-900">Uw profiel en accountgegevens</p>
                    <p className="text-sm text-surface-500">Naam, e-mailadres, en alle profielinformatie</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-error-100 text-error-600 text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium text-surface-900">Alle klussen en offertes</p>
                    <p className="text-sm text-surface-500">Geplaatste klussen, ontvangen interesse, en alle gerelateerde gegevens</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-error-100 text-error-600 text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium text-surface-900">Alle berichten en gesprekken</p>
                    <p className="text-sm text-surface-500">Chatgeschiedenis met andere gebruikers</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-error-100 text-error-600 text-sm font-bold">4</span>
                  <div>
                    <p className="font-medium text-surface-900">Beoordelingen</p>
                    <p className="text-sm text-surface-500">Door u gegeven en ontvangen beoordelingen</p>
                  </div>
                </li>
              </ul>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-error-300 text-error-600 hover:bg-error-50"
                onClick={() => setStep('confirm')}
              >
                Ik begrijp het, ga verder
              </Button>
              <Link href="/settings">
                <Button variant="outline">Annuleren</Button>
              </Link>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700">
                {error}
              </div>
            )}

            {/* Final confirmation */}
            <Card className="mb-6 border-error-200">
              <h2 className="text-lg font-semibold text-error-900 mb-4">Bevestig verwijdering</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Typ <span className="font-bold text-error-600">VERWIJDEREN</span> om te bevestigen
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="VERWIJDEREN"
                    className="font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Voer uw wachtwoord in
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Uw wachtwoord"
                  />
                </div>
              </div>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                isLoading={deleting}
                className="bg-error-600 hover:bg-error-700 text-white"
                disabled={confirmText !== 'VERWIJDEREN' || !password}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Account permanent verwijderen
              </Button>
              <Button variant="outline" onClick={() => setStep('info')}>
                Terug
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
