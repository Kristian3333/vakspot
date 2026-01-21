// src/app/cookies/page.tsx
import Link from 'next/link';
import { Card } from '@/components/ui';
import { Cookie, Shield, BarChart, Settings } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookiebeleid',
  description: 'Het cookiebeleid van VakSpot. Lees hoe wij cookies gebruiken.',
};

export default function CookiesPage() {
  const cookieTypes = [
    {
      title: 'Noodzakelijke cookies',
      icon: Shield,
      description: 'Deze cookies zijn essentieel voor het functioneren van de website.',
      examples: [
        'Sessiecookies voor ingelogde gebruikers',
        'Beveiligingscookies',
        'Cookievoorkeurencookie',
      ],
      canDisable: false,
    },
    {
      title: 'Functionele cookies',
      icon: Settings,
      description: 'Deze cookies onthouden uw voorkeuren voor een betere ervaring.',
      examples: [
        'Taalvoorkeuren',
        'Locatie-instellingen',
        'Weergavevoorkeuren',
      ],
      canDisable: true,
    },
    {
      title: 'Analytische cookies',
      icon: BarChart,
      description: 'Deze cookies helpen ons te begrijpen hoe bezoekers de website gebruiken.',
      examples: [
        'Google Analytics',
        'Paginabezoeken en navigatie',
        'Prestatiemetingen',
      ],
      canDisable: true,
    },
  ];

  const sections = [
    {
      title: 'Wat zijn cookies?',
      content: `Cookies zijn kleine tekstbestanden die op uw apparaat worden opgeslagen wanneer u onze website bezoekt. Ze helpen ons om de website te laten functioneren, uw voorkeuren te onthouden en te begrijpen hoe bezoekers de website gebruiken.`,
    },
    {
      title: 'Hoe lang blijven cookies bewaard?',
      content: `Er zijn twee soorten cookies qua bewaartermijn:

• Sessiecookies: worden automatisch verwijderd wanneer u de browser sluit
• Permanente cookies: blijven voor een bepaalde periode op uw apparaat, tenzij u ze verwijdert

De bewaartermijn varieert per cookie, van enkele minuten tot maximaal 2 jaar.`,
    },
    {
      title: 'Cookies van derden',
      content: `Sommige cookies worden geplaatst door externe diensten die wij gebruiken, zoals:

• Google Analytics voor websitestatistieken
• Betalingsdiensten voor veilige transacties
• Social media platforms voor deelfuncties

Deze partijen hebben hun eigen privacybeleid en cookiebeleid.`,
    },
    {
      title: 'Uw cookievoorkeuren beheren',
      content: `U kunt uw cookievoorkeuren op verschillende manieren beheren:

• Via de cookiebanner op onze website bij uw eerste bezoek
• Via uw browserinstellingen
• Via de instellingen van uw besturingssysteem

Let op: het blokkeren van bepaalde cookies kan de functionaliteit van de website beperken.`,
    },
    {
      title: 'Cookies verwijderen',
      content: `U kunt cookies verwijderen via uw browserinstellingen. De exacte stappen verschillen per browser:

• Chrome: Instellingen > Privacy en beveiliging > Browsegegevens wissen
• Firefox: Opties > Privacy & Beveiliging > Cookies en Sitegegevens
• Safari: Voorkeuren > Privacy > Websitedata beheren
• Edge: Instellingen > Privacy > Browsegegevens wissen

Na het verwijderen van cookies moet u mogelijk opnieuw inloggen en worden uw voorkeuren gereset.`,
    },
    {
      title: 'Wijzigingen in dit beleid',
      content: `Wij kunnen dit cookiebeleid van tijd tot tijd bijwerken. De meest recente versie is altijd beschikbaar op deze pagina. Bij significante wijzigingen zullen wij u hierover informeren.`,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 mb-6">
              <Cookie className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Cookiebeleid
            </h1>
            <p className="mt-6 text-lg text-surface-600">
              Informatie over hoe VakSpot cookies gebruikt
            </p>
            <p className="mt-2 text-sm text-surface-500">
              Laatst bijgewerkt: januari 2025
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="py-16 sm:py-24 border-b border-surface-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-12">
            Welke cookies gebruiken wij?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {cookieTypes.map((type) => (
              <Card key={type.title} className="h-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 mb-4">
                  <type.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  {type.title}
                </h3>
                <p className="text-surface-600 text-sm mb-4">
                  {type.description}
                </p>
                <ul className="space-y-2 mb-4">
                  {type.examples.map((example, index) => (
                    <li key={index} className="text-sm text-surface-500 flex items-start gap-2">
                      <span className="text-brand-500 mt-1">•</span>
                      {example}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4 border-t border-surface-100">
                  <span className={`text-xs font-medium ${type.canDisable ? 'text-surface-500' : 'text-brand-600'}`}>
                    {type.canDisable ? 'Kan worden uitgeschakeld' : 'Altijd actief (vereist)'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index}>
                <h2 className="text-xl font-semibold text-surface-900 mb-4">
                  {section.title}
                </h2>
                <div className="text-surface-600 whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
              </Card>
            ))}
          </div>

          {/* Contact */}
          <Card className="mt-8 bg-brand-50 border-brand-200">
            <h3 className="font-semibold text-brand-900 mb-2">
              Vragen over cookies?
            </h3>
            <p className="text-brand-700 text-sm mb-4">
              Heeft u vragen over ons cookiebeleid of hoe wij cookies gebruiken? Neem dan contact met ons op.
            </p>
            <p className="text-sm text-brand-600">
              E-mail:{' '}
              <a href="mailto:support@vakspot.nl" className="underline hover:no-underline">
                support@vakspot.nl
              </a>
            </p>
          </Card>

          <div className="mt-12 text-center">
            <p className="text-surface-600">
              Zie ook onze{' '}
              <Link href="/privacy" className="text-brand-600 hover:text-brand-700">
                privacybeleid
              </Link>{' '}
              en{' '}
              <Link href="/terms" className="text-brand-600 hover:text-brand-700">
                algemene voorwaarden
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
