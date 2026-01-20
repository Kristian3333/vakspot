// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Button, Input, Card } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Ongeldige e-mail of wachtwoord');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-900">Welkom terug</h1>
          <p className="mt-2 text-surface-600">
            Log in op uw VakSpot account
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
              label="E-mailadres"
              type="email"
              placeholder="uw@email.nl"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Wachtwoord"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-surface-300" />
                <span className="text-surface-600">Onthoud mij</span>
              </label>
              <Link href="/forgot-password" className="link">
                Wachtwoord vergeten?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Inloggen
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-600">
            Nog geen account?{' '}
            <Link href="/register" className="link font-medium">
              Registreer nu
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
