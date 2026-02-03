// src/app/settings/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Spinner } from '@/components/ui';
import { ArrowLeft, Bell, Mail, Briefcase, MessageSquare, Megaphone, Calendar } from 'lucide-react';
import Link from 'next/link';

type NotificationPreferences = {
  emailNewMessages: boolean;
  emailNewInterest: boolean;
  emailBidUpdates: boolean;
  emailNewJobs: boolean;
  emailMarketing: boolean;
  emailWeeklyDigest: boolean;
};

type UserRole = 'CLIENT' | 'PRO' | 'ADMIN';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('CLIENT');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNewMessages: true,
    emailNewInterest: true,
    emailBidUpdates: true,
    emailNewJobs: true,
    emailMarketing: false,
    emailWeeklyDigest: false,
  });

  useEffect(() => {
    fetch('/api/settings/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.preferences) {
          setPreferences(data.preferences);
        }
        if (data.role) {
          setRole(data.role);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Kon voorkeuren niet laden');
        setLoading(false);
      });
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Opslaan mislukt');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Er ging iets mis');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const isPro = role === 'PRO';
  const isClient = role === 'CLIENT';

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
              <Bell className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">E-mail notificaties</h1>
              <p className="text-surface-600">Bepaal welke emails u wilt ontvangen</p>
            </div>
          </div>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl text-success-700">
            Voorkeuren opgeslagen!
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700">
            {error}
          </div>
        )}

        {/* Notification Settings */}
        <div className="space-y-4">
          {/* Messages */}
          <Card>
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-surface-400" />
              Berichten
            </h2>
            <NotificationToggle
              label="Nieuwe berichten"
              description="Ontvang een email als iemand u een bericht stuurt"
              checked={preferences.emailNewMessages}
              onChange={() => handleToggle('emailNewMessages')}
            />
          </Card>

          {/* Client-specific */}
          {isClient && (
            <Card>
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-surface-400" />
                Klussen
              </h2>
              <NotificationToggle
                label="Nieuwe interesse"
                description="Ontvang een email als een vakman interesse toont in uw klus"
                checked={preferences.emailNewInterest}
                onChange={() => handleToggle('emailNewInterest')}
              />
            </Card>
          )}

          {/* Pro-specific */}
          {isPro && (
            <Card>
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-surface-400" />
                Klussen & Opdrachten
              </h2>
              <div className="space-y-4">
                <NotificationToggle
                  label="Nieuwe klussen"
                  description="Ontvang een email bij nieuwe klussen in uw vakgebied en regio"
                  checked={preferences.emailNewJobs}
                  onChange={() => handleToggle('emailNewJobs')}
                />
                <NotificationToggle
                  label="Interesse updates"
                  description="Ontvang een email als uw interesse wordt geaccepteerd of afgewezen"
                  checked={preferences.emailBidUpdates}
                  onChange={() => handleToggle('emailBidUpdates')}
                />
              </div>
            </Card>
          )}

          {/* Marketing & Digest */}
          <Card>
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-surface-400" />
              Marketing & Updates
            </h2>
            <div className="space-y-4">
              <NotificationToggle
                label="Wekelijks overzicht"
                description="Ontvang wekelijks een samenvatting van activiteit op VakSpot"
                checked={preferences.emailWeeklyDigest}
                onChange={() => handleToggle('emailWeeklyDigest')}
                icon={<Calendar className="h-4 w-4" />}
              />
              <NotificationToggle
                label="Marketing emails"
                description="Ontvang tips, nieuws en aanbiedingen van VakSpot"
                checked={preferences.emailMarketing}
                onChange={() => handleToggle('emailMarketing')}
              />
            </div>
          </Card>
        </div>

        {/* Save button */}
        <div className="mt-8 flex gap-3">
          <Button onClick={handleSave} isLoading={saving}>
            Opslaan
          </Button>
          <Link href="/settings">
            <Button variant="outline">Annuleren</Button>
          </Link>
        </div>

        {/* Info text */}
        <p className="mt-6 text-sm text-surface-500">
          U kunt deze voorkeuren op elk moment aanpassen. Sommige belangrijke systeemberichten
          (zoals wachtwoord reset) worden altijd verzonden.
        </p>
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-surface-900">{label}</span>
        </div>
        <p className="text-sm text-surface-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
          checked ? 'bg-brand-600' : 'bg-surface-200'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
