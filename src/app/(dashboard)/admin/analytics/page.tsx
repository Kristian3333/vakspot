// src/app/(dashboard)/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Activity,
} from 'lucide-react';

type AnalyticsData = {
  summary: {
    totalJobs: number;
    completedJobs: number;
    reviewedJobs: number;
    overallCompletionRate: number;
    reviewRate: number;
    totalStalled: number;
    period: { days: number; startDate: string };
  };
  statusDistribution: Array<{
    status: string;
    label: string;
    count: number;
  }>;
  conversionFunnel: Array<{
    status: string;
    label: string;
    count: number;
    currentCount: number;
  }>;
  conversionKillers: Array<{
    from: string;
    fromLabel: string;
    to: string;
    toLabel: string;
    dropoff: number;
    dropoffRate: number;
    severity: 'high' | 'medium' | 'low';
  }>;
  stalledJobs: Array<{
    status: string;
    label: string;
    count: number;
    threshold: number;
  }>;
  transitionTimes: Array<{
    from: string;
    fromLabel: string;
    to: string;
    toLabel: string;
    avgMinutes: number;
    avgHours: number;
    avgDays: number;
    count: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    created: number;
    completed: number;
    cancelled: number;
    completionRate: number;
  }>;
};

// Colors for pie chart segments
const STATUS_COLORS: Record<string, string> = {
  CREATED: '#3B82F6',
  FLAGGED: '#EF4444',
  RESPONSES_RECEIVED: '#6366F1',
  IN_CONVERSATION: '#8B5CF6',
  QUOTE_RECEIVED: '#F59E0B',
  SELECTED: '#10B981',
  SCHEDULED: '#06B6D4',
  IN_PROGRESS: '#F97316',
  COMPLETED_BY_CONSUMER: '#22C55E',
  COMPLETED_BY_PRO: '#84CC16',
  REVIEWED: '#14B8A6',
  CANCELLED_BY_CONSUMER: '#6B7280',
  CANCELLED_BY_PRO: '#9CA3AF',
  NO_MATCH: '#D1D5DB',
  EXPIRED: '#E5E7EB',
  // Legacy
  DRAFT: '#9CA3AF',
  PUBLISHED: '#3B82F6',
  ACCEPTED: '#10B981',
  COMPLETED: '#22C55E',
};

