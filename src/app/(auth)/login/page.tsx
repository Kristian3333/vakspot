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
import { AlertCircle, CheckCircle2, User, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const registered = searchParams.get('registered');
  const isPro = searchParams.get('pro');
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

    // If there's a callback URL, use it, otherwise let the server determine redirect
    // We'll fetch the session to get the role and redirect accordingly
    const sessionRes = await fetch('/api/auth/session');
    const session = await sessionRes.json();
    
    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (session?.user?.role === 'PRO') {
      router.push('/pro/leads');
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-900">Welkom terug</h1>
          <p className="mt-2 text-surface-600">
            Log in op uw VakSpot account
          </p>
        </div>

        {/* User type indicator */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
              <User className="h-4 w-4 text-brand-600" />
            </div>
            <span>Opdrachtgevers</span>
          </div>
          <div className="text-surface-300">|</div>
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
              <Briefcase className="h-4 w-4 text-brand-600" />
            </div>
            <span>Vakmensen</span>
          </div>
        </div>

        <Card>
          {showSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success-50 p-3 text-sm text-success-700 mb-5">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {isPro === 'true' 
                ? 'Uw vakman account is aangemaakt! U kunt nu inloggen.'
                : 'Uw account is aangemaakt! U kunt nu inloggen.'
              }
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-surface-300" />
                <span className="text-surface-600">Onthoud mij</span>
              </label>
              <Link href="/forgot-password" className="text-brand-600 hover:text-brand-700 hover:underline">
                Wachtwoord vergeten?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Inloggen
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-surface-200">
            <p className="text-center text-sm text-surface-600">
              Nog geen account?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href="/register" className="block">
                <Button variant="outline" className="w-full text-sm">
                  <User className="h-4 w-4 mr-1" />
                  Klus plaatsen
                </Button>
              </Link>
              <Link href="/register/pro" className="block">
                <Button variant="outline" className="w-full text-sm">
                  <Briefcase className="h-4 w-4 mr-1" />
                  Vakman worden
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
