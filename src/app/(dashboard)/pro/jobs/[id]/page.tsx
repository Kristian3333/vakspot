// src/app/(dashboard)/pro/jobs/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button, Badge, Textarea, Spinner, Avatar } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import {
  MapPin, ArrowLeft, CheckCircle2, AlertCircle, MessageSquare, Send
} from 'lucide-react';

type JobDetail = {
  id: string;
  title: string;
  description: string;
  locationCity: string;
  locationPostcode: string;
  publishedAt: string;
  category: { id: string; name: string };
  client: { city: string | null; user: { name: string | null } };
  images: { id: string; url: string }[];
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

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/jobs/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.job) setJob(data.job);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      // Create a "bid" with 0 amount (we're repurposing the bid system as "interest")
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: id,
          amount: 0, // No price, just interest
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

  // Success state
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
        <Badge variant="neutral" size="md" className="mb-3">{job.category.name}</Badge>
        <h1 className="text-2xl font-bold text-surface-900">{job.title}</h1>
        
        <div className="mt-3 flex items-center gap-2 text-sm text-surface-600">
          <MapPin className="h-4 w-4 text-surface-400" />
          {job.locationCity}, {job.locationPostcode}
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

      {/* Interest form */}
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
    </div>
  );
}
