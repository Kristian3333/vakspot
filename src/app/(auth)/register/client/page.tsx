// src/app/(auth)/register/client/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card } from '@/components/ui';
import { z } from 'zod';
import { AlertCircle, User, ArrowLeft } from 'lucide-react';

const clientRegisterSchema = z.object({
  name: z.string().min(2, 'Minimaal 2 tekens'),
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Minimaal 6 tekens'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
});

type ClientRegisterInput = z.infer<typeof clientRegisterSchema>;

export default function ClientRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientRegisterInput>({
    resolver: zodResolver(clientRegisterSchema),
  });

  const onSubmit = async (data: ClientRegisterInput) => {
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'CLIENT' 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Er ging iets mis');
        return;
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError('Er ging iets mis. Probeer opnieuw.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug
        </Link>

        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100">
            <User className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-surface-900">Account aanmaken</h1>
          <p className="mt-2 text-surface-600">Als opdrachtgever</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Input
              label="Naam"
              placeholder="Uw volledige naam"
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label="E-mailadres"
              type="email"
              placeholder="uw@email.nl"
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Wachtwoord"
              type="password"
              placeholder="Minimaal 6 tekens"
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Input
              label="Wachtwoord bevestigen"
              type="password"
              placeholder="Herhaal wachtwoord"
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <div className="text-xs text-surface-600">
              Door te registreren gaat u akkoord met onze{' '}
              <Link href="/terms" className="text-brand-600 hover:underline">
                voorwaarden
              </Link>{' '}
              en{' '}
              <Link href="/privacy" className="text-brand-600 hover:underline">
                privacybeleid
              </Link>.
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Account aanmaken
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-200 text-center">
            <p className="text-sm text-surface-600">
              Al een account?{' '}
              <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Inloggen
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
