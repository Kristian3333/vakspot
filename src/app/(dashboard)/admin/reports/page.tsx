// src/app/(dashboard)/admin/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Spinner, Avatar, Select } from '@/components/ui';
import {
  ArrowLeft,
  AlertTriangle,
  Flag,
  MessageSquare,
  User,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

type Report = {
  id: string;
  type: 'JOB' | 'PROFILE' | 'MESSAGE';
  targetId: string;
  reason: string;
  description: string | null;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  reporter: { id: string; name: string | null; email: string; image: string | null };
};

const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  FRAUD: 'Fraude',
  INAPPROPRIATE: 'Ongepast',
  ILLEGAL: 'Illegaal',
  HARASSMENT: 'Intimidatie',
  OTHER: 'Anders',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'In behandeling',
  RESOLVED: 'Opgelost',
  DISMISSED: 'Afgesloten',
};

const STATUS_COLORS: Record<string, 'warning' | 'primary' | 'success' | 'neutral'> = {
  OPEN: 'warning',
  UNDER_REVIEW: 'primary',
  RESOLVED: 'success',
  DISMISSED: 'neutral',
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  JOB: Briefcase,
  PROFILE: User,
  MESSAGE: MessageSquare,
};

const TYPE_LABELS: Record<string, string> = {
  JOB: 'Klus',
  PROFILE: 'Profiel',
  MESSAGE: 'Bericht',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ byStatus: Record<string, number>; byType: Record<string, number> }>({
    byStatus: {},
    byType: {},
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolution, setResolution] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);

      const res = await fetch(`/api/reports?${params}`);
      const data = await res.json();

      setReports(data.reports || []);
      setStats(data.stats || { byStatus: {}, byType: {} });
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter, typeFilter]);

  const handleStatusUpdate = async (reportId: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution: resolution || undefined }),
      });

      if (res.ok) {
        loadReports();
        setSelectedReport(null);
        setResolution('');
      }
    } catch (error) {
      console.error('Failed to update report:', error);
    } finally {
      setUpdating(false);
    }
  };

  const openCount = stats.byStatus?.OPEN || 0;
  const underReviewCount = stats.byStatus?.UNDER_REVIEW || 0;
  const resolvedCount = stats.byStatus?.RESOLVED || 0;
  const dismissedCount = stats.byStatus?.DISMISSED || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar dashboard
        </Link>
        <h1 className="text-2xl font-bold text-surface-900">Meldingen</h1>
        <p className="text-surface-600 mt-1">
          Bekijk en beheer meldingen van gebruikers (DSA compliance)
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <Card className="p-4 text-center">
          <Clock className="h-6 w-6 text-warning-500 mx-auto" />
          <p className="mt-2 text-2xl font-bold text-surface-900">{openCount}</p>
          <p className="text-sm text-surface-500">Open</p>
        </Card>
        <Card className="p-4 text-center">
          <Eye className="h-6 w-6 text-brand-500 mx-auto" />
          <p className="mt-2 text-2xl font-bold text-surface-900">{underReviewCount}</p>
          <p className="text-sm text-surface-500">In behandeling</p>
        </Card>
        <Card className="p-4 text-center">
          <CheckCircle2 className="h-6 w-6 text-success-500 mx-auto" />
          <p className="mt-2 text-2xl font-bold text-surface-900">{resolvedCount}</p>
          <p className="text-sm text-surface-500">Opgelost</p>
        </Card>
        <Card className="p-4 text-center">
          <XCircle className="h-6 w-6 text-surface-400 mx-auto" />
          <p className="mt-2 text-2xl font-bold text-surface-900">{dismissedCount}</p>
          <p className="text-sm text-surface-500">Afgesloten</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-4">
          <Select
            options={[
              { value: '', label: 'Alle statussen' },
              { value: 'OPEN', label: 'Open' },
              { value: 'UNDER_REVIEW', label: 'In behandeling' },
              { value: 'RESOLVED', label: 'Opgelost' },
              { value: 'DISMISSED', label: 'Afgesloten' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
          <Select
            options={[
              { value: '', label: 'Alle types' },
              { value: 'JOB', label: 'Klussen' },
              { value: 'PROFILE', label: 'Profielen' },
              { value: 'MESSAGE', label: 'Berichten' },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-40"
          />
        </div>
      </Card>

      {/* Reports list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <Card className="text-center py-16">
          <Flag className="mx-auto h-16 w-16 text-surface-200" />
          <h3 className="mt-6 text-xl font-semibold text-surface-900">
            Geen meldingen
          </h3>
          <p className="mt-2 text-surface-500 max-w-md mx-auto">
            {statusFilter || typeFilter
              ? 'Geen meldingen gevonden met deze filters.'
              : 'Er zijn momenteel geen openstaande meldingen.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const TypeIcon = TYPE_ICONS[report.type];
            return (
              <Card
                key={report.id}
                hover
                className="cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    report.type === 'JOB' ? 'bg-blue-100' :
                    report.type === 'PROFILE' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    <TypeIcon className={`h-5 w-5 ${
                      report.type === 'JOB' ? 'text-blue-600' :
                      report.type === 'PROFILE' ? 'text-purple-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_COLORS[report.status]} size="sm">
                        {STATUS_LABELS[report.status]}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        {TYPE_LABELS[report.type]}
                      </Badge>
                      <Badge variant="error" size="sm">
                        {REASON_LABELS[report.reason]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar src={report.reporter.image} name={report.reporter.name} size="xs" />
                      <span className="text-sm text-surface-600">
                        {report.reporter.name || report.reporter.email}
                      </span>
                      <span className="text-surface-400">•</span>
                      <span className="text-sm text-surface-500">
                        {formatRelativeTime(report.createdAt)}
                      </span>
                    </div>
                    {report.description && (
                      <p className="mt-2 text-sm text-surface-600 line-clamp-1">
                        {report.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-surface-400" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Report detail modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedReport(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-surface-900">Melding details</h2>
                  <p className="text-sm text-surface-500">ID: {selectedReport.id.slice(0, 8)}...</p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-surface-100 rounded-lg"
                >
                  <XCircle className="h-5 w-5 text-surface-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant={STATUS_COLORS[selectedReport.status]}>
                    {STATUS_LABELS[selectedReport.status]}
                  </Badge>
                  <Badge variant="neutral">{TYPE_LABELS[selectedReport.type]}</Badge>
                  <Badge variant="error">{REASON_LABELS[selectedReport.reason]}</Badge>
                </div>

                <div className="p-4 rounded-lg bg-surface-50">
                  <h4 className="font-medium text-surface-900 mb-2">Gemeld door</h4>
                  <div className="flex items-center gap-2">
                    <Avatar src={selectedReport.reporter.image} name={selectedReport.reporter.name} size="sm" />
                    <div>
                      <p className="font-medium text-surface-900">{selectedReport.reporter.name || 'Geen naam'}</p>
                      <p className="text-sm text-surface-500">{selectedReport.reporter.email}</p>
                    </div>
                  </div>
                </div>

                {selectedReport.description && (
                  <div>
                    <h4 className="font-medium text-surface-900 mb-2">Toelichting</h4>
                    <p className="text-surface-600 whitespace-pre-wrap">{selectedReport.description}</p>
                  </div>
                )}

                <div className="text-sm text-surface-500">
                  <p>Gemeld op: {new Date(selectedReport.createdAt).toLocaleString('nl-NL')}</p>
                  {selectedReport.resolvedAt && (
                    <p>Afgehandeld op: {new Date(selectedReport.resolvedAt).toLocaleString('nl-NL')}</p>
                  )}
                </div>

                {selectedReport.resolution && (
                  <div className="p-4 rounded-lg bg-success-50 border border-success-200">
                    <h4 className="font-medium text-success-900 mb-1">Resolutie</h4>
                    <p className="text-sm text-success-700">{selectedReport.resolution}</p>
                  </div>
                )}

                {/* Actions for open/under review reports */}
                {['OPEN', 'UNDER_REVIEW'].includes(selectedReport.status) && (
                  <div className="pt-4 border-t border-surface-200">
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Resolutie notitie (optioneel)
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Beschrijf de genomen actie..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none mb-4"
                    />
                    <div className="flex gap-3">
                      {selectedReport.status === 'OPEN' && (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(selectedReport.id, 'UNDER_REVIEW')}
                          isLoading={updating}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          In behandeling
                        </Button>
                      )}
                      <Button
                        onClick={() => handleStatusUpdate(selectedReport.id, 'RESOLVED')}
                        isLoading={updating}
                        className="flex-1"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Opgelost
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleStatusUpdate(selectedReport.id, 'DISMISSED')}
                        isLoading={updating}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Afwijzen
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info about DSA compliance */}
      <Card className="mt-8 p-6 bg-brand-50 border-brand-200">
        <div className="flex gap-4">
          <AlertTriangle className="h-6 w-6 text-brand-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-brand-900">DSA Compliance</h3>
            <p className="mt-1 text-sm text-brand-700">
              Volgens de Digital Services Act (DSA) moeten platforms een meldingssysteem hebben
              voor illegale content. Elke melding moet binnen redelijke termijn worden beoordeeld.
              Documenteer alle beslissingen voor audit doeleinden.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
