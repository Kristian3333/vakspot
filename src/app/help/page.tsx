// src/app/help/page.tsx
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import {
  Search,
  HelpCircle,
  MessageSquare,
  FileText,
  Users,
  CreditCard,
  Shield,
  Settings,
  ArrowRight,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help center',
  description: 'Vind antwoorden op uw vragen over VakSpot. Bekijk onze handleidingen en veelgestelde vragen.',
};

export default function HelpPage() {
  const helpCategories = [
    {
      title: 'Voor opdrachtgevers',
      description: 'Hulp bij het plaatsen van klussen en vinden van vakmensen',
      icon: Users,
      articles: [
        { title: 'Hoe plaats ik een klus?', href: '/help/articles/post-job' },
        { title: 'Hoe kies ik de juiste vakman?', href: '/help/articles/choose-pro' },
        { title: 'Wat kost het gebruik van VakSpot?', href: '/help/articles/pricing-clients' },
        { title: 'Hoe annuleer ik een klus?', href: '/help/articles/cancel-job' },
      ],
    },
    {
      title: 'Voor vakmensen',
      description: 'Hulp bij het reageren op leads en beheren van uw profiel',
      icon: Settings,
      articles: [
        { title: 'Hoe meld ik mij aan als vakman?', href: '/help/articles/register-pro' },
        { title: 'Hoe reageer ik op leads?', href: '/help/articles/respond-leads' },
        { title: 'Wat zijn de kosten voor vakmensen?', href: '/help/articles/pricing-pros' },
        { title: 'Hoe verbeter ik mijn profiel?', href: '/help/articles/improve-profile' },
      ],
    },
    {
      title: 'Account & betalingen',
      description: 'Beheer uw account en betalingsgegevens',
      icon: CreditCard,
      articles: [
        { title: 'Hoe wijzig ik mijn wachtwoord?', href: '/help/articles/change-password' },
        { title: 'Hoe wijzig ik mijn e-mailadres?', href: '/help/articles/change-email' },
        { title: 'Hoe verwijder ik mijn account?', href: '/help/articles/delete-account' },
        { title: 'Betalingsmethodes', href: '/help/articles/payment-methods' },
      ],
    },
    {
      title: 'Veiligheid & privacy',
      description: 'Informatie over veilig gebruik van VakSpot',
      icon: Shield,
      articles: [
        { title: 'Hoe beschermt VakSpot mijn gegevens?', href: '/help/articles/data-protection' },
        { title: 'Tips voor veilig contact', href: '/help/articles/safe-contact' },
        { title: 'Meld verdacht gedrag', href: '/help/articles/report-abuse' },
        { title: 'Verificatie van vakmensen', href: '/help/articles/pro-verification' },
      ],
    },
  ];

  const popularArticles = [
    { title: 'Hoe werkt VakSpot?', href: '/how-it-works' },
    { title: 'Is VakSpot gratis?', href: '/help/articles/pricing-clients' },
    { title: 'Hoe krijg ik goede offertes?', href: '/help/articles/get-quotes' },
    { title: 'Wat als ik niet tevreden ben?', href: '/help/articles/complaints' },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Hoe kunnen we u <span className="text-gradient">helpen</span>?
            </h1>
            <p className="mt-6 text-lg text-surface-600">
              Vind antwoorden op uw vragen of neem contact met ons op.
            </p>

            {/* Search */}
            <div className="mt-8 relative max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Zoek in help artikelen..."
                  className="w-full rounded-xl border border-surface-200 bg-white py-4 pl-12 pr-4 text-surface-900 placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 border-b border-surface-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Populaire artikelen</h2>
          <div className="flex flex-wrap gap-3">
            {popularArticles.map((article) => (
              <Link
                key={article.href}
                href={article.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-100 text-surface-700 hover:bg-surface-200 transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2">
            {helpCategories.map((category) => (
              <Card key={category.title}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                    <category.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-surface-900">
                      {category.title}
                    </h2>
                    <p className="text-sm text-surface-500">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article.href}>
                      <Link
                        href={article.href}
                        className="flex items-center gap-2 text-surface-600 hover:text-brand-600 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-surface-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <MessageSquare className="h-12 w-12 text-brand-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-surface-900 sm:text-3xl">
            Niet gevonden wat u zoekt?
          </h2>
          <p className="mt-4 text-lg text-surface-600">
            Ons team staat klaar om u te helpen. Neem contact met ons op.
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
