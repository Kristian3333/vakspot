// src/app/(dashboard)/pro/jobs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Badge, Select, Spinner } from '@/components/ui';
import { formatRelativeTime, cn } from '@/lib/utils';
import { MapPin, ChevronRight, Briefcase, AlertCircle, RefreshCw, Users, CheckCircle2, Sparkles } from 'lucide-react';

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

type Category = { id: string; name: string; slug: string };

export default function ProJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('recommended'); // Default to recommended

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : (data.categories || []));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      // 'recommended' = use PRO's categories (default)
      // 'all' = show all jobs regardless of category
      // specific ID = filter by that category
      if (selectedCategory === 'all') {
        params.set('showAll', 'true');
      } else if (selectedCategory && selectedCategory !== 'recommended') {
        params.set('categoryId', selectedCategory);
      }
      // If 'recommended', don't pass any param - API will use PRO's categories

      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || `Fout: ${res.status}`);
      
      setJobs(data.leads || []);
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  // Split jobs into available and accepted
  const availableJobs = jobs.filter(j => !j.isAccepted);
  const acceptedJobs = jobs.filter(j => j.isAccepted);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Beschikbare klussen</h1>
        <p className="mt-1 text-surface-600">Klussen in uw regio</p>
      </div>

      {/* Category filter */}
      <div className="mb-6">
        <Select
          options={[
            { value: 'recommended', label: '⭐ Aanbevolen voor u' },
            { value: 'all', label: 'Alle klussen' },
            ...categories.map(c => ({ value: c.id, label: c.name })),
          ]}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-64"
        />
        {selectedCategory === 'recommended' && (
          <p className="mt-2 text-xs text-surface-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Gebaseerd op uw vakgebieden
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-surface-500">Laden...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <Card className="border-error-200 bg-error-50 text-center py-8">
          <AlertCircle className="mx-auto h-10 w-10 text-error-500" />
          <p className="mt-2 text-error-700">{error}</p>
          <button
            onClick={fetchJobs}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-error-600 hover:text-error-700"
          >
            <RefreshCw className="h-4 w-4" />
            Opnieuw proberen
          </button>
        </Card>
      )}

      {/* Empty */}
      {!loading && !error && jobs.length === 0 && (
        <Card className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">Geen klussen gevonden</h3>
          <p className="mt-1 text-surface-500">
            {selectedCategory === 'recommended' 
              ? 'Er zijn momenteel geen klussen in uw vakgebied. Probeer "Alle klussen" te bekijken.'
              : 'Probeer een andere categorie of bekijk de aanbevolen klussen.'
            }
          </p>
        </Card>
      )}

      {/* Available Jobs */}
      {!loading && !error && availableJobs.length > 0 && (
        <div className="space-y-3 mb-8">
          {availableJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Accepted Jobs Section */}
      {!loading && !error && acceptedJobs.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 mt-8">
            <div className="h-px flex-1 bg-surface-200" />
            <span className="text-sm text-surface-500 px-2">Vakman al gekozen</span>
            <div className="h-px flex-1 bg-surface-200" />
          </div>
          <div className="space-y-3">
            {acceptedJobs.map((job) => (
              <JobCard key={job.id} job={job} accepted />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobCard({ job, accepted = false }: { job: Job; accepted?: boolean }) {
  return (
    <Link href={`/pro/jobs/${job.id}`}>
      <Card 
        hover={!accepted} 
        className={cn(
          'group',
          accepted && 'opacity-60 bg-surface-50'
        )}
      >
        <div className="flex gap-4">
          {/* Thumbnail */}
          {job.images?.[0] ? (
            <div className={cn(
              "h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-100",
              accepted && "grayscale"
            )}>
              <img src={job.images[0].url} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-surface-100 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-surface-300" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {job.isSponsored && !accepted && (
                    <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1" size="sm">
                      <Sparkles className="h-3 w-3" />
                      Gesponsord
                    </Badge>
                  )}
                  <Badge variant="neutral" size="sm">{job.category?.name}</Badge>
                  {accepted && (
                    <Badge variant="warning" size="sm" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Bezet
                    </Badge>
                  )}
                </div>
                <h3 className={cn(
                  "mt-1 font-semibold text-surface-900 transition-colors",
                  !accepted && "group-hover:text-brand-600"
                )}>
                  {job.title}
                </h3>
              </div>
              <ChevronRight className={cn(
                "h-5 w-5 text-surface-400 flex-shrink-0",
                !accepted && "group-hover:text-brand-500"
              )} />
            </div>

            <p className="mt-1 text-sm text-surface-600 line-clamp-1">
              {job.description}
            </p>

            <div className="mt-2 flex items-center gap-4 text-xs text-surface-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.locationCity}
                {job.distance != null && ` • ${job.distance} km`}
              </span>
              <span>{formatRelativeTime(job.publishedAt)}</span>
              {job.interestCount && job.interestCount > 0 && (
                <span className={cn(
                  "flex items-center gap-1",
                  accepted ? "text-surface-500" : "text-brand-600"
                )}>
                  <Users className="h-3 w-3" />
                  {job.interestCount} geïnteresseerd
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
