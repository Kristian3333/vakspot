// src/app/(dashboard)/client/jobs/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Button, Card } from '@/components/ui';
import { JobCard, JobCardSkeleton } from '@/components/jobs/job-card';
import { Plus, FileText } from 'lucide-react';

export const metadata = {
  title: 'Mijn klussen',
};

async function getClientJobs(userId: string) {
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId },
  });

  if (!clientProfile) return [];

  return prisma.job.findMany({
    where: { clientId: clientProfile.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      budgetMin: true,
      budgetMax: true,
      budgetType: true,
      locationCity: true,
      timeline: true,
      createdAt: true,
      publishedAt: true,
      category: {
        select: { id: true, name: true, slug: true, icon: true },
      },
      images: {
        select: { id: true, url: true },
        take: 1,
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { bids: true },
      },
    },
  });
}

export default async function ClientJobsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/client/jobs');
  }

  const jobs = await getClientJobs(session.user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Mijn klussen</h1>
          <p className="mt-1 text-surface-600">
            Beheer uw klussen en bekijk offertes
          </p>
        </div>
        <Link href="/client/jobs/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Nieuwe klus
          </Button>
        </Link>
      </div>

      {/* Jobs grid */}
      {jobs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              href={`/client/jobs/${job.id}`}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">
            Nog geen klussen
          </h3>
          <p className="mt-2 text-surface-600">
            Plaats uw eerste klus en ontvang offertes van vakmensen
          </p>
          <Link href="/client/jobs/new" className="mt-6 inline-block">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Eerste klus plaatsen
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
