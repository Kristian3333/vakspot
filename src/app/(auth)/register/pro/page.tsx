// src/app/(auth)/register/pro/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card } from '@/components/ui';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, Briefcase, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const proRegisterSchema = z.object({
  name: z.string().min(2, 'Minimaal 2 tekens'),
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Minimaal 6 tekens'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Minimaal 2 tekens'),
  phone: z.string().min(10, 'Ongeldig telefoonnummer'),
  city: z.string().min(2, 'Vul een stad in'),
  categories: z.array(z.string()).min(1, 'Selecteer minimaal één categorie'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
});

type ProRegisterInput = z.infer<typeof proRegisterSchema>;

type Category = {
  id: string;
  name: string;
};

export default function ProRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<ProRegisterInput>({
    resolver: zodResolver(proRegisterSchema),
    defaultValues: {
      categories: [],
    },
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : (data.categories || [])))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setValue('categories', selectedCategories);
  }, [selectedCategories, setValue]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const nextStep = async () => {
    const isValid = await trigger(['name', 'email', 'password', 'confirmPassword']);
    if (isValid) setStep(2);
  };

  const onSubmit = async (data: ProRegisterInput) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          companyName: data.companyName,
          phone: data.phone,
          city: data.city,
          categories: data.categories,
          serviceRadius: 25,
          role: 'PRO',
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Er ging iets mis');
        return;
      }
      router.push('/login?registered=true');
    } catch (err) {
      setError('Er ging iets mis');
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
            <Briefcase className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-surface-900">Vakman worden</h1>
          <p className="mt-2 text-surface-600">Stap {step} van 2</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600 mb-5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-5">
                <Input
                  label="Uw naam"
                  placeholder="Volledige naam"
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
                <Button type="button" onClick={nextStep} className="w-full">
                  Volgende
                </Button>
              </div>
            )}

            {/* Step 2: Business & Categories */}
            {step === 2 && (
              <div className="space-y-5">
                <Input
                  label="Bedrijfsnaam"
                  placeholder="Uw bedrijfsnaam"
                  error={errors.companyName?.message}
                  required
                  {...register('companyName')}
                />
                <Input
                  label="Telefoonnummer"
                  type="tel"
                  placeholder="06-12345678"
                  error={errors.phone?.message}
                  required
                  {...register('phone')}
                />
                <Input
                  label="Stad"
                  placeholder="Amsterdam"
                  error={errors.city?.message}
                  required
                  {...register('city')}
                />

                {/* Categories */}
                <div>
                  <label className="label">Uw vakgebied</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-lg border-2 p-3 text-left text-sm transition-colors',
                          selectedCategories.includes(category.id)
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-surface-200 hover:border-surface-300'
                        )}
                      >
                        {selectedCategories.includes(category.id) && (
                          <CheckCircle2 className="h-4 w-4 text-brand-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{category.name}</span>
                      </button>
                    ))}
                  </div>
                  {errors.categories && (
                    <p className="mt-1 text-sm text-error-500">{errors.categories.message}</p>
                  )}
                </div>

                <div className="text-xs text-surface-600">
                  Door te registreren gaat u akkoord met onze{' '}
                  <Link href="/terms" className="text-brand-600 hover:underline">voorwaarden</Link>
                  {' '}en{' '}
                  <Link href="/privacy" className="text-brand-600 hover:underline">privacybeleid</Link>.
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Terug
                  </Button>
                  <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                    Account aanmaken
                  </Button>
                </div>
              </div>
            )}
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
