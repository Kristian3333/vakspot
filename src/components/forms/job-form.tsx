// src/components/forms/job-form.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea, Select, Card } from '@/components/ui';
import { createJobSchema, type CreateJobInput } from '@/lib/validations';
import { 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  X, 
  Image as ImageIcon,
  Check,
  FileText,
  MapPin,
  Clock 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
};

interface JobFormProps {
  categories: Category[];
  initialCategorySlug?: string;
}

const STEPS = [
  { id: 1, title: 'Categorie', icon: FileText },
  { id: 2, title: 'Details', icon: FileText },
  { id: 3, title: 'Locatie', icon: MapPin },
  { id: 4, title: 'Planning', icon: Clock },
];

const TIMELINE_OPTIONS = [
  { value: 'URGENT', label: 'Urgent - Binnen enkele dagen' },
  { value: 'THIS_WEEK', label: 'Deze week' },
  { value: 'THIS_MONTH', label: 'Deze maand' },
  { value: 'NEXT_MONTH', label: 'Volgende maand' },
  { value: 'FLEXIBLE', label: 'Flexibel - Geen haast' },
];

const BUDGET_TYPE_OPTIONS = [
  { value: 'ESTIMATE', label: 'Schatting' },
  { value: 'FIXED', label: 'Vaste prijs' },
  { value: 'HOURLY', label: 'Uurtarief' },
  { value: 'TO_DISCUSS', label: 'In overleg' },
];

export function JobForm({ categories, initialCategorySlug }: JobFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialCategorySlug ? 2 : 1);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const initialCategory = initialCategorySlug
    ? categories.find((c) => c.slug === initialCategorySlug)
    : null;

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      categoryId: initialCategory?.id || '',
      budgetType: 'ESTIMATE',
      timeline: 'FLEXIBLE',
    },
  });

  const selectedCategoryId = watch('categoryId');

  // Image handling
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError('Maximaal 5 foto\'s toegestaan');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 10 * 1024 * 1024) return false; // 10MB max
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setImageUrls((prev) => [...prev, url]);
    });
  }, [images.length]);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Step navigation
  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateJobInput)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['categoryId'];
    } else if (step === 2) {
      fieldsToValidate = ['title', 'description'];
    } else if (step === 3) {
      fieldsToValidate = ['locationCity', 'locationPostcode'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Form submission
  const onSubmit = async (data: CreateJobInput) => {
    setError(null);
    setIsUploading(true);

    try {
      // Upload images first if any
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => formData.append('files', image));
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Foto\'s uploaden mislukt');
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrls = uploadData.urls;
      }

      // Create job
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images: uploadedImageUrls,
          budgetMin: data.budgetMin ? data.budgetMin * 100 : undefined, // Convert to cents
          budgetMax: data.budgetMax ? data.budgetMax * 100 : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Er is iets misgegaan');
      }

      router.push(`/client/jobs/${result.id}?created=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                  step > s.id
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : step === s.id
                    ? 'border-brand-500 text-brand-500'
                    : 'border-surface-300 text-surface-400'
                )}
              >
                {step > s.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-1 mx-2 rounded transition-colors',
                    step > s.id ? 'bg-brand-500' : 'bg-surface-200'
                  )}
                  style={{ width: '40px' }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 px-1">
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={cn(
                'text-xs font-medium',
                step >= s.id ? 'text-brand-600' : 'text-surface-400'
              )}
            >
              {s.title}
            </span>
          ))}
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 1: Category */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-surface-900">
                  Wat voor klus heeft u?
                </h2>
                <p className="mt-1 text-surface-600">
                  Selecteer de categorie die het beste past
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setValue('categoryId', cat.id)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      selectedCategoryId === cat.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-surface-200 hover:border-surface-300'
                    )}
                  >
                    <span className="font-medium text-surface-900">{cat.name}</span>
                    {cat.description && (
                      <p className="mt-1 text-sm text-surface-500 line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
              {errors.categoryId && (
                <p className="text-sm text-error-500">{errors.categoryId.message}</p>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-surface-900">
                  Beschrijf uw klus
                </h2>
                <p className="mt-1 text-surface-600">
                  Hoe meer detail, hoe beter de offertes
                </p>
              </div>

              <Input
                label="Titel"
                placeholder="Bijv: Woonkamer schilderen"
                error={errors.title?.message}
                required
                {...register('title')}
              />

              <Textarea
                label="Beschrijving"
                placeholder="Beschrijf de klus zo gedetailleerd mogelijk. Denk aan: afmetingen, materialen, huidige staat, wensen, etc."
                rows={5}
                error={errors.description?.message}
                required
                {...register('description')}
              />

              {/* Image upload */}
              <div>
                <label className="label">Foto's (optioneel)</label>
                <p className="text-sm text-surface-500 mb-3">
                  Voeg foto's toe voor een betere inschatting
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-surface-100">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-surface-900/60 text-white hover:bg-surface-900/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-surface-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors">
                      <Upload className="h-6 w-6 text-surface-400" />
                      <span className="mt-1 text-xs text-surface-500">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-surface-400">
                  Max 5 foto's, max 10MB per foto
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-surface-900">
                  Waar moet de klus worden uitgevoerd?
                </h2>
                <p className="mt-1 text-surface-600">
                  We gebruiken dit om vakmensen in uw buurt te vinden
                </p>
              </div>

              <Input
                label="Adres"
                placeholder="Straatnaam + huisnummer (optioneel)"
                error={errors.locationAddress?.message}
                {...register('locationAddress')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Stad"
                  placeholder="Amsterdam"
                  error={errors.locationCity?.message}
                  required
                  {...register('locationCity')}
                />
                <Input
                  label="Postcode"
                  placeholder="1234 AB"
                  error={errors.locationPostcode?.message}
                  required
                  {...register('locationPostcode')}
                />
              </div>
            </div>
          )}

          {/* Step 4: Planning & Budget */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-surface-900">
                  Wanneer en budget
                </h2>
                <p className="mt-1 text-surface-600">
                  Help vakmensen een goede inschatting te maken
                </p>
              </div>

              <Select
                label="Wanneer moet de klus worden uitgevoerd?"
                options={TIMELINE_OPTIONS}
                error={errors.timeline?.message}
                {...register('timeline')}
              />

              <Select
                label="Budget type"
                options={BUDGET_TYPE_OPTIONS}
                error={errors.budgetType?.message}
                {...register('budgetType')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum budget (€)"
                  type="number"
                  placeholder="500"
                  error={errors.budgetMin?.message}
                  {...register('budgetMin', { valueAsNumber: true })}
                />
                <Input
                  label="Maximum budget (€)"
                  type="number"
                  placeholder="1000"
                  error={errors.budgetMax?.message}
                  {...register('budgetMax', { valueAsNumber: true })}
                />
              </div>
              <p className="text-sm text-surface-500">
                Budget is optioneel maar helpt vakmensen een betere offerte te geven
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4 border-t border-surface-200">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Terug
              </Button>
            )}
            
            {step < 4 ? (
              <Button
                type="button"
                className="flex-1"
                onClick={nextStep}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Volgende
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1"
                isLoading={isSubmitting || isUploading}
              >
                Klus plaatsen
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
