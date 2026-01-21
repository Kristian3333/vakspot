// src/app/page.tsx
import Link from 'next/link';
import { Button, Card } from '@/components/ui';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Clock,
  Star,
  Users,
  Paintbrush,
  Wrench,
  Zap,
  Hammer,
  Home,
  Droplets,
  Wind,
  Shovel,
  TreeDeciduous,
  Car,
  Truck,
  Building2,
  Grid3X3,
  Warehouse,
  Blocks,
  PaintRoller,
  Layers,
  HardHat,
  Ruler,
  Square,
  Sparkles,
  LayoutGrid,
  Flame,
  HelpCircle,
} from 'lucide-react';
import prisma from '@/lib/prisma';

// Fetch categories for display
async function getCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    take: 8,
  });
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  // Basic icons
  Paintbrush: Paintbrush,
  Wrench: Wrench,
  Zap: Zap,
  Hammer: Hammer,
  Home: Home,
  Droplets: Droplets,
  Wind: Wind,
  Shovel: Shovel,
  TreeDeciduous: TreeDeciduous,
  Car: Car,
  Truck: Truck,
  Building2: Building2,
  // Extended icons
  Grid3X3: Grid3X3,         // Vloeren
  Warehouse: Warehouse,     // Dakdekker
  Blocks: Blocks,           // Metselaar
  PaintRoller: PaintRoller, // Stukadoor
  Layers: Layers,
  HardHat: HardHat,
  Ruler: Ruler,
  Square: Square,
  Sparkles: Sparkles,       // Schoonmaak
  LayoutGrid: LayoutGrid,   // Kozijnen & Glas
  Flame: Flame,             // CV & Verwarming
  HelpCircle: HelpCircle,   // Overig
};

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-surface-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-100/50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brand-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl lg:text-6xl">
              Vind de perfecte{' '}
              <span className="text-gradient">vakman</span>
              {' '}voor uw klus
            </h1>
            <p className="mt-6 text-lg text-surface-600 sm:text-xl">
              Vergelijk gratis offertes van betrouwbare vakmensen bij u in de buurt. 
              Van schilder tot loodgieter, wij verbinden u met de beste professionals.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/client/jobs/new">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Gratis klus plaatsen
                </Button>
              </Link>
              <Link href="/register/pro">
                <Button variant="outline" size="lg">
                  Vakman worden
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-surface-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success-500" />
                <span>100% gratis voor opdrachtgevers</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-500" />
                <span>Geverifieerde vakmensen</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning-500" />
                <span>4.8 gemiddelde beoordeling</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
              Populaire categorieën
            </h2>
            <p className="mt-4 text-lg text-surface-600">
              Kies een categorie om vakmensen te vinden
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon ? categoryIcons[category.icon] : Wrench;
              return (
                <Link key={category.id} href={`/client/jobs/new?category=${category.slug}`}>
                  <Card hover className="flex flex-col items-center p-6 text-center h-full">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                      {IconComponent && <IconComponent className="h-6 w-6 text-brand-600" />}
                    </div>
                    <h3 className="mt-4 font-semibold text-surface-900">{category.name}</h3>
                    {category.description && (
                      <p className="mt-1 text-sm text-surface-500 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link href="/categories">
              <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Alle categorieën bekijken
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="bg-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-surface-900 sm:text-4xl">
              Hoe werkt het?
            </h2>
            <p className="mt-4 text-lg text-surface-600">
              In drie simpele stappen naar de juiste vakman
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Plaats uw klus',
                description: 'Beschrijf uw klus in een paar minuten. Voeg foto\'s toe voor een betere inschatting.',
                icon: Paintbrush,
              },
              {
                step: '2',
                title: 'Ontvang offertes',
                description: 'Vakmensen reageren met hun beste prijs. Vergelijk en kies de beste match.',
                icon: Users,
              },
              {
                step: '3',
                title: 'Klus afgerond',
                description: 'Plan de klus en laat deze vakkundig uitvoeren. Tevreden? Deel uw ervaring.',
                icon: CheckCircle2,
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <Card className="h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-surface-900">{item.title}</h3>
                  <p className="mt-2 text-surface-600">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '10.000+', label: 'Tevreden klanten', icon: Users },
              { value: '2.500+', label: 'Actieve vakmensen', icon: Wrench },
              { value: '4.8', label: 'Gemiddelde score', icon: Star },
              { value: '24u', label: 'Gemiddelde reactietijd', icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
                  <stat.icon className="h-6 w-6 text-brand-600" />
                </div>
                <p className="mt-4 text-3xl font-bold text-surface-900">{stat.value}</p>
                <p className="mt-1 text-surface-600">{stat.label}</p>
              </div>
            ))}
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
            Plaats vandaag nog uw eerste klus en ontvang binnen 24 uur offertes van vakmensen bij u in de buurt.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/client/jobs/new">
              <Button
                size="lg"
                className="bg-white text-brand-600 hover:bg-brand-50"
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Klus plaatsen
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
          </div>
        </div>
      </section>
    </div>
  );
}
