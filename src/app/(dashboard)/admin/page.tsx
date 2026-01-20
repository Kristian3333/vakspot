// src/app/(dashboard)/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Star,
  TrendingUp,
  Settings,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type Stats = {
  users: { total: number; clients: number; pros: number; admins: number };
  jobs: { total: number; published: number; completed: number; draft: number };
  bids: { total: number; accepted: number; pending: number };
  reviews: { total: number; avgRating: number };
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement /api/admin/stats endpoint
    // For now, show placeholder data
    setTimeout(() => {
      setStats({
        users: { total: 156, clients: 120, pros: 35, admins: 1 },
        jobs: { total: 89, published: 45, completed: 32, draft: 12 },
        bids: { total: 234, accepted: 32, pending: 89 },
        reviews: { total: 28, avgRating: 4.6 },
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
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
      subtitle: `Gem. ${stats?.reviews.avgRating.toFixed(1)} sterren`,
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
            <Button
              key={action.label}
              variant="outline"
              className="justify-start h-auto py-4"
              onClick={() => alert('Pagina nog niet geïmplementeerd')}
            >
              <action.icon className="h-5 w-5 mr-3" />
              {action.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Placeholder for more content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Recente activiteit
          </h2>
          <div className="text-center py-8 text-surface-500">
            <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Activiteitenoverzicht komt binnenkort</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Te verifiëren pro&apos;s
          </h2>
          <div className="space-y-3">
            {/* Placeholder items */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-surface-200" />
                  <div>
                    <p className="font-medium text-surface-900">Placeholder Pro {i}</p>
                    <p className="text-sm text-surface-500">Loodgieter • Amsterdam</p>
                  </div>
                </div>
                <Badge variant="warning">Wachtend</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
