// src/app/(dashboard)/pro/leads/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Select, Spinner, Avatar } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { MapPin, Clock, Euro, ChevronRight, Filter, Briefcase } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<string>('');

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (maxDistance) params.set('maxDistance', maxDistance);

    fetch(`/api/leads?${params}`)
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, maxDistance]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Beschikbare klussen</h1>
        <p className="mt-1 text-surface-600">Vind klussen die passen bij uw expertise</p>
      </div>

      {/* Filters */}
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

      {/* Leads list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : leads.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">Geen klussen gevonden</h3>
          <p className="mt-1 text-surface-500">
            Er zijn momenteel geen klussen die aan uw criteria voldoen
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/pro/leads/${lead.id}`}>
              <Card hover className="group">
                <div className="flex gap-4">
                  {/* Image */}
                  {lead.images[0] ? (
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
                          {lead.category.name}
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
                        {lead.locationCity}
                        {lead.distance && ` • ${lead.distance} km`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {TIMELINE_LABELS[lead.timeline]}
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
                      <span className="text-surface-400">
                        {formatRelativeTime(lead.publishedAt)}
                      </span>
                    </div>

                    {lead._count.bids > 0 && (
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
