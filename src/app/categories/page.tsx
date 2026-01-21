// src/app/categories/page.tsx
import Link from 'next/link';
import { Card } from '@/components/ui';
import {
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
} from 'lucide-react';
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categorieën',
  description: 'Bekijk alle categorieën van vakmensen op VakSpot. Van schilders tot loodgieters, vind de juiste vakman voor uw klus.',
};

// Fetch all categories
async function getCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { jobs: true },
      },
    },
  });
}

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-surface-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-surface-900 sm:text-5xl">
              Alle <span className="text-gradient">categorieën</span>
            </h1>
            <p className="mt-6 text-lg text-surface-600">
              Kies een categorie om de juiste vakman voor uw klus te vinden.
              Van kleine reparaties tot grote verbouwingen.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const IconComponent = category.icon ? categoryIcons[category.icon] : Wrench;
              return (
                <Link key={category.id} href={`/client/jobs/new?category=${category.slug}`}>
                  <Card hover className="flex flex-col h-full transition-all hover:shadow-soft-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 flex-shrink-0">
                        {IconComponent && <IconComponent className="h-6 w-6 text-brand-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-surface-900">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="mt-1 text-sm text-surface-500 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-surface-100">
                      <span className="text-sm text-brand-600 font-medium">
                        Klus plaatsen →
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-surface-500">
                Er zijn momenteel geen categorieën beschikbaar.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-surface-50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-surface-900 sm:text-3xl">
            Niet gevonden wat u zoekt?
          </h2>
          <p className="mt-4 text-lg text-surface-600">
            Neem contact met ons op en we helpen u graag verder om de juiste vakman te vinden.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
            >
              Neem contact op →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
