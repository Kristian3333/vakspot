// src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Button, Input, Card } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const registered = searchParams.get('registered');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (registered === 'true') {
      setShowSuccess(true);
    }
  }, [registered]);

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

    // Fetch session to get user role and redirect accordingly
    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();
    
    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (session?.user?.role === 'PRO') {
      router.push('/pro/jobs');
    } else if (session?.user?.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/client/jobs');
    }
    
    router.refresh();
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
          <h1 className="text-2xl font-bold text-surface-900">Inloggen</h1>
          <p className="mt-2 text-surface-600">Welkom terug bij VakSpot</p>
        </div>

        <Card>
          {showSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success-50 p-3 text-sm text-success-700 mb-5">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              Account aangemaakt! U kunt nu inloggen.
            </div>
          )}

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

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Inloggen
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-200 text-center">
            <p className="text-sm text-surface-600">
              Nog geen account?{' '}
              <Link href="/" className="font-semibold text-brand-600 hover:text-brand-700">
                Registreren
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
