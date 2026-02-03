// src/app/(dashboard)/pro/swipe/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Spinner } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import {
  MapPin, X, Heart, Briefcase, RefreshCw, ChevronLeft, ChevronRight,
  Users, Sparkles, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

type Job = {
  id: string;
  title: string;
  description: string;
  status: string;
  locationCity: string;
  publishedAt: string;
  distance?: number | null;
  interestCount?: number;
  isAccepted?: boolean;
  isSponsored?: boolean;
  category: { id: string; name: string };
  images: { url: string }[];
};

const SKIPPED_JOBS_KEY = 'vakspot_skipped_jobs';

export default function ProSwipePage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  // Load skipped jobs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SKIPPED_JOBS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only keep skips from last 7 days
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const valid = parsed.filter((item: { id: string; timestamp: number }) =>
          item.timestamp > weekAgo
        );
        setSkippedIds(new Set(valid.map((item: { id: string }) => item.id)));
        // Clean up old entries
        localStorage.setItem(SKIPPED_JOBS_KEY, JSON.stringify(valid));
      } catch {
        localStorage.removeItem(SKIPPED_JOBS_KEY);
      }
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/leads?limit=50');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Fout bij laden');

      // Filter out skipped and already accepted jobs
      const availableJobs = (data.leads || []).filter((job: Job) =>
        !job.isAccepted && !skippedIds.has(job.id)
      );

      setJobs(availableJobs);
      setCurrentIndex(0);
      setSelectedImage(0);
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  }, [skippedIds]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const saveSkippedJob = (jobId: string) => {
    const stored = localStorage.getItem(SKIPPED_JOBS_KEY);
    const existing = stored ? JSON.parse(stored) : [];
    existing.push({ id: jobId, timestamp: Date.now() });
    localStorage.setItem(SKIPPED_JOBS_KEY, JSON.stringify(existing));
    setSkippedIds(prev => new Set([...Array.from(prev), jobId]));
  };

  const handleSkip = () => {
    if (currentJob) {
      setSwipeDirection('left');
      setTimeout(() => {
        saveSkippedJob(currentJob.id);
        setCurrentIndex(prev => prev + 1);
        setSwipeDirection(null);
        setSelectedImage(0);
      }, 200);
    }
  };

  const handleInterested = () => {
    if (currentJob) {
      setSwipeDirection('right');
      setTimeout(() => {
        router.push(`/pro/jobs/${currentJob.id}`);
      }, 200);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handleSkip();
    } else if (e.key === 'ArrowRight') {
      handleInterested();
    }
  }, [currentIndex, jobs]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentJob = jobs[currentIndex];
  const remainingJobs = jobs.length - currentIndex;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-surface-500">Klussen laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-50">
          <X className="h-8 w-8 text-error-500" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-surface-900">Fout bij laden</h1>
        <p className="mt-2 text-surface-600">{error}</p>
        <Button onClick={fetchJobs} className="mt-6">
          <RefreshCw className="h-4 w-4 mr-2" />
          Opnieuw proberen
        </Button>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-100">
          <Briefcase className="h-8 w-8 text-surface-400" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-surface-900">Geen klussen meer</h1>
        <p className="mt-2 text-surface-600">
          U heeft alle beschikbare klussen bekeken. Kom later terug voor nieuwe klussen.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={() => {
            localStorage.removeItem(SKIPPED_JOBS_KEY);
            setSkippedIds(new Set());
            fetchJobs();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Overgeslagen klussen opnieuw bekijken
          </Button>
          <Link href="/pro/jobs">
            <Button variant="outline" className="w-full">
              Naar klussenlijst
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/pro/jobs"
          className="flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Lijst
        </Link>
        <h1 className="text-lg font-semibold text-surface-900">Klussen ontdekken</h1>
        <span className="text-sm text-surface-500">{remainingJobs} over</span>
      </div>

      {/* Swipe Card */}
      <div
        className={`transition-all duration-200 ${
          swipeDirection === 'left' ? '-translate-x-full opacity-0 rotate-[-10deg]' :
          swipeDirection === 'right' ? 'translate-x-full opacity-0 rotate-[10deg]' : ''
        }`}
      >
        <Card className="overflow-hidden">
          {/* Image */}
          {currentJob.images?.[0] ? (
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden bg-surface-100">
                <img
                  src={currentJob.images[selectedImage]?.url || currentJob.images[0].url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              {currentJob.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {currentJob.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        selectedImage === index ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
              {currentJob.isSponsored && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Gesponsord
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-[4/3] bg-surface-100 flex items-center justify-center">
              <Briefcase className="h-16 w-16 text-surface-300" />
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge variant="neutral">{currentJob.category.name}</Badge>
              {currentJob.interestCount && currentJob.interestCount > 0 && (
                <span className="flex items-center gap-1 text-sm text-brand-600">
                  <Users className="h-4 w-4" />
                  {currentJob.interestCount}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-surface-900 mb-2">
              {currentJob.title}
            </h2>

            <div className="flex items-center gap-3 text-sm text-surface-500 mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {currentJob.locationCity}
                {currentJob.distance != null && ` (${currentJob.distance} km)`}
              </span>
              <span>{formatRelativeTime(currentJob.publishedAt)}</span>
            </div>

            <p className="text-surface-600 line-clamp-4">
              {currentJob.description}
            </p>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={handleSkip}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-surface-300 bg-white text-surface-500 shadow-sm transition-all hover:border-error-400 hover:text-error-500 hover:scale-110 active:scale-95"
          title="Overslaan (pijltje links)"
        >
          <X className="h-8 w-8" />
        </button>

        <button
          onClick={handleInterested}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition-all hover:bg-brand-600 hover:scale-110 active:scale-95"
          title="Geïnteresseerd (pijltje rechts)"
        >
          <Heart className="h-10 w-10" />
        </button>
      </div>

      {/* Keyboard hints */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-surface-400">
        <span className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Overslaan
        </span>
        <span className="flex items-center gap-1">
          Geïnteresseerd
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
