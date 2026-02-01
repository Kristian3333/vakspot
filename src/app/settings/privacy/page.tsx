// src/app/settings/privacy/page.tsx
// GDPR Compliance: Privacy settings page with data management options
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import {
  ArrowLeft,
  Shield,
  Download,
  Trash2,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

type PrivacySettings = {
  marketingEmails: boolean;
  profileVisible: boolean;
};

export default function PrivacySettingsPage() {
  const [settings, setSettings] = useState<PrivacySettings>({
    marketingEmails: true,
    profileVisible: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestingExport, setRequestingExport] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    // Load current settings
    fetch('/api/settings/privacy')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings(data.settings);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
    setSaving(false);
  };

  const handleExportRequest = async () => {
    setRequestingExport(true);
    try {
      await fetch('/api/settings/privacy/export', { method: 'POST' });
      setExportSuccess(true);
    } catch (error) {
      console.error('Failed to request export:', error);
    }
    setRequestingExport(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar instellingen
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-brand-100">
            <Shield className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Privacy instellingen</h1>
            <p className="text-surface-600">Beheer uw privacy en gegevens</p>
          </div>
        </div>

        {/* Privacy Preferences */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-6">Voorkeuren</h2>

          <div className="space-y-4">
            <label className="flex items-start gap-4 p-4 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50">
              <input
                type="checkbox"
                checked={settings.marketingEmails}
                onChange={(e) => setSettings(prev => ({ ...prev, marketingEmails: e.target.checked }))}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-surface-500" />
                  <span className="font-medium text-surface-900">Marketing e-mails</span>
                </div>
                <p className="text-sm text-surface-500 mt-1">
                  Ontvang tips, nieuws en aanbiedingen van VakSpot
                </p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-xl border border-surface-200 cursor-pointer hover:bg-surface-50">
              <input
                type="checkbox"
                checked={settings.profileVisible}
                onChange={(e) => setSettings(prev => ({ ...prev, profileVisible: e.target.checked }))}
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-surface-500" />
                  <span className="font-medium text-surface-900">Profiel zichtbaar</span>
                </div>
                <p className="text-sm text-surface-500 mt-1">
                  Uw profiel is vindbaar voor andere gebruikers (alleen voor vakmensen)
                </p>
              </div>
            </label>
          </div>

          <Button
            onClick={handleSave}
            isLoading={saving}
            className="mt-6"
          >
            Voorkeuren opslaan
          </Button>
        </Card>

        {/* Data Export */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Gegevens exporteren</h2>
          <p className="text-surface-600 mb-4">
            Vraag een kopie aan van al uw persoonsgegevens. U ontvangt een download link via e-mail
            binnen 72 uur (GDPR recht op inzage).
          </p>

          {exportSuccess ? (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-success-50 border border-success-200 text-success-700">
              <CheckCircle2 className="h-5 w-5" />
              <span>Aanvraag ontvangen! U ontvangt een e-mail zodra uw gegevens klaarstaan.</span>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleExportRequest}
              isLoading={requestingExport}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Gegevens aanvragen
            </Button>
          )}
        </Card>

        {/* Data Deletion */}
        <Card className="border-error-200 bg-error-50">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-error-100">
              <Trash2 className="h-5 w-5 text-error-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-error-900">Gegevens verwijderen</h2>
              <p className="text-sm text-error-700 mt-1 mb-4">
                U kunt uw account en alle bijbehorende gegevens permanent verwijderen.
                Dit is onomkeerbaar (GDPR recht op vergetelheid).
              </p>
              <Link href="/settings/delete-account">
                <Button variant="danger" size="sm">
                  Account verwijderen
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* GDPR Info */}
        <Card className="mt-6 bg-surface-50 border-surface-200">
          <div className="flex gap-4">
            <AlertTriangle className="h-6 w-6 text-surface-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-surface-900">Uw rechten onder de AVG/GDPR</h3>
              <ul className="mt-2 text-sm text-surface-600 space-y-1">
                <li>• <strong>Recht op inzage:</strong> Vraag een kopie van uw gegevens aan</li>
                <li>• <strong>Recht op rectificatie:</strong> Corrigeer onjuiste gegevens</li>
                <li>• <strong>Recht op vergetelheid:</strong> Verwijder uw account en gegevens</li>
                <li>• <strong>Recht op bezwaar:</strong> Stop marketing communicatie</li>
                <li>• <strong>Recht op dataportabiliteit:</strong> Ontvang uw gegevens in een leesbaar formaat</li>
              </ul>
              <p className="mt-3 text-sm text-surface-500">
                Lees ons volledige{' '}
                <Link href="/privacy" className="text-brand-600 hover:underline">privacybeleid</Link>
                {' '}voor meer informatie.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
