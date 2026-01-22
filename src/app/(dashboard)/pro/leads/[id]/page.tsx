// src/app/(dashboard)/pro/leads/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Textarea, Spinner, Avatar } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import {
  MapPin, Clock, ArrowLeft, CheckCircle2, AlertCircle, MessageSquare, Heart
} from 'lucide-react';

type JobDetail = {
  id: string;
  title: string;
  description: string;
  locationCity: string;
  locationPostcode: string;
  timeline: string;
  publishedAt: string;
  category: { id: string; name: string };
  client: { city: string | null; user: { name: string | null } };
  images: { id: string; url: string }[];
  _count: { bids: number };
};

const TIMELINE_LABELS: Record<string, string> = {
  URGENT: 'Urgent',
  THIS_WEEK: 'Deze week',
  THIS_MONTH: 'Deze maand',
  NEXT_MONTH: 'Volgende maand',
  FLEXIBLE: 'Flexibel',
};

export default function ProLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.job) setJob(data.job);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleInterest = async () => {
    if (message.length < 10) {
      setError('Bericht moet minimaal 10 tekens zijn');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId: id, 
          message,
          // amount and amountType will default in the API
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Er is iets misgegaan');
        setSubmitting(false);
        return;
      }

      if (result.conversationId || result.bid?.conversation?.id) {
        setConversationId(result.conversationId || result.bid.conversation.id);
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
        <h1 className="mt-6 text-2xl font-bold text-surface-900">Interesse verstuurd!</h1>
        <p className="mt-2 text-surface-600">
          De opdrachtgever kan nu uw bericht zien. U kunt direct verder chatten om details te bespreken.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          {conversationId && (
            <Button onClick={() => router.push(`/messages/${conversationId}`)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Ga naar gesprek
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/pro/leads')}>
            Meer klussen bekijken
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
                {TIMELINE_LABELS[job.timeline] || 'Flexibel'}
              </span>
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

        {/* Interest form - simplified */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <h2 className="text-lg font-semibold text-surface-900 mb-2">Interesse tonen</h2>
            <p className="text-sm text-surface-600 mb-4">
              Stuur een bericht naar de opdrachtgever om de klus te bespreken.
            </p>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="label">Uw bericht</label>
                <Textarea
                  rows={5}
                  placeholder="Hallo! Ik ben geïnteresseerd in deze klus. Ik heb ruime ervaring met dit soort werk en kan binnenkort beginnen..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="mt-1 text-xs text-surface-500">
                  Introduceer uzelf en stel eventuele vragen
                </p>
              </div>

              <Button 
                onClick={handleInterest} 
                className="w-full" 
                isLoading={submitting}
              >
                <Heart className="h-4 w-4 mr-2" />
                Ik ben geïnteresseerd
              </Button>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-surface-50 text-sm text-surface-600">
              <p>
                💬 Na het versturen kunt u direct chatten met de opdrachtgever om prijs en details te bespreken.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
