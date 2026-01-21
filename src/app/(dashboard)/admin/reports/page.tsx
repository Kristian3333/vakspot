// src/app/(dashboard)/admin/reports/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@/components/ui';
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
} from 'lucide-react';

// Placeholder page - reports feature not yet implemented
export default function AdminReportsPage() {
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
          Bekijk en beheer meldingen van gebruikers
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <Card className="p-4 text-center">
          <Clock className="h-6 w-6 text-warning-500 mx-auto" />
          <p className="mt-2 text-2xl font-bold text-surface-900">0</p>
          <p className="text-sm text-surface-500">Open</p>
        </Card>
        <Card className="p-4 text-center">
          <AlertTriangle className="h-6 w-6 text-error-500 mx-auto" />
          <p className="mt-2 text-2xl font-bold text-surface-900">0</p>
          <p className="text-sm text-surface-500">Urgent</p>
        </Card>
        <Card className="p-4 text-center">
          <CheckCircle2 className="h-6 w-6 text-success-500 mx-auto" />
          <p className="mt-2 text-2xl font-bold text-surface-900">0</p>
          <p className="text-sm text-surface-500">Afgehandeld</p>
        </Card>
        <Card className="p-4 text-center">
          <XCircle className="h-6 w-6 text-surface-400 mx-auto" />
          <p className="mt-2 text-2xl font-bold text-surface-900">0</p>
          <p className="text-sm text-surface-500">Afgesloten</p>
        </Card>
      </div>

      {/* Report categories */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-100">
              <User className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-surface-900">Gebruikers</h3>
          </div>
          <p className="text-sm text-surface-500">
            Meldingen over ongepast gedrag, spam of frauduleuze accounts.
          </p>
          <p className="mt-3 text-2xl font-bold text-surface-900">0 meldingen</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-100">
              <Briefcase className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-surface-900">Klussen</h3>
          </div>
          <p className="text-sm text-surface-500">
            Meldingen over ongepaste klussen of misleidende inhoud.
          </p>
          <p className="mt-3 text-2xl font-bold text-surface-900">0 meldingen</p>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-surface-900">Berichten</h3>
          </div>
          <p className="text-sm text-surface-500">
            Meldingen over ongepaste berichten of communicatie.
          </p>
          <p className="mt-3 text-2xl font-bold text-surface-900">0 meldingen</p>
        </Card>
      </div>

      {/* Empty state */}
      <Card className="text-center py-16">
        <Flag className="mx-auto h-16 w-16 text-surface-200" />
        <h3 className="mt-6 text-xl font-semibold text-surface-900">
          Geen meldingen
        </h3>
        <p className="mt-2 text-surface-500 max-w-md mx-auto">
          Er zijn momenteel geen openstaande meldingen. Meldingen van gebruikers 
          verschijnen hier wanneer ze ongepast gedrag rapporteren.
        </p>
        <div className="mt-8 p-4 bg-surface-50 rounded-xl max-w-lg mx-auto">
          <p className="text-sm text-surface-600">
            <strong>Tip:</strong> Het meldingensysteem wordt automatisch gevuld wanneer 
            gebruikers de &quot;Melden&quot; knop gebruiken op profielen, klussen of in berichten.
          </p>
        </div>
      </Card>

      {/* Info about reports feature */}
      <Card className="mt-8 p-6 bg-brand-50 border-brand-200">
        <div className="flex gap-4">
          <AlertTriangle className="h-6 w-6 text-brand-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-brand-900">Meldingensysteem</h3>
            <p className="mt-1 text-sm text-brand-700">
              Dit systeem verzamelt meldingen van gebruikers over ongepast gedrag. 
              Elke melding bevat details over de reden, de gemelde inhoud, en de 
              melder. U kunt meldingen bekijken, onderzoeken en actie ondernemen.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="warning">Binnenkort beschikbaar</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
