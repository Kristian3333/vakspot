// src/app/terms/page.tsx
import Link from 'next/link';
import { Card } from '@/components/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'De algemene voorwaarden van VakSpot. Lees onze gebruiksvoorwaarden.',
};

export default function TermsPage() {
  const sections = [
    {
      title: '1. Definities',
      content: `In deze algemene voorwaarden wordt verstaan onder:

• Platform: de website vakspot.nl en alle bijbehorende diensten
• VakSpot: de beheerder van het Platform
• Opdrachtgever: de natuurlijke persoon of rechtspersoon die via het Platform een klus plaatst
• Vakman: de professional die via het Platform diensten aanbiedt
• Gebruiker: zowel Opdrachtgevers als Vakmensen
• Klus: de opdracht die een Opdrachtgever via het Platform plaatst
• Offerte/Bod: het voorstel dat een Vakman doet voor een Klus`,
    },
    {
      title: '2. Toepasselijkheid',
      content: `Deze algemene voorwaarden zijn van toepassing op:

• Elk bezoek aan en gebruik van het Platform
• Elke registratie als Gebruiker
• Elke overeenkomst tussen VakSpot en een Gebruiker
• Alle overeenkomsten die via het Platform tot stand komen tussen Opdrachtgevers en Vakmensen

Door gebruik te maken van het Platform accepteert u deze voorwaarden.`,
    },
    {
      title: '3. Dienstverlening',
      content: `VakSpot biedt een online platform waar:

• Opdrachtgevers klussen kunnen plaatsen
• Vakmensen kunnen reageren op klussen met offertes
• Partijen met elkaar in contact kunnen komen

VakSpot is slechts bemiddelaar en geen partij bij overeenkomsten tussen Opdrachtgevers en Vakmensen. VakSpot garandeert niet dat:

• Opdrachtgevers offertes ontvangen
• Vakmensen opdrachten krijgen
• De kwaliteit van werk aan bepaalde normen voldoet`,
    },
    {
      title: '4. Registratie en account',
      content: `Om gebruik te maken van bepaalde functies moet u een account aanmaken. U bent verantwoordelijk voor:

• Het verstrekken van juiste en volledige gegevens
• Het geheimhouden van uw inloggegevens
• Alle activiteiten die via uw account plaatsvinden

VakSpot kan accounts weigeren, opschorten of beëindigen bij:

• Vermoeden van misbruik of fraude
• Schending van deze voorwaarden
• Onacceptabel gedrag`,
    },
    {
      title: '5. Gebruik van het Platform',
      content: `Bij het gebruik van het Platform is het verboden om:

• Onjuiste of misleidende informatie te verstrekken
• Spam te versturen of andere Gebruikers te misleiden
• Illegale activiteiten te ontplooien
• De werking van het Platform te verstoren
• Content te plaatsen die inbreuk maakt op rechten van derden
• Rechtstreeks contact op te nemen om het Platform te omzeilen
• Meerdere accounts aan te maken voor dezelfde persoon/bedrijf`,
    },
    {
      title: '6. Vergoedingen',
      content: `Voor Opdrachtgevers:
• Het plaatsen van klussen en ontvangen van offertes is gratis
• Er worden geen bemiddelingskosten in rekening gebracht

Voor Vakmensen:
• Er kunnen kosten verbonden zijn aan het reageren op leads
• Prijzen worden vooraf duidelijk gecommuniceerd
• Betaling geschiedt via de op het Platform aangegeven methoden`,
    },
    {
      title: '7. Overeenkomsten tussen Gebruikers',
      content: `Overeenkomsten tussen Opdrachtgevers en Vakmensen:

• Komen rechtstreeks tot stand tussen deze partijen
• VakSpot is hier geen partij bij
• Vallen onder de afspraken die partijen onderling maken

VakSpot is niet aansprakelijk voor:

• De uitvoering van werkzaamheden
• De kwaliteit van geleverd werk
• Geschillen tussen Gebruikers
• Schade voortvloeiend uit overeenkomsten`,
    },
    {
      title: '8. Aansprakelijkheid',
      content: `VakSpot is niet aansprakelijk voor:

• Indirecte schade, gevolgschade of gederfde winst
• Schade door onjuiste informatie van Gebruikers
• Schade door onbevoegd gebruik van accounts
• Tijdelijke onbeschikbaarheid van het Platform
• Handelingen van andere Gebruikers

Indien VakSpot aansprakelijk is, is deze beperkt tot het bedrag dat in de afgelopen 12 maanden door de betreffende Gebruiker aan VakSpot is betaald.`,
    },
    {
      title: '9. Intellectueel eigendom',
      content: `Alle intellectuele eigendomsrechten op het Platform, inclusief teksten, afbeeldingen, software en design, behoren toe aan VakSpot of haar licentiegevers.

Gebruikers verlenen VakSpot een licentie om geplaatste content te gebruiken voor het functioneren van het Platform.`,
    },
    {
      title: '10. Privacy',
      content: `VakSpot verwerkt persoonsgegevens conform het privacybeleid en de toepasselijke wetgeving. Door gebruik van het Platform stemt u in met deze verwerking. Zie ons privacybeleid voor meer informatie.`,
    },
    {
      title: '11. Reviews en beoordelingen',
      content: `Gebruikers kunnen reviews en beoordelingen achterlaten. Deze moeten:

• Gebaseerd zijn op daadwerkelijke ervaringen
• Eerlijk en niet misleidend zijn
• Geen beledigende of discriminerende inhoud bevatten

VakSpot behoudt het recht om reviews te verwijderen of aan te passen bij schending van deze regels.`,
    },
    {
      title: '12. Wijzigingen',
      content: `VakSpot behoudt het recht om:

• Deze voorwaarden te wijzigen
• Het Platform aan te passen of te beëindigen
• Prijzen te wijzigen

Wijzigingen worden via het Platform gecommuniceerd. Voortgezet gebruik na wijzigingen betekent acceptatie van de nieuwe voorwaarden.`,
    },
    {
      title: '13. Geschillen',
      content: `Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Amsterdam.

Wij moedigen Gebruikers aan om geschillen eerst onderling op te lossen of contact met ons op te nemen voor bemiddeling.`,
    },
    {
      title: '14. Contact',
      content: `Voor vragen over deze voorwaarden kunt u contact opnemen met:

VakSpot
E-mail: support@vakspot.nl
Telefoon: 020-123 4567`,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Algemene voorwaarden
            </h1>
            <p className="mt-6 text-lg text-surface-600">
              Laatst bijgewerkt: januari 2025
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
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

          <div className="mt-12 text-center">
            <p className="text-surface-600">
              Zie ook ons{' '}
              <Link href="/privacy" className="text-brand-600 hover:text-brand-700">
                privacybeleid
              </Link>{' '}
              en ons{' '}
              <Link href="/cookies" className="text-brand-600 hover:text-brand-700">
                cookiebeleid
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
