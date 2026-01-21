// src/app/how-it-works/page.tsx
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  Star,
  Shield,
  Clock,
  MessageSquare,
  CreditCard,
  ThumbsUp,
  Search,
  Briefcase,
  Send,
} from 'lucide-react';
import { auth } from '@/lib/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hoe werkt het?',
  description: 'Ontdek hoe VakSpot werkt. In drie simpele stappen vindt u de perfecte vakman voor uw klus.',
};

export default async function HowItWorksPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  const clientSteps = [
    {
      number: '1',
      title: 'Plaats uw klus',
      description: 'Beschrijf uw klus in een paar minuten. Voeg foto\'s toe zodat vakmensen een goede inschatting kunnen maken.',
      icon: FileText,
      details: [
        'Gratis en vrijblijvend',
        'Voeg foto\'s toe voor betere offertes',
        'Uw gegevens blijven privé',
      ],
    },
    {
      number: '2',
      title: 'Ontvang offertes',
      description: 'Binnen 24 uur reageren vakmensen met hun beste prijs. Vergelijk prijzen, reviews en ervaring.',
      icon: Users,
      details: [
        'Gemiddeld 3-5 offertes',
        'Bekijk reviews en beoordelingen',
        'Chat direct met vakmensen',
      ],
    },
    {
      number: '3',
      title: 'Kies uw vakman',
      description: 'Selecteer de vakman die het beste bij uw klus past. Plan de klus en laat deze vakkundig uitvoeren.',
      icon: ThumbsUp,
      details: [
        'Geen verplichtingen',
        'Veilige communicatie via platform',
        'Deel uw ervaring met een review',
      ],
    },
  ];

  const proSteps = [
    {
      number: '1',
      title: 'Bekijk beschikbare klussen',
      description: 'Blader door klussen die passen bij uw expertise en locatie. Filter op categorie en afstand.',
      icon: Search,
      details: [
        'Klussen gefilterd op uw vakgebied',
        'Zie locatie en budget indicatie',
        'Foto\'s en beschrijvingen beschikbaar',
      ],
    },
    {
      number: '2',
      title: 'Stuur uw offerte',
      description: 'Reageer met uw beste prijs en een persoonlijke boodschap. Laat zien waarom u de juiste vakman bent.',
      icon: Send,
      details: [
        'Stel uw eigen prijs',
        'Voeg een persoonlijk bericht toe',
        'Benadruk uw ervaring en expertise',
      ],
    },
    {
      number: '3',
      title: 'Aan het werk',
      description: 'Bij acceptatie kunt u direct aan de slag. Lever kwaliteit en bouw uw reputatie op met goede reviews.',
      icon: Briefcase,
      details: [
        'Direct contact met opdrachtgever',
        'Plan de klus op uw eigen tempo',
        'Ontvang reviews voor toekomstige opdrachten',
      ],
    },
  ];

  const steps = userRole === 'PRO' ? proSteps : clientSteps;

  const clientBenefits = [
    {
      title: 'Gratis voor opdrachtgevers',
      description: 'Het plaatsen van een klus en ontvangen van offertes is volledig gratis.',
      icon: CreditCard,
    },
    {
      title: 'Geverifieerde vakmensen',
      description: 'Alle vakmensen worden gescreend op kwaliteit en betrouwbaarheid.',
      icon: Shield,
    },
    {
      title: 'Snelle reacties',
      description: 'Ontvang binnen 24 uur offertes van vakmensen in uw buurt.',
      icon: Clock,
    },
    {
      title: 'Eerlijke reviews',
      description: 'Lees echte ervaringen van andere klanten voordat u kiest.',
      icon: Star,
    },
    {
      title: 'Direct contact',
      description: 'Communiceer veilig via ons platform met vakmensen.',
      icon: MessageSquare,
    },
    {
      title: 'Geen verplichtingen',
      description: 'U bent pas gebonden als u akkoord gaat met een offerte.',
      icon: CheckCircle2,
    },
  ];

  const proBenefits = [
    {
      title: 'Geen vaste kosten',
      description: 'Betaal alleen voor contactgegevens bij geaccepteerde offertes.',
      icon: CreditCard,
    },
    {
      title: 'Gekwalificeerde leads',
      description: 'Alle klussen zijn van echte opdrachtgevers met concrete projecten.',
      icon: Shield,
    },
    {
      title: 'Klussen bij u in de buurt',
      description: 'Filter op afstand en werk in uw eigen servicegebied.',
      icon: Clock,
    },
    {
      title: 'Bouw uw reputatie',
      description: 'Verzamel reviews en laat uw kwaliteit zien aan nieuwe klanten.',
      icon: Star,
    },
    {
      title: 'Rechtstreeks contact',
      description: 'Na acceptatie direct communiceren met de opdrachtgever.',
      icon: MessageSquare,
    },
    {
      title: 'Flexibel werken',
      description: 'U bepaalt zelf op welke klussen u reageert en wanneer.',
      icon: CheckCircle2,
    },
  ];

  const benefits = userRole === 'PRO' ? proBenefits : clientBenefits;

  const faqs = userRole === 'PRO' ? [
    {
      question: 'Wat kost het om op klussen te reageren?',
      answer: 'Het bekijken van klussen is gratis. U betaalt alleen een klein bedrag voor de contactgegevens wanneer uw offerte wordt geaccepteerd.',
    },
    {
      question: 'Hoe word ik geverifieerd?',
      answer: 'Na registratie kunt u uw KvK-nummer en eventuele certificeringen uploaden. Na verificatie krijgt u een badge die vertrouwen wekt bij opdrachtgevers.',
    },
    {
      question: 'Kan ik mijn servicegebied aanpassen?',
      answer: 'Ja, in uw profiel kunt u uw serviceradius instellen. U ziet alleen klussen binnen dit gebied.',
    },
    {
      question: 'Hoe krijg ik meer opdrachten?',
      answer: 'Zorg voor een compleet profiel met foto\'s van uw werk, reageer snel op klussen, en lever kwaliteit voor goede reviews.',
    },
  ] : [
    {
      question: 'Wat kost het om een klus te plaatsen?',
      answer: 'Het plaatsen van een klus is volledig gratis voor opdrachtgevers. U betaalt alleen als u akkoord gaat met een offerte van een vakman.',
    },
    {
      question: 'Hoe worden vakmensen geverifieerd?',
      answer: 'Alle vakmensen doorlopen een verificatieproces waarbij we hun identiteit, KvK-inschrijving en eventuele certificeringen controleren. Daarnaast monitoren we reviews van klanten.',
    },
    {
      question: 'Kan ik mijn klus annuleren?',
      answer: 'Ja, u kunt uw klus op elk moment annuleren zolang u nog geen offerte heeft geaccepteerd. Na acceptatie gelden de voorwaarden die u met de vakman bent overeengekomen.',
    },
    {
      question: 'Wat als ik niet tevreden ben?',
      answer: 'We raden aan om eventuele problemen eerst direct met de vakman te bespreken. Komt u er niet uit? Neem dan contact op met onze klantenservice voor bemiddeling.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Hoe werkt <span className="text-gradient">VakSpot</span>?
            </h1>
            <p className="mt-6 text-lg text-surface-600">
              {userRole === 'PRO'
                ? 'In drie simpele stappen vindt u nieuwe klanten en groeit uw bedrijf.'
                : 'In drie simpele stappen vindt u de perfecte vakman voor uw klus. Gratis, snel en betrouwbaar.'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-xl font-bold text-white">
                      {step.number}
                    </div>
                    <h2 className="text-2xl font-bold text-surface-900 sm:text-3xl">
                      {step.title}
                    </h2>
                  </div>
                  <p className="text-lg text-surface-600 mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success-500 flex-shrink-0" />
                        <span className="text-surface-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Illustration */}
                <div className="flex-1">
                  <Card className="flex items-center justify-center p-12 bg-gradient-to-br from-brand-50 to-surface-50">
                    <step.icon className="h-32 w-32 text-brand-300" strokeWidth={1} />
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
              Waarom VakSpot?
            </h2>
            <p className="mt-4 text-lg text-surface-600">
              {userRole === 'PRO'
                ? 'Ontdek de voordelen voor vakmensen'
                : 'Ontdek de voordelen van klussen via VakSpot'
              }
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                  <benefit.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-surface-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-surface-600">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
              Veelgestelde vragen
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <h3 className="text-lg font-semibold text-surface-900">
                  {faq.question}
                </h3>
                <p className="mt-2 text-surface-600">{faq.answer}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/faq">
              <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Meer veelgestelde vragen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-500 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Klaar om te beginnen?
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            {userRole === 'PRO'
              ? 'Bekijk nu de beschikbare klussen en stuur uw eerste offerte.'
              : userRole === 'CLIENT'
              ? 'Plaats een klus en ontvang binnen 24 uur offertes van vakmensen.'
              : 'Plaats vandaag nog uw eerste klus en ontvang binnen 24 uur offertes.'
            }
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {userRole === 'PRO' ? (
              <>
                <Link href="/pro/leads">
                  <Button
                    size="lg"
                    className="bg-white text-brand-600 hover:bg-brand-50"
                    rightIcon={<Search className="h-5 w-5" />}
                  >
                    Klussen bekijken
                  </Button>
                </Link>
                <Link href="/pro/profile">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Profiel bijwerken
                  </Button>
                </Link>
              </>
            ) : userRole === 'CLIENT' ? (
              <>
                <Link href="/client/jobs/new">
                  <Button
                    size="lg"
                    className="bg-white text-brand-600 hover:bg-brand-50"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Klus plaatsen
                  </Button>
                </Link>
                <Link href="/client/jobs">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Mijn klussen
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/client/jobs/new">
                  <Button
                    size="lg"
                    className="bg-white text-brand-600 hover:bg-brand-50"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Gratis klus plaatsen
                  </Button>
                </Link>
                <Link href="/register/pro">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Aanmelden als vakman
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
