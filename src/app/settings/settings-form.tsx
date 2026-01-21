// src/app/settings/settings-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@/components/ui';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

interface SettingsFormProps {
  user: User;
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Er is iets misgegaan');
      }

      setSuccess('Uw naam is bijgewerkt');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="font-semibold text-surface-900 mb-4">Snelle instellingen</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-success-50 p-3 text-sm text-success-600">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            {success}
          </div>
        )}

        <Input
          label="Naam"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Uw volledige naam"
        />

        <Input
          label="E-mailadres"
          value={user.email}
          disabled
          className="bg-surface-50"
        />

        <Button type="submit" isLoading={isLoading}>
          Opslaan
        </Button>
      </form>
    </Card>
  );
}
