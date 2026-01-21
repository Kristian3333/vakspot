// src/app/(auth)/register/pro/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Card } from '@/components/ui';
import { registerProSchema, type RegisterProInput } from '@/lib/validations';
import { AlertCircle, CheckCircle2, Building2, MapPin, Wrench, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
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
  } = useForm<RegisterProInput>({
    resolver: zodResolver(registerProSchema),
    defaultValues: {
      serviceRadius: 25,
      categories: [],
    },
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
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
    let fieldsToValidate: (keyof RegisterProInput)[] = [];
    if (step === 1) fieldsToValidate = ['name', 'email', 'password', 'confirmPassword'];
    else if (step === 2) fieldsToValidate = ['companyName', 'phone', 'city', 'postcode'];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data: RegisterProInput) => {
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role: 'PRO' }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Er is iets misgegaan');
        return;
      }
      router.push('/login?registered=true&pro=true');
    } catch (err) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-900">Vakman worden</h1>
          <p className="mt-2 text-surface-600">Krijg toegang tot duizenden klussen</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                step >= s ? 'bg-brand-500 text-white' : 'bg-surface-200 text-surface-500'
              )}>
                {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={cn('h-1 w-12 mx-2 rounded-full transition-colors', step > s ? 'bg-brand-500' : 'bg-surface-200')} />}
            </div>
          ))}
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600 mb-5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <Building2 className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-surface-900">Account aanmaken</h2>
                    <p className="text-sm text-surface-500">Uw persoonlijke gegevens</p>
                  </div>
                </div>
                <Input label="Uw naam" type="text" placeholder="Volledige naam" error={errors.name?.message} required {...register('name')} />
                <Input label="E-mailadres" type="email" placeholder="uw@email.nl" error={errors.email?.message} required {...register('email')} />
                <Input label="Wachtwoord" type="password" placeholder="Minimaal 6 tekens" error={errors.password?.message} required {...register('password')} />
                <Input label="Wachtwoord bevestigen" type="password" placeholder="Herhaal uw wachtwoord" error={errors.confirmPassword?.message} required {...register('confirmPassword')} />
                <Button type="button" onClick={nextStep} className="w-full">Volgende</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <MapPin className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-surface-900">Bedrijfsgegevens</h2>
                    <p className="text-sm text-surface-500">Over uw bedrijf</p>
                  </div>
                </div>
                <Input label="Bedrijfsnaam" type="text" placeholder="Uw bedrijfsnaam" error={errors.companyName?.message} required {...register('companyName')} />
                <Input label="KVK nummer" type="text" placeholder="12345678" hint="Optioneel" error={errors.kvkNumber?.message} {...register('kvkNumber')} />
                <Input label="Telefoonnummer" type="tel" placeholder="06-12345678" error={errors.phone?.message} required {...register('phone')} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Stad" type="text" placeholder="Amsterdam" error={errors.city?.message} required {...register('city')} />
                  <Input label="Postcode" type="text" placeholder="1234 AB" error={errors.postcode?.message} required {...register('postcode')} />
                </div>
                <div>
                  <label className="label">Werkgebied (km radius)</label>
                  <input type="range" min="5" max="100" step="5" className="w-full" {...register('serviceRadius', { valueAsNumber: true })} />
                  <div className="flex justify-between text-sm text-surface-500"><span>5 km</span><span>100 km</span></div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">Terug</Button>
                  <Button type="button" onClick={nextStep} className="flex-1">Volgende</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <Wrench className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-surface-900">Uw vakgebied</h2>
                    <p className="text-sm text-surface-500">Selecteer minimaal één categorie</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button key={category.id} type="button" onClick={() => toggleCategory(category.id)}
                      className={cn('flex items-center gap-2 rounded-lg border-2 p-3 text-left text-sm transition-colors',
                        selectedCategories.includes(category.id) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-surface-200 hover:border-surface-300')}>
                      {selectedCategories.includes(category.id) && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
                      {category.name}
                    </button>
                  ))}
                </div>
                {errors.categories && <p className="text-sm text-error-500">{errors.categories.message}</p>}
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
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={prevStep} className="flex-1">Terug</Button>
                  <Button type="submit" className="flex-1" isLoading={isSubmitting}>Account aanmaken</Button>
                </div>
              </div>
            )}
          </form>
        </Card>

        {/* Login link - more prominent */}
        <div className="mt-6 p-4 rounded-xl bg-surface-50 border border-surface-200">
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
