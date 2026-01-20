// src/app/(dashboard)/client/jobs/new/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { JobForm } from '@/components/forms/job-form';

export const metadata = {
  title: 'Nieuwe klus plaatsen',
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

async function getCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
    },
  });
}

export default async function NewJobPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/client/jobs/new');
  }

  // Ensure client has a profile
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!clientProfile) {
    // Create profile if it doesn't exist
    await prisma.clientProfile.create({
      data: { userId: session.user.id },
    });
  }

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Nieuwe klus plaatsen</h1>
        <p className="mt-2 text-surface-600">
          Beschrijf uw klus en ontvang gratis offertes
        </p>
      </div>

      <JobForm 
        categories={categories} 
        initialCategorySlug={params.category}
      />
    </div>
  );
}
