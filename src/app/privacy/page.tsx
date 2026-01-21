// src/app/privacy/page.tsx
import Link from 'next/link';
import { Card } from '@/components/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Het privacybeleid van VakSpot. Lees hoe wij omgaan met uw persoonsgegevens.',
};

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Inleiding',
      content: `VakSpot ("wij", "ons" of "onze") respecteert uw privacy en zet zich in voor de bescherming van uw persoonsgegevens. Dit privacybeleid informeert u over hoe wij omgaan met uw persoonsgegevens wanneer u onze website bezoekt of gebruik maakt van onze diensten.`,
    },
    {
      title: '2. Welke gegevens verzamelen wij?',
      content: `Wij verzamelen en verwerken de volgende categorieën persoonsgegevens:
      
• Identiteitsgegevens: naam, gebruikersnaam of vergelijkbare identificatie
• Contactgegevens: e-mailadres, telefoonnummer, adres, postcode en woonplaats
• Bedrijfsgegevens (voor vakmensen): bedrijfsnaam, KVK-nummer, werkgebied
• Technische gegevens: IP-adres, browsertype, tijdzone, locatie, besturingssysteem
• Gebruiksgegevens: informatie over hoe u onze website en diensten gebruikt
• Communicatiegegevens: berichten die u via ons platform verstuurt`,
    },
    {
      title: '3. Hoe verzamelen wij uw gegevens?',
      content: `Wij verzamelen gegevens op verschillende manieren:

• Direct van u: wanneer u een account aanmaakt, een klus plaatst, of contact met ons opneemt
• Automatisch: via cookies en vergelijkbare technologieën wanneer u onze website bezoekt
• Van derden: zoals verificatiediensten voor bedrijfsgegevens van vakmensen`,
    },
    {
      title: '4. Waarvoor gebruiken wij uw gegevens?',
      content: `Wij gebruiken uw persoonsgegevens voor de volgende doeleinden:

• Het leveren en beheren van onze diensten
• Het verwerken en voltooien van transacties
• Het mogelijk maken van communicatie tussen opdrachtgevers en vakmensen
• Het verifiëren van de identiteit van vakmensen
• Het verbeteren van onze website en diensten
• Het versturen van servicegerelateerde mededelingen
• Het versturen van marketingcommunicatie (met uw toestemming)
• Het voldoen aan wettelijke verplichtingen`,
    },
    {
      title: '5. Met wie delen wij uw gegevens?',
      content: `Wij kunnen uw gegevens delen met:

• Andere gebruikers: wanneer u een klus plaatst of een offerte stuurt, worden relevante gegevens gedeeld met de andere partij
• Dienstverleners: die ons helpen bij het leveren van onze diensten (hosting, betaling, e-mail)
• Autoriteiten: wanneer wij hiertoe wettelijk verplicht zijn

Wij verkopen uw persoonsgegevens nooit aan derden.`,
    },
    {
      title: '6. Beveiliging van uw gegevens',
      content: `Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen ongeoorloofde toegang, verlies of diefstal. Dit omvat versleuteling van gegevens, beveiligde servers en beperkte toegang tot persoonsgegevens.`,
    },
    {
      title: '7. Bewaartermijn',
      content: `Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld. Na beëindiging van uw account bewaren wij uw gegevens nog maximaal 2 jaar voor administratieve doeleinden en om aan wettelijke verplichtingen te voldoen.`,
    },
    {
      title: '8. Uw rechten',
      content: `U heeft de volgende rechten met betrekking tot uw persoonsgegevens:

• Recht op inzage: u kunt opvragen welke gegevens wij van u hebben
• Recht op rectificatie: u kunt onjuiste gegevens laten corrigeren
• Recht op verwijdering: u kunt vragen om verwijdering van uw gegevens
• Recht op beperking: u kunt vragen om beperking van de verwerking
• Recht op overdraagbaarheid: u kunt uw gegevens opvragen in een gestructureerd formaat
• Recht van bezwaar: u kunt bezwaar maken tegen bepaalde verwerkingen

Om deze rechten uit te oefenen, kunt u contact met ons opnemen via support@vakspot.nl.`,
    },
    {
      title: '9. Cookies',
      content: `Onze website maakt gebruik van cookies en vergelijkbare technologieën. Voor meer informatie verwijzen wij naar ons cookiebeleid.`,
    },
    {
      title: '10. Wijzigingen in dit beleid',
      content: `Wij kunnen dit privacybeleid van tijd tot tijd wijzigen. De meest recente versie is altijd beschikbaar op onze website. Bij significante wijzigingen zullen wij u hiervan op de hoogte stellen.`,
    },
    {
      title: '11. Contact',
      content: `Heeft u vragen over dit privacybeleid of over hoe wij omgaan met uw persoonsgegevens? Neem dan contact met ons op:

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
              Privacybeleid
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
              Zie ook onze{' '}
              <Link href="/terms" className="text-brand-600 hover:text-brand-700">
                algemene voorwaarden
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
