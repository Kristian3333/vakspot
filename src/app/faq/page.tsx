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
          answer: 'VakSpot is een online platform dat opdrachtgevers verbindt met betrouwbare vakmensen. Plaats gratis een klus en ontvang reacties van gekwalificeerde vakmensen in uw buurt.',
        },
        {
          question: 'Is VakSpot gratis?',
          answer: 'Voor opdrachtgevers is VakSpot volledig gratis. U betaalt geen kosten voor het plaatsen van een klus of het ontvangen van reacties. Vakmensen betalen een kleine vergoeding per lead.',
        },
        {
          question: 'Hoe werkt VakSpot?',
          answer: '1) Plaats uw klus met een beschrijving, 2) Vakmensen tonen interesse en sturen een bericht, 3) Chat met geïnteresseerde vakmensen en kies de beste match.',
        },
      ],
    },
    {
      title: 'Voor opdrachtgevers',
      faqs: [
        {
          question: 'Hoe plaats ik een klus?',
          answer: 'Klik op "Klus plaatsen" en vul het formulier in met de details van uw klus. Hoe meer informatie u geeft, hoe beter vakmensen kunnen reageren. U kunt ook foto\'s toevoegen.',
        },
        {
          question: 'Hoe krijg ik goede reacties?',
          answer: 'Wees specifiek in uw beschrijving, voeg foto\'s toe, en geef duidelijk aan wat u nodig heeft. Hoe meer details, hoe beter vakmensen kunnen inschatten of zij u kunnen helpen.',
        },
        {
          question: 'Hoe kies ik de juiste vakman?',
          answer: 'Vergelijk de berichten die u ontvangt, bekijk profielen en reviews, en chat met vakmensen om een indruk te krijgen. Kies degene die het beste bij uw klus past.',
        },
        {
          question: 'Ben ik verplicht iemand te kiezen?',
          answer: 'Nee, u bent nergens toe verplicht. U kunt alle reacties vergelijken en zelf beslissen of u met een vakman in zee gaat.',
        },
        {
          question: 'Kan ik mijn klus annuleren?',
          answer: 'Ja, u kunt uw klus op elk moment annuleren via "Mijn klussen". Na annulering worden vakmensen automatisch op de hoogte gesteld.',
        },
        {
          question: 'Wat als ik niet tevreden ben?',
          answer: 'Bespreek problemen eerst direct met de vakman. Komt u er niet uit? Neem dan contact op met onze klantenservice voor bemiddeling.',
        },
      ],
    },
    {
      title: 'Voor vakmensen',
      faqs: [
        {
          question: 'Hoe meld ik mij aan als vakman?',
          answer: 'Klik op "Aanmelden als vakman" en maak een account aan. Vul uw profiel in met uw specialisaties en werkgebied. Na verificatie kunt u direct reageren op klussen.',
        },
        {
          question: 'Hoe reageer ik op klussen?',
          answer: 'Bekijk beschikbare klussen in uw regio, klik op "Ik ben geïnteresseerd" en stuur direct een persoonlijk bericht naar de opdrachtgever.',
        },
        {
          question: 'Wat kost het voor vakmensen?',
          answer: 'Registratie is gratis. U betaalt alleen voor de leads waarop u reageert. De kosten variëren per categorie en worden duidelijk getoond.',
        },
        {
          question: 'Hoe verbeter ik mijn profiel?',
          answer: 'Voeg een profielfoto toe, schrijf een goede beschrijving, en vraag tevreden klanten om reviews. Een compleet profiel wekt meer vertrouwen.',
        },
        {
          question: 'Kan ik mijn werkgebied aanpassen?',
          answer: 'Ja, in uw profiel kunt u uw werkgebied instellen. U ziet alleen klussen binnen dit gebied.',
        },
      ],
    },
    {
      title: 'Account & privacy',
      faqs: [
        {
          question: 'Hoe wijzig ik mijn wachtwoord?',
          answer: 'Ga naar Instellingen > Beveiliging. Vul uw huidige wachtwoord in en kies een nieuw wachtwoord.',
        },
        {
          question: 'Hoe verwijder ik mijn account?',
          answer: 'U kunt uw account verwijderen via Instellingen > Account verwijderen. Let op: deze actie is permanent.',
        },
        {
          question: 'Hoe gaat VakSpot om met mijn gegevens?',
          answer: 'Uw privacy is belangrijk. We verzamelen alleen gegevens die nodig zijn voor het platform en verkopen nooit aan derden. Lees ons privacybeleid voor meer informatie.',
        },
        {
          question: 'Wordt mijn adres gedeeld?',
          answer: 'Uw exacte adres wordt niet gedeeld. Vakmensen zien alleen uw stad/regio om te bepalen of de klus binnen hun werkgebied valt.',
        },
      ],
    },
    {
      title: 'Veiligheid',
      faqs: [
        {
          question: 'Hoe weet ik of een vakman betrouwbaar is?',
          answer: 'Bekijk het profiel, lees reviews van andere klanten, en chat eerst via het platform voordat u afspraken maakt.',
        },
        {
          question: 'Hoe meld ik verdacht gedrag?',
          answer: 'Klik op "Melden" op het profiel of in het berichtenvenster. Ons team onderzoekt alle meldingen binnen 24 uur.',
        },
        {
          question: 'Tips voor veilig contact?',
          answer: 'Communiceer via het platform, maak duidelijke schriftelijke afspraken, betaal niet het volledige bedrag vooruit, en vertrouw op uw gevoel.',
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
          <div className="mt-8">
            <Link href="/contact">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Neem contact op
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
