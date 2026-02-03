// src/app/settings/email/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Spinner } from '@/components/ui';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetch('/api/settings/account')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentEmail(data.user.email);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Kon gegevens niet laden');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (!newEmail || !password) {
      setError('Vul alle velden in');
      setSaving(false);
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError('Voer een geldig e-mailadres in');
      setSaving(false);
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError('Nieuw e-mailadres is hetzelfde als het huidige');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/settings/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'E-mail wijzigen mislukt');
      }

      setSuccess(true);
      setCurrentEmail(newEmail.toLowerCase());
      setNewEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
              <Mail className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">E-mailadres</h1>
              <p className="text-surface-600">Wijzig uw e-mailadres</p>
            </div>
          </div>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl text-success-700">
            E-mailadres succesvol gewijzigd!
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700">
            {error}
          </div>
        )}

        {/* Current email */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Huidig e-mailadres</h2>
          <p className="text-surface-900 font-medium">{currentEmail}</p>
        </Card>

        {/* Change email form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">E-mailadres wijzigen</h2>

            <div className="space-y-4">
              <Input
                label="Nieuw e-mailadres"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nieuw@voorbeeld.nl"
                required
              />

              <Input
                label="Wachtwoord ter bevestiging"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Uw huidige wachtwoord"
                required
              />
            </div>

            <div className="mt-4 p-3 bg-surface-100 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-surface-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-surface-600">
                Na het wijzigen van uw e-mailadres moet u opnieuw inloggen met het nieuwe adres.
              </p>
            </div>
          </Card>

          {/* Save button */}
          <div className="flex gap-3">
            <Button type="submit" isLoading={saving}>
              E-mailadres wijzigen
            </Button>
            <Link href="/settings">
              <Button type="button" variant="outline">Annuleren</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
