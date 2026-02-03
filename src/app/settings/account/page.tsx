// src/app/settings/account/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Input, Spinner } from '@/components/ui';
import { ArrowLeft, User, Save } from 'lucide-react';
import Link from 'next/link';

type UserData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export default function AccountSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/settings/account')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || '');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Kon gegevens niet laden');
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/settings/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Opslaan mislukt');
      }

      setSuccess(true);
      // Update local state
      if (user) {
        setUser({ ...user, name: name.trim() });
      }
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
              <User className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">Account</h1>
              <p className="text-surface-600">Beheer uw persoonlijke gegevens</p>
            </div>
          </div>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl text-success-700">
            Gegevens opgeslagen!
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700">
            {error}
          </div>
        )}

        {/* Account Info */}
        <form onSubmit={handleSave}>
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Persoonlijke gegevens</h2>

            <div className="space-y-4">
              <Input
                label="Naam"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSuccess(false);
                }}
                placeholder="Uw volledige naam"
                required
              />

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  E-mailadres
                </label>
                <p className="text-surface-900 py-2">{user?.email}</p>
                <p className="text-xs text-surface-500">
                  Ga naar <Link href="/settings/email" className="text-brand-600 hover:underline">E-mail instellingen</Link> om uw e-mailadres te wijzigen.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Account type
                </label>
                <p className="text-surface-900 py-2">
                  {user?.role === 'PRO' ? 'Vakman' : user?.role === 'ADMIN' ? 'Beheerder' : 'Opdrachtgever'}
                </p>
              </div>

              {user?.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Lid sinds
                  </label>
                  <p className="text-surface-900 py-2">
                    {new Date(user.createdAt).toLocaleDateString('nl-NL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Save button */}
          <div className="flex gap-3">
            <Button type="submit" isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
              Opslaan
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
