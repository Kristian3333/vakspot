// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Search, Briefcase, CheckCircle2, Clock, Shield, Users, ArrowRight, Info } from 'lucide-react';
import { auth } from '@/lib/auth';

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  // Redirect logged-in users to their dashboard
  if (userRole === 'PRO') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-surface-900 text-center">
          Welkom terug!
        </h1>
        <p className="mt-4 text-lg text-surface-600 text-center max-w-md">
          Bekijk de nieuwste klussen in uw regio.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/pro/jobs">
            <Button size="lg">
              <Search className="h-5 w-5 mr-2" />
              Bekijk klussen
            </Button>
          </Link>
          <Link href="/messages">
            <Button variant="outline" size="lg">
              Mijn berichten
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (userRole === 'CLIENT') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-surface-900 text-center">
          Welkom terug!
        </h1>
        <p className="mt-4 text-lg text-surface-600 text-center max-w-md">
          Plaats een klus of bekijk uw lopende klussen.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/client/jobs/new">
            <Button size="lg">
              Nieuwe klus plaatsen
            </Button>
          </Link>
          <Link href="/client/jobs">
            <Button variant="outline" size="lg">
              Mijn klussen
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Landing page for visitors
  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-surface-900 text-center max-w-2xl">
          Vind de perfecte <span className="text-brand-600">vakman</span> voor uw klus
        </h1>
        
        <p className="mt-6 text-lg text-surface-600 text-center max-w-xl">
          Verbind met betrouwbare vakmensen bij u in de buurt. Gratis, snel en gemakkelijk.
        </p>

        {/* Two clear paths */}
        <div className="mt-12 grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Client path */}
          <Link href="/register/client" className="group">
            <div className="h-full p-8 rounded-2xl border-2 border-surface-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                <Search className="h-8 w-8 text-brand-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-surface-900">
                Ik zoek een vakman
              </h2>
              <p className="mt-2 text-surface-600">
                Plaats gratis uw klus en ontvang reacties van vakmensen
              </p>
              <div className="mt-6">
                <span className="inline-flex items-center text-brand-600 font-medium group-hover:underline">
                  Klus plaatsen →
                </span>
              </div>
            </div>
          </Link>

          {/* Pro path */}
          <Link href="/register/pro" className="group">
            <div className="h-full p-8 rounded-2xl border-2 border-surface-200 bg-white hover:border-brand-500 hover:shadow-lg transition-all text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                <Briefcase className="h-8 w-8 text-surface-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-surface-900">
                Ik ben vakman
              </h2>
              <p className="mt-2 text-surface-600">
                Vind nieuwe klussen en groei uw bedrijf
              </p>
              <div className="mt-6">
                <span className="inline-flex items-center text-brand-600 font-medium group-hover:underline">
                  Aanmelden →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-surface-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success-500" />
            <span>100% gratis</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-500" />
            <span>Snel contact</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-surface-400" />
            <span>Lokale vakmensen</span>
          </div>
        </div>
      </section>

      {/* How it works - Concrete steps */}
      <section className="bg-surface-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-surface-900 text-center mb-12">
            Zo werkt het
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="mt-4 font-semibold text-surface-900">Plaats uw klus</h3>
              <p className="mt-2 text-sm text-surface-600">
                Beschrijf wat u nodig heeft in een paar minuten
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="mt-4 font-semibold text-surface-900">Ontvang reacties</h3>
              <p className="mt-2 text-sm text-surface-600">
                Vakmensen tonen interesse en sturen een bericht
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="mt-4 font-semibold text-surface-900">Kies uw vakman</h3>
              <p className="mt-2 text-sm text-surface-600">
                Chat, vergelijk en kies de beste match
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Explanation (P2B Compliance) */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-surface-50 border border-surface-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                <Info className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Wat doet VakSpot?</h3>
                <p className="mt-2 text-sm text-surface-600">
                  VakSpot is een <strong>bemiddelingsplatform</strong> dat opdrachtgevers verbindt met zelfstandige vakmensen. 
                  Wij zijn géén aannemer en voeren zelf geen werkzaamheden uit.
                </p>
                
                {/* Simple visual diagram */}
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-surface-500">
                  <div className="px-3 py-2 rounded-lg bg-white border border-surface-200 text-center">
                    <Users className="h-5 w-5 mx-auto text-brand-500" />
                    <span className="block mt-1">Opdrachtgever</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-400" />
                  <div className="px-3 py-2 rounded-lg bg-brand-50 border border-brand-200 text-center">
                    <span className="font-semibold text-brand-600">VakSpot</span>
                    <span className="block text-xs text-brand-500">Bemiddeling</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-surface-400" />
                  <div className="px-3 py-2 rounded-lg bg-white border border-surface-200 text-center">
                    <Briefcase className="h-5 w-5 mx-auto text-surface-500" />
                    <span className="block mt-1">Vakman</span>
                  </div>
                </div>

                <ul className="mt-4 text-sm text-surface-600 space-y-1">
                  <li>• U maakt rechtstreeks afspraken met de vakman</li>
                  <li>• Prijs en voorwaarden bepaalt u onderling</li>
                  <li>• De vakman is verantwoordelijk voor zijn eigen werk</li>
                </ul>
                
                <Link 
                  href="/faq#platform" 
                  className="inline-flex items-center gap-1 mt-3 text-sm text-brand-600 hover:underline"
                >
                  Meer informatie
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
