// src/components/forms/job-form.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea, Select, Card } from '@/components/ui';
import { z } from 'zod';
import { AlertCircle, Upload, X, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

// Dutch postal code validation
const dutchPostcodeRegex = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

// Simplified validation schema with Dutch postal code
const simpleJobSchema = z.object({
  categoryId: z.string().min(1, 'Selecteer een categorie'),
  title: z.string().min(5, 'Minimaal 5 tekens').max(100),
  description: z.string().min(20, 'Minimaal 20 tekens').max(5000),
  locationCity: z.string().min(2, 'Vul een stad in'),
  locationPostcode: z.string()
    .min(1, 'Postcode is verplicht')
    .refine((val) => dutchPostcodeRegex.test(val.replace(/\s/g, '')), {
      message: 'Ongeldige postcode (gebruik formaat: 1234 AB)',
    }),
});

type SimpleJobInput = z.infer<typeof simpleJobSchema>;

type Category = {
  id: string;
  name: string;
  slug: string;
};

interface JobFormProps {
  categories: Category[];
  initialCategorySlug?: string;
}

// Format postal code as user types
function formatPostcode(value: string): string {
  // Remove all non-alphanumeric characters
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // If we have 4+ characters, insert space after 4th
  if (cleaned.length > 4) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)}`;
  }
  return cleaned;
}

export function JobForm({ categories, initialCategorySlug }: JobFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const initialCategory = initialCategorySlug
    ? categories.find((c) => c.slug === initialCategorySlug)
    : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SimpleJobInput>({
    resolver: zodResolver(simpleJobSchema),
    defaultValues: {
      categoryId: initialCategory?.id || '',
    },
  });

  const selectedCategoryId = watch('categoryId');

  // Handle postcode input with formatting
  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostcode(e.target.value);
    setValue('locationPostcode', formatted, { shouldValidate: true });
  };

  // Image handling
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError('Maximaal 5 foto\'s toegestaan');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      setImageUrls((prev) => [...prev, URL.createObjectURL(file)]);
    });
  }, [images.length]);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SimpleJobInput) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Upload images first
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => formData.append('files', image));
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Foto\'s uploaden mislukt');
        const uploadData = await uploadRes.json();
        uploadedImageUrls = uploadData.urls || (uploadData.url ? [uploadData.url] : []);
      }

      // Create job (auto-publish)
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          images: uploadedImageUrls,
          timeline: 'FLEXIBLE',
          budgetType: 'TO_DISCUSS',
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Er is iets misgegaan');

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
          <CheckCircle2 className="h-8 w-8 text-success-500" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-surface-900">Klus geplaatst!</h2>
        <p className="mt-2 text-surface-600">
          Uw klus is nu zichtbaar voor vakmensen. U ontvangt bericht zodra iemand geïnteresseerd is.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => router.push('/client/jobs')}>
            Mijn klussen bekijken
          </Button>
          <Button variant="outline" onClick={() => {
            setSubmitted(false);
            setImages([]);
            setImageUrls([]);
          }}>
            Nog een klus plaatsen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Category selection */}
        <div>
          <label className="label">Wat voor klus?</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setValue('categoryId', cat.id)}
                className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${
                  selectedCategoryId === cat.id
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-surface-200 hover:border-surface-300 text-surface-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-error-500">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Title */}
        <Input
          label="Titel"
          placeholder="Bijv: Badkamer renoveren"
          error={errors.title?.message}
          required
          {...register('title')}
        />

        {/* Description */}
        <Textarea
          label="Beschrijving"
          placeholder="Beschrijf wat u nodig heeft..."
          rows={4}
          error={errors.description?.message}
          required
          {...register('description')}
        />

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stad"
            placeholder="Amsterdam"
            error={errors.locationCity?.message}
            required
            {...register('locationCity')}
          />
          <div>
            <Input
              label="Postcode"
              placeholder="1234 AB"
              error={errors.locationPostcode?.message}
              required
              maxLength={7}
              {...register('locationPostcode', {
                onChange: handlePostcodeChange,
              })}
            />
            <p className="mt-1 text-xs text-surface-500">Nederlands formaat: 1234 AB</p>
          </div>
        </div>

        {/* Photos (optional) */}
        <div>
          <label className="label">Foto's (optioneel)</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative h-20 w-20 rounded-lg overflow-hidden bg-surface-100">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-surface-900/60 text-white hover:bg-surface-900/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="h-20 w-20 rounded-lg border-2 border-dashed border-surface-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition-colors">
                <Upload className="h-5 w-5 text-surface-400" />
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
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Klus plaatsen
        </Button>
      </form>
    </Card>
  );
}
