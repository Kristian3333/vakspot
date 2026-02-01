// src/app/ranking/page.tsx
// P2B Compliance: Explanation of ranking criteria for professionals

import Link from 'next/link';
import { Card } from '@/components/ui';
import {
  MapPin,
  Sparkles,
  Star,
  Clock,
  TrendingUp,
  Filter,
  HelpCircle,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ranking & Zoekresultaten',
  description: 'Hoe VakSpot klussen rangschikt en toont aan vakmensen.',
};

export default function RankingPage() {
  const rankingFactors = [
    {
      icon: Sparkles,
      title: 'Gesponsorde plaatsingen',
      description: 'Klussen met een "Gesponsord" label hebben betaald voor extra zichtbaarheid. Deze worden altijd bovenaan de lijst getoond.',
      impact: 'Hoog',
      color: 'amber',
    },
    {
      icon: MapPin,
      title: 'Afstand',
      description: 'Klussen dichter bij uw geregistreerde locatie worden hoger gerangschikt. De afstand wordt berekend op basis van postcode.',
      impact: 'Hoog',
      color: 'blue',
    },
    {
      icon: Filter,
      title: 'Categorie match',
      description: 'Als u "Aanbevolen voor u" selecteert, ziet u alleen klussen in uw geregistreerde vakgebieden.',
      impact: 'Hoog',
      color: 'brand',
    },
    {
      icon: Clock,
      title: 'Publicatiedatum',
      description: 'Nieuwere klussen worden over het algemeen hoger gerangschikt dan oudere klussen.',
      impact: 'Gemiddeld',
      color: 'green',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <TrendingUp className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Ranking & Zoekresultaten
            </h1>
            <p className="mt-6 text-lg text-surface-600">
              Transparantie over hoe VakSpot klussen rangschikt en toont aan vakmensen
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <Card className="mb-8 bg-brand-50 border-brand-200">
            <div className="flex gap-4">
              <HelpCircle className="h-6 w-6 text-brand-600 flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-brand-900">Waarom deze pagina?</h2>
                <p className="mt-1 text-brand-700">
                  Conform de Platform-to-Business verordening (P2B) zijn wij verplicht om transparant
                  te zijn over hoe wij klussen rangschikken en weergeven aan zakelijke gebruikers.
                </p>
              </div>
            </div>
          </Card>

          {/* Ranking Factors */}
          <h2 className="text-2xl font-bold text-surface-900 mb-6">
            Factoren die de ranking bepalen
          </h2>
          <p className="text-surface-600 mb-8">
            De volgorde waarin klussen worden getoond wordt bepaald door de volgende factoren,
            in volgorde van belangrijkheid:
          </p>

          <div className="space-y-4 mb-12">
            {rankingFactors.map((factor, index) => (
              <Card key={index}>
                <div className="flex gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    factor.color === 'amber' ? 'bg-amber-100' :
                    factor.color === 'blue' ? 'bg-blue-100' :
                    factor.color === 'brand' ? 'bg-brand-100' :
                    'bg-green-100'
                  }`}>
                    <factor.icon className={`h-6 w-6 ${
                      factor.color === 'amber' ? 'text-amber-600' :
                      factor.color === 'blue' ? 'text-blue-600' :
                      factor.color === 'brand' ? 'text-brand-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-surface-900">{factor.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        factor.impact === 'Hoog'
                          ? 'bg-error-100 text-error-700'
                          : 'bg-warning-100 text-warning-700'
                      }`}>
                        {factor.impact} impact
                      </span>
                    </div>
                    <p className="text-surface-600">{factor.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Gesponsord Section */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Wat betekent "Gesponsord"?
            </h2>
            <p className="text-surface-600 mb-4">
              Klussen met het label "Gesponsord" zijn klussen waarvan de opdrachtgever heeft betaald
              voor extra zichtbaarheid. Dit heeft de volgende effecten:
            </p>
            <ul className="list-disc list-inside text-surface-600 space-y-2 mb-4">
              <li>De klus wordt bovenaan de lijst getoond, vóór niet-gesponsorde klussen</li>
              <li>De klus krijgt een opvallend "Gesponsord" label</li>
              <li>De gesponsorde status heeft geen invloed op de inhoud of kwaliteit van de klus</li>
            </ul>
            <p className="text-sm text-surface-500">
              Wij labelen gesponsorde content altijd duidelijk, zodat u een geïnformeerde keuze kunt maken.
            </p>
          </Card>

          {/* Algorithm Details */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-surface-900 mb-4">
              Hoe werkt het algoritme?
            </h2>
            <div className="space-y-4 text-surface-600">
              <p>
                <strong className="text-surface-900">Stap 1: Filtering</strong><br />
                Eerst filteren we klussen op basis van uw gekozen categorie. Bij "Aanbevolen voor u"
                gebruiken we uw geregistreerde vakgebieden.
              </p>
              <p>
                <strong className="text-surface-900">Stap 2: Gesponsorde plaatsingen</strong><br />
                Gesponsorde klussen worden automatisch bovenaan geplaatst, gesorteerd op sponsorniveau
                (premium eerst, dan basis).
              </p>
              <p>
                <strong className="text-surface-900">Stap 3: Afstandssortering</strong><br />
                Niet-gesponsorde klussen worden gesorteerd op afstand van uw locatie, van dichtbij naar ver.
              </p>
              <p>
                <strong className="text-surface-900">Stap 4: Secundaire sortering</strong><br />
                Bij gelijke afstand worden nieuwere klussen eerst getoond.
              </p>
            </div>
          </Card>

          {/* Tips */}
          <Card className="mb-8 bg-surface-50">
            <h2 className="text-xl font-semibold text-surface-900 mb-4">
              Tips voor vakmensen
            </h2>
            <ul className="space-y-3 text-surface-600">
              <li className="flex gap-3">
                <span className="text-brand-500 font-bold">1.</span>
                <span>Houd uw locatie en werkgebied up-to-date voor relevante klussen</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-500 font-bold">2.</span>
                <span>Registreer alle vakgebieden waarin u werkzaam bent</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-500 font-bold">3.</span>
                <span>Gebruik "Alle klussen" om buiten uw vakgebied te zoeken</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-500 font-bold">4.</span>
                <span>Reageer snel op nieuwe klussen voor de beste kans</span>
              </li>
            </ul>
          </Card>

          {/* Contact */}
          <div className="text-center">
            <p className="text-surface-600 mb-4">
              Heeft u vragen over onze ranking of zoekresultaten?
            </p>
            <Link
              href="/contact"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Neem contact met ons op →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
