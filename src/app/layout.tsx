// src/app/layout.tsx
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Header, Footer } from '@/components/layout';
import { Providers } from '@/components/providers';
import { auth } from '@/lib/auth';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'VakSpot - Vind de beste vakmensen',
    template: '%s | VakSpot',
  },
  description: 'Vind betrouwbare vakmensen voor al uw klussen. Vergelijk offertes, lees reviews en kies de beste vakman voor uw project.',
  keywords: ['vakman', 'klussen', 'schilder', 'loodgieter', 'elektricien', 'aannemer', 'Nederland'],
  authors: [{ name: 'VakSpot' }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://vakspot.nl',
    siteName: 'VakSpot',
    title: 'VakSpot - Vind de beste vakmensen',
    description: 'Vind betrouwbare vakmensen voor al uw klussen.',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="nl" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Providers>
          <Header session={session} />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
