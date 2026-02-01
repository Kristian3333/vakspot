// src/app/complaints/page.tsx
// Complaints procedure page (P2B/DSA compliance)

import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { MessageSquare, Clock, CheckCircle2, ArrowRight, Scale, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Klachtenprocedure',
  description: 'Hoe u een klacht kunt indienen bij VakSpot en hoe wij deze behandelen.',
};

export default function ComplaintsPage() {
  const steps = [
    {
      number: 1,
      title: 'Dien uw klacht in',
      description: 'Stuur een e-mail naar support@vakspot.nl met een beschrijving van uw klacht, relevante details en wat u verwacht als oplossing.',
      icon: MessageSquare,
    },
    {
      number: 2,
      title: 'Bevestiging',
      description: 'U ontvangt binnen 2 werkdagen een bevestiging van ontvangst met een referentienummer.',
      icon: CheckCircle2,
    },
    {
      number: 3,
      title: 'Onderzoek',
      description: 'Wij onderzoeken uw klacht zorgvuldig. Indien nodig nemen wij contact met u op voor aanvullende informatie.',
      icon: Clock,
    },
    {
      number: 4,
      title: 'Beslissing',
      description: 'Binnen 14 werkdagen ontvangt u onze reactie met een voorstel voor een oplossing of een uitleg van onze beslissing.',
      icon: Scale,
    },
  ];

  const complaintTypes = [
    {
      title: 'Klachten over vakmensen',
      description: 'Problemen met de kwaliteit van werk, communicatie of afspraken die niet worden nagekomen.',
      action: 'Meld dit via de "Melden" knop op het profiel of in het berichtenvenster.',
    },
    {
      title: 'Klachten over opdrachtgevers',
      description: 'Problemen met betaling, communicatie of onredelijke eisen.',
      action: 'Neem contact op via support@vakspot.nl met details.',
    },
    {
      title: 'Klachten over het platform',
      description: 'Technische problemen, onduidelijkheden of ontevreden over onze dienstverlening.',
      action: 'Stuur een e-mail naar support@vakspot.nl.',
    },
    {
      title: 'Bezwaar tegen beslissingen',
      description: 'Bezwaar tegen schorsing, verwijderde content of andere beslissingen.',
      action: 'Dien een bezwaar in via /appeal of per e-mail.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100">
              <Scale className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Klachtenprocedure
            </h1>
            <p className="mt-6 text-lg text-surface-600">
              Wij nemen elke klacht serieus. Hier leest u hoe wij uw klacht behandelen.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 mb-8 text-center">
            Hoe werkt het?
          </h2>

          <div className="space-y-4">
            {steps.map((step) => (
              <Card key={step.number} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <span className="text-brand-600 font-bold">{step.number}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-900">{step.title}</h3>
                  <p className="text-surface-600 mt-1">{step.description}</p>
                </div>
                <step.icon className="h-5 w-5 text-surface-400 flex-shrink-0" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Complaint Types */}
      <section className="py-16 sm:py-24 bg-surface-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 mb-8 text-center">
            Soorten klachten
          </h2>

          <div className="space-y-4">
            {complaintTypes.map((type, index) => (
              <Card key={index}>
                <h3 className="font-semibold text-surface-900">{type.title}</h3>
                <p className="text-surface-600 mt-1">{type.description}</p>
                <p className="text-sm text-brand-600 mt-2">
                  <strong>Actie:</strong> {type.action}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-brand-50 border-brand-200">
            <h2 className="text-xl font-semibold text-brand-900 mb-4">Onze garanties</h2>
            <ul className="space-y-3 text-brand-700">
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-600 flex-shrink-0" />
                <span>Elke klacht wordt binnen 14 werkdagen behandeld</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-600 flex-shrink-0" />
                <span>U ontvangt altijd een schriftelijke reactie</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-600 flex-shrink-0" />
                <span>Uw klacht wordt vertrouwelijk behandeld</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-brand-600 flex-shrink-0" />
                <span>U kunt altijd vragen naar de status van uw klacht</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* External Dispute Resolution */}
      <section className="py-16 sm:py-24 bg-surface-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card>
            <div className="flex gap-4">
              <AlertTriangle className="h-6 w-6 text-surface-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-surface-900 mb-2">
                  Externe geschillenbeslechting
                </h2>
                <p className="text-surface-600 mb-4">
                  Komt u er met ons niet uit? Dan kunt u gebruik maken van externe geschillenbeslechting:
                </p>
                <ul className="space-y-2 text-surface-600 mb-4">
                  <li>
                    • <strong>Online Dispute Resolution (ODR):</strong>{' '}
                    <a
                      href="https://ec.europa.eu/consumers/odr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline"
                    >
                      ec.europa.eu/consumers/odr
                    </a>
                  </li>
                  <li>
                    • <strong>De Geschillencommissie:</strong> Voor geschillen tot €5.000
                  </li>
                  <li>
                    • <strong>Rechtbank:</strong> Voor grotere geschillen
                  </li>
                </ul>
                <p className="text-sm text-surface-500">
                  Let op: voor geschillen tussen vakmensen en opdrachtgevers is VakSpot geen partij.
                  Wij kunnen wel bemiddelen, maar zijn niet verantwoordelijk voor de uitvoering van werk.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 sm:text-3xl">
            Klacht indienen?
          </h2>
          <p className="mt-4 text-lg text-surface-600">
            Neem contact met ons op en wij helpen u graag verder.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Contact opnemen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
