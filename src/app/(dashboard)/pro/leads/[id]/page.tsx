// src/app/(dashboard)/pro/leads/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Badge, Input, Textarea, Spinner, Avatar } from '@/components/ui';
import { createBidSchema, type CreateBidInput } from '@/lib/validations';
import { formatCurrency, formatRelativeTime, formatDate } from '@/lib/utils';
import {
  MapPin, Clock, Euro, Calendar, ArrowLeft, CheckCircle2, AlertCircle, User, Image as ImageIcon
} from 'lucide-react';

type JobDetail = {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetType: string;
  locationCity: string;
  locationPostcode: string;
  timeline: string;
  startDate: string | null;
  publishedAt: string;
  category: { id: string; name: string };
  client: { city: string | null; user: { name: string | null } };
  images: { id: string; url: string }[];
  _count: { bids: number };
};

const TIMELINE_LABELS: Record<string, string> = {
  URGENT: 'Urgent - Binnen enkele dagen',
  THIS_WEEK: 'Deze week',
  THIS_MONTH: 'Deze maand',
  NEXT_MONTH: 'Volgende maand',
  FLEXIBLE: 'Flexibel - Geen haast',
};

export default function ProLeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateBidInput>({
    resolver: zodResolver(createBidSchema),
    defaultValues: {
      jobId: params.id,
      amountType: 'ESTIMATE',
    },
  });

  useEffect(() => {
    fetch(`/api/jobs/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.job) setJob(data.job);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const onSubmit = async (data: CreateBidInput) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, amount: Math.round(data.amount * 100) }), // Convert to cents
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Er is iets misgegaan');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="text-xl font-bold text-surface-900">Klus niet gevonden</h1>
        <Button onClick={() => router.back()} className="mt-4">
          Terug naar overzicht
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
          <CheckCircle2 className="h-8 w-8 text-success-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-surface-900">Offerte verzonden!</h1>
        <p className="mt-2 text-surface-600">
          Uw offerte is succesvol verzonden naar de opdrachtgever. U ontvangt een bericht zodra er een reactie is.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => router.push('/pro/leads')}>
            Meer klussen bekijken
          </Button>
          <Button variant="outline" onClick={() => router.push('/pro/bids')}>
            Mijn offertes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar overzicht
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job details */}
          <Card>
            <Badge variant="neutral" size="md" className="mb-3">
              {job.category.name}
            </Badge>
            <h1 className="text-2xl font-bold text-surface-900">{job.title}</h1>
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-surface-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-surface-400" />
                {job.locationCity}, {job.locationPostcode}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-surface-400" />
                {TIMELINE_LABELS[job.timeline]}
              </span>
              {(job.budgetMin || job.budgetMax) && (
                <span className="flex items-center gap-1.5">
                  <Euro className="h-4 w-4 text-surface-400" />
                  {job.budgetMin && job.budgetMax
                    ? `${formatCurrency(job.budgetMin)} - ${formatCurrency(job.budgetMax)}`
                    : job.budgetMax
                    ? `Tot ${formatCurrency(job.budgetMax)}`
                    : `Vanaf ${formatCurrency(job.budgetMin!)}`}
                </span>
              )}
              {job.startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-surface-400" />
                  Start: {formatDate(job.startDate)}
                </span>
              )}
            </div>

            <hr className="my-6 border-surface-200" />

            <h2 className="font-semibold text-surface-900 mb-2">Beschrijving</h2>
            <p className="text-surface-700 whitespace-pre-wrap">{job.description}</p>

            {/* Images */}
            {job.images.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-surface-900 mb-3">Foto's</h2>
                <div className="space-y-3">
                  <div className="aspect-video overflow-hidden rounded-xl bg-surface-100">
                    <img
                      src={job.images[selectedImage].url}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                  {job.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {job.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImage(index)}
                          className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                            selectedImage === index ? 'border-brand-500' : 'border-transparent'
                          }`}
                        >
                          <img src={image.url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 text-sm text-surface-500">
              <Avatar name={job.client.user.name} size="sm" />
              <span>Geplaatst door {job.client.user.name || 'Anoniem'}</span>
              <span>•</span>
              <span>{formatRelativeTime(job.publishedAt)}</span>
            </div>
          </Card>
        </div>

        {/* Bid form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Offerte plaatsen</h2>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input type="hidden" {...register('jobId')} value={params.id} />

              <div>
                <label className="label">Uw prijs (€)</label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="500"
                  error={errors.amount?.message}
                  {...register('amount', { valueAsNumber: true })}
                />
                <p className="mt-1 text-xs text-surface-500">
                  Voer het totaalbedrag in (excl. BTW)
                </p>
              </div>

              <div>
                <label className="label">Prijstype</label>
                <select
                  className="input"
                  {...register('amountType')}
                >
                  <option value="ESTIMATE">Schatting</option>
                  <option value="FIXED">Vaste prijs</option>
                  <option value="HOURLY">Uurtarief</option>
                </select>
              </div>

              <div>
                <label className="label">Uw bericht</label>
                <Textarea
                  rows={5}
                  placeholder="Introduceer uzelf en leg uit waarom u de juiste vakman voor deze klus bent..."
                  error={errors.message?.message}
                  {...register('message')}
                />
                <p className="mt-1 text-xs text-surface-500">
                  Minimaal 20 tekens
                </p>
              </div>

              <Button type="submit" className="w-full" isLoading={submitting}>
                Offerte versturen
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-surface-500">
              Na acceptatie kunt u direct met de opdrachtgever communiceren
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
