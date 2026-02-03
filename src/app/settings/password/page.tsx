// src/app/settings/password/page.tsx
'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function PasswordSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Nieuwe wachtwoorden komen niet overeen');
      setSaving(false);
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens zijn');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Wachtwoord wijzigen mislukt');
      }

      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis');
    } finally {
      setSaving(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
              <Lock className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">Wachtwoord</h1>
              <p className="text-surface-600">Wijzig uw wachtwoord</p>
            </div>
          </div>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl text-success-700">
            Wachtwoord succesvol gewijzigd!
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700">
            {error}
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Wachtwoord wijzigen</h2>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="Huidig wachtwoord"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Uw huidige wachtwoord"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-8 text-surface-400 hover:text-surface-600"
                >
                  {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Nieuw wachtwoord"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Minimaal 8 tekens"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-8 text-surface-400 hover:text-surface-600"
                >
                  {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Bevestig nieuw wachtwoord"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Herhaal nieuw wachtwoord"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-8 text-surface-400 hover:text-surface-600"
                >
                  {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm text-surface-500">
              Kies een sterk wachtwoord met minimaal 8 tekens. Gebruik een combinatie van letters, cijfers en speciale tekens.
            </p>
          </Card>

          {/* Save button */}
          <div className="flex gap-3">
            <Button type="submit" isLoading={saving}>
              Wachtwoord wijzigen
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
