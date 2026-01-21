// src/app/profile/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Button, Input, Avatar, Spinner } from '@/components/ui';
import { ArrowLeft, Camera, Save, AlertCircle } from 'lucide-react';

type Profile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data?.user) {
          setProfile(data.user);
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Er is iets misgegaan');
      }

      setSuccess(true);
      setTimeout(() => router.push('/profile'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
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

  if (!profile) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar profiel
          </Link>
          <h1 className="text-2xl font-bold text-surface-900">Profiel bewerken</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Avatar src={profile.image} name={profile.name} size="xl" />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-600 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h3 className="font-medium text-surface-900">Profielfoto</h3>
                <p className="text-sm text-surface-500">
                  Klik op het icoon om uw foto te wijzigen
                </p>
              </div>
            </div>

            {/* Error/Success messages */}
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-error-50 p-4 text-sm text-error-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-success-50 p-4 text-sm text-success-600">
                <Save className="h-5 w-5 flex-shrink-0" />
                Profiel bijgewerkt! U wordt doorgestuurd...
              </div>
            )}

            {/* Form fields */}
            <div className="space-y-4">
              <div>
                <label className="label">Naam</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Uw volledige naam"
                />
              </div>

              <div>
                <label className="label">E-mailadres</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="uw@email.nl"
                />
                <p className="mt-1 text-xs text-surface-500">
                  Als u uw e-mailadres wijzigt, moet u dit opnieuw verifiëren.
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
              Opslaan
            </Button>
            <Link href="/profile">
              <Button type="button" variant="ghost">
                Annuleren
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
