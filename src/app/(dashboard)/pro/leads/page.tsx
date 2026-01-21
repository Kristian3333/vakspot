// src/app/(dashboard)/pro/leads/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Select, Spinner } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { MapPin, Clock, Euro, ChevronRight, Filter, Briefcase, AlertCircle, RefreshCw } from 'lucide-react';

type Lead = {
  id: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  budgetType: string;
  locationCity: string;
  timeline: string;
  publishedAt: string;
  distance?: number | null;
  category: { id: string; name: string; icon: string | null };
  client: { city: string | null; user: { name: string | null } };
  images: { url: string }[];
  _count: { bids: number };
};

type Category = { id: string; name: string; slug: string };

const TIMELINE_LABELS: Record<string, string> = {
  URGENT: 'Urgent',
  THIS_WEEK: 'Deze week',
  THIS_MONTH: 'Deze maand',
  NEXT_MONTH: 'Volgende maand',
  FLEXIBLE: 'Flexibel',
};

export default function ProLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<string>('');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      // Handle both array response and { categories: [] } response
      setCategories(Array.isArray(data) ? data : (data.categories || []));
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (maxDistance) params.set('maxDistance', maxDistance);

      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Fout: ${res.status}`);
      }
      
      setLeads(data.leads || []);
    } catch (err: any) {
      console.error('Failed to fetch leads:', err);
      setError(err.message || 'Er is iets misgegaan bij het laden van klussen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [selectedCategory, maxDistance]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header - always visible */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Beschikbare klussen</h1>
        <p className="mt-1 text-surface-600">Vind klussen die passen bij uw expertise</p>
      </div>

      {/* Filters - always visible */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="h-5 w-5 text-surface-400" />
          <Select
            options={[
              { value: '', label: 'Alle categorieën' },
              ...categories.map(c => ({ value: c.id, label: c.name })),
            ]}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-48"
          />
          <Select
            options={[
              { value: '', label: 'Alle afstanden' },
              { value: '10', label: 'Binnen 10 km' },
              { value: '25', label: 'Binnen 25 km' },
              { value: '50', label: 'Binnen 50 km' },
            ]}
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
            className="w-40"
          />
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-surface-500">Klussen laden...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <Card className="border-error-200 bg-error-50">
          <div className="flex flex-col items-center text-center py-6">
            <AlertCircle className="h-12 w-12 text-error-500 mb-4" />
            <h3 className="text-lg font-medium text-error-900">Er is een fout opgetreden</h3>
            <p className="text-error-700 mt-1">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchLeads}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Opnieuw proberen
            </Button>
          </div>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && leads.length === 0 && (
        <Card className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">Geen klussen gevonden</h3>
          <p className="mt-1 text-surface-500">
            Er zijn momenteel geen klussen die aan uw criteria voldoen
          </p>
          <p className="mt-4 text-sm text-surface-400">
            Controleer of er klussen zijn gepubliceerd die bij uw categorieën passen
          </p>
        </Card>
      )}

      {/* Leads list */}
      {!loading && !error && leads.length > 0 && (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/pro/leads/${lead.id}`}>
              <Card hover className="group">
                <div className="flex gap-4">
                  {/* Image */}
                  {lead.images?.[0] ? (
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100">
                      <img
                        src={lead.images[0].url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-surface-100">
                      <Briefcase className="h-8 w-8 text-surface-300" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge variant="neutral" size="sm" className="mb-2">
                          {lead.category?.name || 'Onbekend'}
                        </Badge>
                        <h3 className="text-lg font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                          {lead.title}
                        </h3>
                      </div>
                      <ChevronRight className="h-5 w-5 text-surface-400 group-hover:text-brand-500 transition-colors flex-shrink-0" />
                    </div>

                    <p className="mt-1 text-sm text-surface-600 line-clamp-2">
                      {lead.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-surface-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {lead.locationCity || 'Onbekend'}
                        {lead.distance != null && ` • ${lead.distance} km`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {TIMELINE_LABELS[lead.timeline] || lead.timeline || 'Flexibel'}
                      </span>
                      {(lead.budgetMin || lead.budgetMax) && (
                        <span className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          {lead.budgetMin && lead.budgetMax
                            ? `${formatCurrency(lead.budgetMin)} - ${formatCurrency(lead.budgetMax)}`
                            : lead.budgetMax
                            ? `Tot ${formatCurrency(lead.budgetMax)}`
                            : `Vanaf ${formatCurrency(lead.budgetMin!)}`}
                        </span>
                      )}
                      {lead.publishedAt && (
                        <span className="text-surface-400">
                          {formatRelativeTime(lead.publishedAt)}
                        </span>
                      )}
                    </div>

                    {lead._count?.bids > 0 && (
                      <p className="mt-2 text-xs text-surface-400">
                        {lead._count.bids} offerte{lead._count.bids !== 1 ? 's' : ''} ontvangen
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
