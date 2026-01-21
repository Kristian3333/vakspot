// src/app/(dashboard)/client/jobs/[id]/review/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button, Textarea, Avatar, Spinner } from '@/components/ui';
import { ArrowLeft, Star, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type JobDetail = {
  id: string;
  title: string;
  status: string;
  acceptedBid?: {
    id: string;
    pro: {
      id: string;
      companyName: string | null;
      user: {
        name: string | null;
        image: string | null;
      };
    };
  } | null;
  review?: {
    id: string;
  } | null;
};

export default function JobReviewPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then(res => res.json())
      .then(data => {
        if (data.job) {
          setJob(data.job);
          if (data.job.review) {
            setSubmitted(true);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Selecteer een beoordeling');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Uw beoordeling moet minimaal 10 tekens bevatten');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          rating,
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Verzenden mislukt');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verzenden mislukt');
    }
    setSubmitting(false);
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
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <h1 className="text-xl font-bold text-surface-900">Klus niet gevonden</h1>
        <Link href="/client/jobs">
          <Button className="mt-4">Terug naar mijn klussen</Button>
        </Link>
      </div>
    );
  }

  if (!job.acceptedBid) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center">
        <h1 className="text-xl font-bold text-surface-900">Geen vakman om te beoordelen</h1>
        <p className="text-surface-600 mt-2">
          U kunt alleen een beoordeling achterlaten nadat een offerte is geaccepteerd.
        </p>
        <Link href={`/client/jobs/${jobId}`}>
          <Button className="mt-4">Terug naar klus</Button>
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
          <CheckCircle2 className="h-8 w-8 text-success-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-surface-900">Bedankt voor uw beoordeling!</h1>
        <p className="mt-2 text-surface-600">
          Uw feedback helpt andere klanten bij het kiezen van de juiste vakman.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href={`/client/jobs/${jobId}`}>
            <Button>Terug naar klus</Button>
          </Link>
          <Link href="/client/jobs">
            <Button variant="outline">Mijn klussen</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pro = job.acceptedBid.pro;

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href={`/client/jobs/${jobId}`}
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar klus
        </Link>

        <Card>
          <h1 className="text-xl font-bold text-surface-900 mb-2">Beoordeling schrijven</h1>
          <p className="text-surface-600 mb-6">
            Deel uw ervaring met {pro.companyName || pro.user.name}
          </p>

          {/* Pro info */}
          <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl mb-6">
            <Avatar
              src={pro.user.image}
              name={pro.user.name}
              size="lg"
            />
            <div>
              <p className="font-medium text-surface-900">
                {pro.companyName || pro.user.name}
              </p>
              <p className="text-sm text-surface-500">{job.title}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star rating */}
            <div>
              <label className="label mb-3">Hoe beoordeelt u deze vakman?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoverRating || rating)
                          ? 'text-warning-500 fill-warning-500'
                          : 'text-surface-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-surface-500 mt-2">
                {rating === 0 && 'Klik op een ster om te beoordelen'}
                {rating === 1 && 'Slecht'}
                {rating === 2 && 'Matig'}
                {rating === 3 && 'Gemiddeld'}
                {rating === 4 && 'Goed'}
                {rating === 5 && 'Uitstekend'}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="label">Uw ervaring</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Vertel over uw ervaring met deze vakman. Was het werk naar verwachting? Kwam de vakman op tijd? Zou u hem/haar aanbevelen?"
                rows={5}
              />
              <p className="text-xs text-surface-500 mt-1">
                Minimaal 10 tekens
              </p>
            </div>

            {/* Tips */}
            <div className="p-4 bg-brand-50 rounded-xl">
              <p className="text-sm font-medium text-brand-700 mb-2">Tips voor een goede beoordeling:</p>
              <ul className="text-sm text-brand-600 space-y-1">
                <li>• Beschrijf wat er goed ging en wat beter kon</li>
                <li>• Vermeld of de vakman op tijd was</li>
                <li>• Was de communicatie duidelijk?</li>
                <li>• Kwam de prijs overeen met de offerte?</li>
              </ul>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                isLoading={submitting}
                disabled={rating === 0}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Beoordeling versturen
              </Button>
              <Link href={`/client/jobs/${jobId}`}>
                <Button type="button" variant="outline">
                  Annuleren
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
