// src/app/(dashboard)/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Spinner, Badge, Avatar } from '@/components/ui';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Star,
  TrendingUp,
  Settings,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

type Stats = {
  users: { total: number; clients: number; pros: number; admins: number };
  jobs: { total: number; published: number; completed: number; draft: number };
  bids: { total: number; accepted: number; pending: number };
  reviews: { total: number; avgRating: number };
  unverifiedPros: Array<{
    id: string;
    companyName: string;
    city: string;
    createdAt: string;
    user: { id: string; name: string; email: string; image: string | null };
    categories: Array<{ name: string }>;
  }>;
  recentActivity: {
    jobs: Array<{
      id: string;
      title: string;
      status: string;
      createdAt: string;
      client: { user: { name: string } };
    }>;
    bids: Array<{
      id: string;
      amount: number;
      status: string;
      createdAt: string;
      pro: { companyName: string; user: { name: string } };
      job: { title: string };
    }>;
  };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-error-500" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">Fout bij laden</h3>
          <p className="mt-2 text-surface-500">{error}</p>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Totaal Gebruikers',
      value: stats?.users.total || 0,
      subtitle: `${stats?.users.clients} klanten, ${stats?.users.pros} vakmensen`,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Klussen',
      value: stats?.jobs.total || 0,
      subtitle: `${stats?.jobs.published} actief, ${stats?.jobs.completed} voltooid`,
      icon: Briefcase,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Offertes',
      value: stats?.bids.total || 0,
      subtitle: `${stats?.bids.accepted} geaccepteerd`,
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Reviews',
      value: stats?.reviews.total || 0,
      subtitle: `Gem. ${(stats?.reviews.avgRating || 0).toFixed(1)} sterren`,
      icon: Star,
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  const quickActions = [
    { label: 'Categorieën beheren', icon: Settings, href: '/admin/categories' },
    { label: 'Gebruikers beheren', icon: Users, href: '/admin/users' },
    { label: 'Pro\'s verifiëren', icon: ShieldCheck, href: '/admin/verify' },
    { label: 'Meldingen bekijken', icon: AlertTriangle, href: '/admin/reports' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Admin Dashboard</h1>
        <p className="text-surface-600 mt-1">Beheer VakSpot platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-sm font-medium text-surface-900">{stat.title}</p>
                <p className="text-xs text-surface-500">{stat.subtitle}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Snelle acties</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
              >
                <action.icon className="h-5 w-5 mr-3" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">
              Recente klussen
            </h2>
            <Link href="/admin/jobs" className="text-sm text-brand-600 hover:text-brand-700">
              Alles bekijken
            </Link>
          </div>
          {stats?.recentActivity.jobs && stats.recentActivity.jobs.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-900 truncate">{job.title}</p>
                    <p className="text-sm text-surface-500">
                      {job.client.user.name} • {formatRelativeTime(job.createdAt)}
                    </p>
                  </div>
                  <Badge variant={job.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-500">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Geen recente klussen</p>
            </div>
          )}
        </Card>

        {/* Unverified Pros */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">
              Te verifiëren pro&apos;s
            </h2>
            <Link href="/admin/verify" className="text-sm text-brand-600 hover:text-brand-700">
              Alles bekijken
            </Link>
          </div>
          {stats?.unverifiedPros && stats.unverifiedPros.length > 0 ? (
            <div className="space-y-3">
              {stats.unverifiedPros.slice(0, 5).map((pro) => (
                <Link 
                  key={pro.id} 
                  href={`/admin/verify?id=${pro.id}`}
                  className="flex items-center justify-between p-3 bg-surface-50 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={pro.user.image} name={pro.user.name} size="sm" />
                    <div>
                      <p className="font-medium text-surface-900">{pro.companyName || pro.user.name}</p>
                      <p className="text-sm text-surface-500">
                        {pro.categories.map(c => c.name).join(', ') || 'Geen categorie'} • {pro.city || 'Onbekend'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-surface-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-500">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>Alle pro&apos;s zijn geverifieerd</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
