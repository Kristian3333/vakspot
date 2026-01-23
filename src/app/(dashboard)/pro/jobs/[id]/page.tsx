// src/app/(dashboard)/pro/jobs/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button, Badge, Textarea, Spinner, Avatar } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import {
  MapPin, ArrowLeft, CheckCircle2, AlertCircle, MessageSquare, Send, Users, XCircle
} from 'lucide-react';

type JobDetail = {
  id: string;
  title: string;
  description: string;
  status: string;
  locationCity: string;
  locationPostcode: string;
  publishedAt: string;
  category: { id: string; name: string };
  client: { city: string | null; user: { name: string | null } };
  images: { id: string; url: string }[];
  _count?: { bids: number };
};

export default function ProJobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [alreadyInterested, setAlreadyInterested] = useState(false);
  const [existingConversationId, setExistingConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    // Fetch job details
    fetch(`/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.job) setJob(data.job);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Check if PRO already expressed interest
    fetch('/api/bids')
      .then(res => res.json())
      .then(data => {
        if (data.bids) {
          const existingBid = data.bids.find((b: any) => b.jobId === id);
          if (existingBid) {
            setAlreadyInterested(true);
            setExistingConversationId(existingBid.conversation?.id || null);
          }
        }
      })
      .catch(() => {});
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError('Schrijf minimaal 10 tekens');
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
          amount: 0,
          amountType: 'TO_DISCUSS',
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Er ging iets mis');
        setSubmitting(false);
        return;
      }

      if (result.bid?.conversation?.id) {
        setConversationId(result.bid.conversation.id);
      }
      setSubmitted(true);
    } catch (err) {
      setError('Er ging iets mis');
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
        <Button onClick={() => router.back()} className="mt-4">Terug</Button>
      </div>
    );
  }

  // Check if job is still available
  const isAvailable = ['PUBLISHED', 'IN_CONVERSATION'].includes(job.status);
  const isAccepted = job.status === 'ACCEPTED';

  // Success state after submitting interest
  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50">
          <CheckCircle2 className="h-8 w-8 text-success-500" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-surface-900">Bericht verzonden!</h1>
        <p className="mt-2 text-surface-600">
          De opdrachtgever ontvangt uw bericht en kan reageren via de chat.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          {conversationId && (
            <Button onClick={() => router.push(`/messages/${conversationId}`)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Ga naar gesprek
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/pro/jobs')}>
            Meer klussen bekijken
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug
      </button>

      {/* Job details */}
      <Card className="mb-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="neutral" size="md">{job.category.name}</Badge>
          {isAccepted && (
            <Badge variant="warning" size="md">Vakman gekozen</Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold text-surface-900">{job.title}</h1>
        
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-surface-600">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-surface-400" />
            {job.locationCity}, {job.locationPostcode}
          </span>
          {job._count && job._count.bids > 0 && (
            <span className="flex items-center gap-1 text-brand-600">
              <Users className="h-4 w-4" />
              {job._count.bids} geïnteresseerd
            </span>
          )}
        </div>

        <hr className="my-5 border-surface-200" />

        <p className="text-surface-700 whitespace-pre-wrap">{job.description}</p>

        {/* Images */}
        {job.images.length > 0 && (
          <div className="mt-6">
            <div className="aspect-video overflow-hidden rounded-xl bg-surface-100">
              <img
                src={job.images[selectedImage].url}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
            {job.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {job.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-brand-500' : 'border-transparent'
                    }`}
                  >
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 text-sm text-surface-500">
          <Avatar name={job.client.user.name} size="sm" />
          <span>{job.client.user.name || 'Anoniem'}</span>
          <span>•</span>
          <span>{formatRelativeTime(job.publishedAt)}</span>
        </div>
      </Card>

      {/* Already interested - show link to conversation */}
      {alreadyInterested && (
        <Card className="border-brand-200 bg-brand-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
              <CheckCircle2 className="h-5 w-5 text-brand-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-surface-900">U heeft al interesse getoond</h2>
              <p className="text-sm text-surface-600">Bekijk het gesprek met de opdrachtgever</p>
            </div>
            {existingConversationId && (
              <Button onClick={() => router.push(`/messages/${existingConversationId}`)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Ga naar gesprek
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Job no longer available */}
      {!isAvailable && !alreadyInterested && (
        <Card className="border-warning-200 bg-warning-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-100">
              <XCircle className="h-5 w-5 text-warning-600" />
            </div>
            <div>
              <h2 className="font-semibold text-surface-900">Klus niet meer beschikbaar</h2>
              <p className="text-sm text-surface-600">
                De opdrachtgever heeft al een vakman gekozen voor deze klus.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push('/pro/jobs')} className="mt-4 w-full">
            Bekijk andere klussen
          </Button>
        </Card>
      )}

      {/* Interest form - only show if job is available and not already interested */}
      {isAvailable && !alreadyInterested && (
        <Card>
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Geïnteresseerd? Stuur een bericht
          </h2>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-error-50 p-3 text-sm text-error-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="Stel uzelf voor en vertel waarom u geschikt bent voor deze klus..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="mt-1 text-xs text-surface-500">Minimaal 10 tekens</p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              isLoading={submitting}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Ik ben geïnteresseerd
            </Button>
          </form>

          <p className="mt-4 text-xs text-surface-500 text-center">
            Na verzenden kunt u direct chatten met de opdrachtgever
          </p>
        </Card>
      )}
    </div>
  );
}
