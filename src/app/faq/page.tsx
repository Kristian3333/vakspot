// src/app/faq/page.tsx
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { ChevronDown, MessageSquare, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Veelgestelde vragen',
  description: 'Antwoorden op veelgestelde vragen over VakSpot. Vind snel het antwoord dat u zoekt.',
};

export default function FAQPage() {
  const faqCategories = [
    {
      title: 'Algemeen',
      faqs: [
        {
          question: 'Wat is VakSpot?',
          answer: 'VakSpot is een online platform dat opdrachtgevers verbindt met betrouwbare vakmensen. Via ons platform kunt u gratis een klus plaatsen en offertes ontvangen van gekwalificeerde vakmensen in uw buurt.',
        },
        {
          question: 'Is VakSpot gratis?',
          answer: 'Voor opdrachtgevers is VakSpot volledig gratis. U betaalt geen kosten voor het plaatsen van een klus of het ontvangen van offertes. Vakmensen betalen een kleine vergoeding per lead.',
        },
        {
          question: 'Hoe werkt VakSpot?',
          answer: 'Het is eenvoudig: 1) Plaats uw klus met een beschrijving en eventuele foto\'s, 2) Ontvang binnen 24 uur offertes van vakmensen, 3) Vergelijk de offertes en kies de beste match voor uw klus.',
        },
      ],
    },
    {
      title: 'Voor opdrachtgevers',
      faqs: [
        {
          question: 'Hoe plaats ik een klus?',
          answer: 'Klik op "Klus plaatsen" en vul het formulier in met de details van uw klus. Hoe meer informatie u geeft, hoe beter de offertes die u ontvangt. U kunt ook foto\'s toevoegen.',
        },
        {
          question: 'Hoeveel offertes ontvang ik?',
          answer: 'Gemiddeld ontvangt u 3-5 offertes per klus. Dit kan variëren afhankelijk van het type klus en uw locatie.',
        },
        {
          question: 'Ben ik verplicht een offerte te accepteren?',
          answer: 'Nee, u bent nergens toe verplicht. U kunt alle offertes vergelijken en zelf beslissen of u met een vakman in zee gaat.',
        },
        {
          question: 'Hoe weet ik of een vakman betrouwbaar is?',
          answer: 'Alle vakmensen op VakSpot worden geverifieerd. U kunt reviews van andere klanten lezen en de profielinformatie bekijken voordat u een keuze maakt.',
        },
        {
          question: 'Wat als ik niet tevreden ben over het werk?',
          answer: 'We raden aan om problemen eerst direct met de vakman te bespreken. Komt u er niet uit? Neem dan contact op met onze klantenservice. We helpen graag bij het vinden van een oplossing.',
        },
      ],
    },
    {
      title: 'Voor vakmensen',
      faqs: [
        {
          question: 'Hoe meld ik mij aan als vakman?',
          answer: 'Klik op "Vakman worden" en maak een account aan. Vul uw profiel zo volledig mogelijk in met uw ervaring, specialisaties en werkgebied. Na verificatie kunt u direct beginnen met reageren op leads.',
        },
        {
          question: 'Wat kost het om leads te ontvangen?',
          answer: 'U betaalt alleen voor de leads waarop u reageert. De kosten variëren per categorie en worden duidelijk weergegeven voordat u reageert.',
        },
        {
          question: 'Hoe kan ik mijn profiel verbeteren?',
          answer: 'Zorg voor een complete profielbeschrijving, voeg foto\'s toe van uw werk, vraag klanten om reviews en reageer snel op leads. Een compleet profiel wekt meer vertrouwen.',
        },
        {
          question: 'Kan ik mijn werkgebied aanpassen?',
          answer: 'Ja, u kunt in uw profiel uw werkgebied instellen door een straal rond uw locatie te kiezen. U ontvangt alleen leads binnen dit gebied.',
        },
      ],
    },
    {
      title: 'Account & privacy',
      faqs: [
        {
          question: 'Hoe wijzig ik mijn wachtwoord?',
          answer: 'Ga naar Instellingen > Wachtwoord. Voer uw huidige wachtwoord in en kies een nieuw wachtwoord.',
        },
        {
          question: 'Hoe verwijder ik mijn account?',
          answer: 'U kunt uw account verwijderen via Instellingen > Account verwijderen. Let op: deze actie is permanent en kan niet ongedaan worden gemaakt.',
        },
        {
          question: 'Hoe gaat VakSpot om met mijn gegevens?',
          answer: 'Uw privacy is belangrijk voor ons. We verzamelen alleen de gegevens die nodig zijn voor het functioneren van het platform. Lees ons privacybeleid voor meer informatie.',
        },
        {
          question: 'Wordt mijn adres gedeeld met vakmensen?',
          answer: 'Uw exacte adres wordt pas gedeeld nadat u een offerte heeft geaccepteerd. Vakmensen zien alleen uw stad/regio om te bepalen of de klus binnen hun werkgebied valt.',
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Veelgestelde <span className="text-gradient">vragen</span>
            </h1>
            <p className="mt-6 text-lg text-surface-600">
              Vind snel antwoord op uw vragen over VakSpot.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqCategories.map((category) => (
              <div key={category.title}>
                <h2 className="text-xl font-bold text-surface-900 mb-6">
                  {category.title}
                </h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, index) => (
                    <Card key={index}>
                      <details className="group">
                        <summary className="flex cursor-pointer items-center justify-between font-medium text-surface-900">
                          {faq.question}
                          <ChevronDown className="h-5 w-5 text-surface-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <p className="mt-4 text-surface-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </details>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-surface-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <MessageSquare className="h-12 w-12 text-brand-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-surface-900 sm:text-3xl">
            Staat uw vraag er niet bij?
          </h2>
          <p className="mt-4 text-lg text-surface-600">
            Neem gerust contact met ons op. We helpen u graag verder.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Neem contact op
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline" size="lg">
                Help center
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