const FUNNEL_COLORS = [
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#10B981', '#06B6D4', '#F97316', '#22C55E', '#14B8A6',
];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [days]);

  const handleExport = async (type: string) => {
    setExporting(type);
    try {
      const res = await fetch('/api/admin/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vakspot-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(null);
    }
  };

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

  if (!data) return null;

  // Filter out zero-count items for pie chart and use label as name for display
  const pieData = data.statusDistribution
    .filter((d) => d.count > 0)
    .map((d) => ({ ...d, name: d.label }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar dashboard
          </Link>
          <h1 className="text-2xl font-bold text-surface-900">Analytics Dashboard</h1>
          <p className="text-surface-600 mt-1">Inzicht in klussen en conversies</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-surface-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value={7}>Laatste 7 dagen</option>
            <option value={30}>Laatste 30 dagen</option>
            <option value={90}>Laatste 90 dagen</option>
            <option value={365}>Laatste jaar</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-100 text-brand-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{data.summary.totalJobs}</p>
              <p className="text-sm text-surface-600">Totaal klussen</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success-100 text-success-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">
                {data.summary.overallCompletionRate}%
              </p>
              <p className="text-sm text-surface-600">Voltooiingspercentage</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{data.summary.reviewRate}%</p>
              <p className="text-sm text-surface-600">Review percentage</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                data.summary.totalStalled > 10
                  ? 'bg-error-100 text-error-600'
                  : data.summary.totalStalled > 0
                  ? 'bg-warning-100 text-warning-600'
                  : 'bg-surface-100 text-surface-600'
              }`}
            >
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{data.summary.totalStalled}</p>
              <p className="text-sm text-surface-600">Vastgelopen klussen</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Status Distribution Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">Status Verdeling</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('status-distribution')}
              disabled={exporting === 'status-distribution'}
            >
              <Download className="h-4 w-4 mr-1" />
              {exporting === 'status-distribution' ? 'Exporteren...' : 'CSV'}
            </Button>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) =>
                    (percent ?? 0) > 0.05 ? `${name} (${((percent ?? 0) * 100).toFixed(0)}%)` : ''
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#6B7280'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-surface-500">
              Geen data beschikbaar
            </div>
          )}
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Conversie Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.conversionFunnel}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="label" type="category" width={75} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Bereikte klussen">
                {data.conversionFunnel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Monthly Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">Maandelijkse Trends</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('monthly-summary')}
              disabled={exporting === 'monthly-summary'}
            >
              <Download className="h-4 w-4 mr-1" />
              {exporting === 'monthly-summary' ? 'Exporteren...' : 'CSV'}
            </Button>
          </div>
          {data.monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Aangemaakt"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Voltooid"
                  stroke="#22C55E"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="cancelled"
                  name="Geannuleerd"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-surface-500">
              Geen maandelijkse data beschikbaar
            </div>
          )}
        </Card>

        {/* Conversion Killers */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Conversie Knelpunten
          </h2>
          <p className="text-sm text-surface-500 mb-4">
            Waar vallen klussen uit de funnel?
          </p>
          <div className="space-y-3 max-h-[260px] overflow-y-auto">
            {data.conversionKillers.slice(0, 6).map((killer, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  killer.severity === 'high'
                    ? 'border-error-200 bg-error-50'
                    : killer.severity === 'medium'
                    ? 'border-warning-200 bg-warning-50'
                    : 'border-surface-200 bg-surface-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-surface-900 text-sm">
                      {killer.fromLabel} → {killer.toLabel}
                    </p>
                    <p className="text-xs text-surface-500">
                      {killer.dropoff} klussen verloren
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {killer.severity === 'high' ? (
                      <TrendingDown className="h-4 w-4 text-error-500" />
                    ) : killer.severity === 'medium' ? (
                      <TrendingDown className="h-4 w-4 text-warning-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-success-500" />
                    )}
                    <Badge
                      variant={
                        killer.severity === 'high'
                          ? 'error'
                          : killer.severity === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {killer.dropoffRate}% uitval
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Stalled Jobs */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Vastgelopen Klussen
          </h2>
          <p className="text-sm text-surface-500 mb-4">
            Klussen zonder voortgang in 7+ dagen
          </p>
          {data.stalledJobs.some((s) => s.count > 0) ? (
            <div className="space-y-3">
              {data.stalledJobs
                .filter((s) => s.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((stalled, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-surface-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-surface-900">{stalled.label}</p>
                      <p className="text-sm text-surface-500">
                        Geen activiteit in {stalled.threshold}+ dagen
                      </p>
                    </div>
                    <Badge
                      variant={
                        stalled.count > 10 ? 'error' : stalled.count > 5 ? 'warning' : 'neutral'
                      }
                    >
                      {stalled.count} klussen
                    </Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-500">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-success-500" />
              <p>Geen vastgelopen klussen</p>
            </div>
          )}
        </Card>

        {/* Average Transition Times */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">
              Gemiddelde Doorlooptijd
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('transitions')}
              disabled={exporting === 'transitions'}
            >
              <Download className="h-4 w-4 mr-1" />
              {exporting === 'transitions' ? 'Exporteren...' : 'CSV'}
            </Button>
          </div>
          <p className="text-sm text-surface-500 mb-4">
            Tijd tussen statusovergangen
          </p>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {data.transitionTimes.slice(0, 10).map((t, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-surface-50 rounded-lg transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {t.fromLabel} → {t.toLabel}
                  </p>
                  <p className="text-xs text-surface-500">{t.count} overgangen</p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <Clock className="h-4 w-4 text-surface-400" />
                  <span className="text-sm font-medium text-surface-700">
                    {t.avgDays >= 1
                      ? `${t.avgDays} dagen`
                      : t.avgHours >= 1
                      ? `${t.avgHours} uur`
                      : `${t.avgMinutes} min`}
                  </span>
                </div>
              </div>
            ))}
            {data.transitionTimes.length === 0 && (
              <div className="text-center py-8 text-surface-500">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Nog geen transitie data</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Export Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Data Export</h2>
        <p className="text-sm text-surface-500 mb-4">
          Download ruwe data als CSV voor verdere analyse
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleExport('status-distribution')}
            disabled={exporting === 'status-distribution'}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting === 'status-distribution' ? 'Exporteren...' : 'Status verdeling'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('jobs-full')}
            disabled={exporting === 'jobs-full'}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting === 'jobs-full' ? 'Exporteren...' : 'Alle klussen'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('transitions')}
            disabled={exporting === 'transitions'}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting === 'transitions' ? 'Exporteren...' : 'Status overgangen'}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('monthly-summary')}
            disabled={exporting === 'monthly-summary'}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting === 'monthly-summary' ? 'Exporteren...' : 'Maandoverzicht'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
