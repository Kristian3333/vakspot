// src/app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card } from '@/components/ui';
import { registerClientSchema, type RegisterClientInput } from '@/lib/validations';
import { AlertCircle, User, Briefcase, ArrowRight, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserType = 'client' | 'pro' | null;

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterClientInput>({
    resolver: zodResolver(registerClientSchema),
  });

  const onSubmit = async (data: RegisterClientInput) => {
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'CLIENT' }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Er is iets misgegaan');
        return;
      }

      // Redirect to login
      router.push('/login?registered=true');
    } catch (err) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
    }
  };

  // Role selection screen
  if (userType === null) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-surface-900">Account aanmaken</h1>
            <p className="mt-2 text-surface-600">
              Kies hoe u VakSpot wilt gebruiken
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Client option */}
            <button
              onClick={() => setUserType('client')}
              className={cn(
                'group relative rounded-2xl border-2 border-surface-200 bg-white p-8 text-left transition-all hover:border-brand-500 hover:shadow-soft-lg'
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-100 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <User className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-surface-900">
                Ik zoek een vakman
              </h3>
              <p className="mt-2 text-surface-600">
                Plaats klussen en ontvang offertes van vakmensen bij u in de buurt.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-brand-600 group-hover:text-brand-700">
                Gratis registreren
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </button>

            {/* Pro option */}
            <button
              onClick={() => router.push('/register/pro')}
              className={cn(
                'group relative rounded-2xl border-2 border-surface-200 bg-white p-8 text-left transition-all hover:border-brand-500 hover:shadow-soft-lg'
              )}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-100 text-surface-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <Briefcase className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-surface-900">
                Ik ben vakman
              </h3>
              <p className="mt-2 text-surface-600">
                Krijg toegang tot klussen en breid uw klantenbestand uit.
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-brand-600 group-hover:text-brand-700">
                Vakman worden
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </button>
          </div>

          {/* Login link - more prominent */}
          <div className="mt-8 p-4 rounded-xl bg-surface-50 border border-surface-200">
            <p className="text-center text-sm text-surface-600">
              Heeft u al een account?{' '}
              <Link 
                href="/login" 
                className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                <LogIn className="h-4 w-4" />
                Inloggen
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Client registration form
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-900">Registreren</h1>
          <p className="mt-2 text-surface-600">
            Maak een gratis account aan als opdrachtgever
          </p>
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
              type="text"
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
              placeholder="Herhaal uw wachtwoord"
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Stad"
                type="text"
                placeholder="Amsterdam"
                error={errors.city?.message}
                {...register('city')}
              />
              <Input
                label="Postcode"
                type="text"
                placeholder="1234 AB"
                error={errors.postcode?.message}
                {...register('postcode')}
              />
            </div>

            <div className="text-sm text-surface-600">
              Door te registreren gaat u akkoord met onze{' '}
              <Link href="/terms" className="text-brand-600 hover:text-brand-700 hover:underline">
                algemene voorwaarden
              </Link>{' '}
              en{' '}
              <Link href="/privacy" className="text-brand-600 hover:text-brand-700 hover:underline">
                privacybeleid
              </Link>
              .
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Account aanmaken
            </Button>
          </form>

          {/* Login link - more prominent */}
          <div className="mt-6 pt-6 border-t border-surface-200">
            <p className="text-center text-sm text-surface-600">
              Heeft u al een account?{' '}
              <Link 
                href="/login" 
                className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                <LogIn className="h-4 w-4" />
                Inloggen
              </Link>
            </p>
          </div>
        </Card>

        <button
          onClick={() => setUserType(null)}
          className="mt-4 w-full text-center text-sm text-surface-500 hover:text-surface-700"
        >
          ← Terug naar keuze
        </button>
      </div>
    </div>
  );
}
