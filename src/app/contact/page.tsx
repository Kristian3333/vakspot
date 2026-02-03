// src/app/contact/page.tsx
import { Card } from '@/components/ui';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Neem contact op met VakSpot. Wij staan klaar om uw vragen te beantwoorden.',
};

export default function ContactPage() {
  const contactMethods = [
    {
      title: 'E-mail',
      description: 'Stuur ons een e-mail',
      value: 'support@vakspot.nl',
      icon: Mail,
      href: 'mailto:support@vakspot.nl',
    },
    {
      title: 'Telefoon',
      description: 'Bel ons direct',
      value: '020-123 4567',
      icon: Phone,
      href: 'tel:+31201234567',
    },
    {
      title: 'Adres',
      description: 'Bezoek ons kantoor',
      value: 'Herengracht 123, 1015 BH Amsterdam',
      icon: MapPin,
      href: null,
    },
  ];

  const legalInfo = {
    companyName: 'VakSpot B.V.',
    kvkNumber: '12345678',
    vatNumber: 'NL123456789B01',
    address: 'Herengracht 123',
    postalCode: '1015 BH',
    city: 'Amsterdam',
    country: 'Nederland',
  };

  const openingHours = [
    { day: 'Maandag - Vrijdag', hours: '09:00 - 18:00' },
    { day: 'Zaterdag', hours: '10:00 - 14:00' },
    { day: 'Zondag', hours: 'Gesloten' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Neem <span className="text-gradient">contact</span> op
            </h1>
            <p className="mt-6 text-lg text-surface-600">
              Heeft u een vraag, opmerking of suggestie? Wij horen graag van u.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 border-b border-surface-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            {contactMethods.map((method) => (
              <Card key={method.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                  <method.icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mt-4 font-semibold text-surface-900">{method.title}</h3>
                <p className="text-sm text-surface-500">{method.description}</p>
                {method.href ? (
                  <a
                    href={method.href}
                    className="mt-2 text-brand-600 hover:text-brand-700 font-medium"
                  >
                    {method.value}
                  </a>
                ) : (
                  <p className="mt-2 text-surface-700 font-medium">{method.value}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-surface-900 mb-6">
                Stuur ons een bericht
              </h2>
              <ContactForm />
            </div>

            {/* Info */}
            <div className="space-y-8">
              {/* Opening Hours */}
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-5 w-5 text-brand-500" />
                  <h3 className="font-semibold text-surface-900">Openingstijden</h3>
                </div>
                <ul className="space-y-2">
                  {openingHours.map((item) => (
                    <li key={item.day} className="flex justify-between text-sm">
                      <span className="text-surface-600">{item.day}</span>
                      <span className="text-surface-900 font-medium">{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Quick Links */}
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="h-5 w-5 text-brand-500" />
                  <h3 className="font-semibold text-surface-900">Snelle hulp</h3>
                </div>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/faq"
                      className="flex items-center gap-2 text-surface-600 hover:text-brand-600 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Veelgestelde vragen
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/help"
                      className="flex items-center gap-2 text-surface-600 hover:text-brand-600 transition-colors"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Help center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/how-it-works"
                      className="flex items-center gap-2 text-surface-600 hover:text-brand-600 transition-colors"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Hoe werkt VakSpot?
                    </Link>
                  </li>
                </ul>
              </Card>

              {/* Response Time */}
              <Card className="bg-brand-50 border-brand-200">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-brand-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-brand-900">Snelle reactie</h3>
                    <p className="text-sm text-brand-700 mt-1">
                      Wij streven ernaar om binnen 24 uur op uw bericht te reageren
                      tijdens werkdagen.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Information Section */}
      <section className="py-12 bg-surface-50 border-t border-surface-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-surface-900 mb-6 text-center">
            Bedrijfsgegevens
          </h2>
          <div className="max-w-xl mx-auto">
            <Card>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-surface-500">Bedrijfsnaam</dt>
                  <dd className="font-medium text-surface-900">{legalInfo.companyName}</dd>
                </div>
                <div>
                  <dt className="text-surface-500">KvK-nummer</dt>
                  <dd className="font-medium text-surface-900">{legalInfo.kvkNumber}</dd>
                </div>
                <div>
                  <dt className="text-surface-500">BTW-nummer</dt>
                  <dd className="font-medium text-surface-900">{legalInfo.vatNumber}</dd>
                </div>
                <div>
                  <dt className="text-surface-500">Adres</dt>
                  <dd className="font-medium text-surface-900">
                    {legalInfo.address}<br />
                    {legalInfo.postalCode} {legalInfo.city}<br />
                    {legalInfo.country}
                  </dd>
                </div>
              </div>
              <p className="mt-4 text-xs text-surface-500">
                VakSpot B.V. is ingeschreven bij de Kamer van Koophandel onder nummer {legalInfo.kvkNumber}.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Regulatory Contact Section */}
      <section className="py-12 border-t border-surface-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-surface-900 mb-6 text-center">
              Contact voor toezichthouders
            </h2>
            <Card>
              <div className="space-y-4 text-sm">
                <p className="text-surface-600">
                  VakSpot B.V. valt onder toezicht van de Autoriteit Consument & Markt (ACM)
                  voor wat betreft de Platform-to-Business (P2B) verordening en de Digital Services Act (DSA).
                </p>
                <div className="border-t border-surface-200 pt-4">
                  <h3 className="font-semibold text-surface-900 mb-2">Aangewezen contactpersoon voor toezichthouders:</h3>
                  <div className="space-y-1 text-surface-600">
                    <p><strong>Functie:</strong> Compliance Officer / Legal Affairs</p>
                    <p><strong>E-mail:</strong> <a href="mailto:legal@vakspot.nl" className="text-brand-600 hover:text-brand-700">legal@vakspot.nl</a></p>
                    <p><strong>Telefoon:</strong> 020-123 4567 (keuzemenu: toezichthouders)</p>
                    <p><strong>Postadres:</strong> VakSpot B.V., t.a.v. Legal Affairs, Herengracht 123, 1015 BH Amsterdam</p>
                  </div>
                </div>
                <div className="border-t border-surface-200 pt-4">
                  <h3 className="font-semibold text-surface-900 mb-2">Toepasselijke toezichthouders:</h3>
                  <ul className="list-disc list-inside text-surface-600 space-y-1">
                    <li>Autoriteit Consument & Markt (ACM) - P2B & DSA</li>
                    <li>Autoriteit Persoonsgegevens (AP) - AVG/GDPR</li>
                    <li>Kamer van Koophandel - Handelsregister</li>
                  </ul>
                </div>
                <p className="text-xs text-surface-500 pt-2">
                  Wij reageren binnen 5 werkdagen op verzoeken van toezichthoudende autoriteiten.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
