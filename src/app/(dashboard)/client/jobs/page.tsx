// src/app/(dashboard)/client/jobs/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Button, Card, Badge } from '@/components/ui';
import { Plus, FileText, MapPin, MessageSquare } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export const metadata = {
  title: 'Mijn klussen',
};

const STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }> = {
  DRAFT: { label: 'Concept', variant: 'neutral' },
  PUBLISHED: { label: 'Actief', variant: 'success' },
  IN_CONVERSATION: { label: 'In gesprek', variant: 'warning' },
  ACCEPTED: { label: 'Geaccepteerd', variant: 'success' },
  IN_PROGRESS: { label: 'In uitvoering', variant: 'warning' },
  COMPLETED: { label: 'Afgerond', variant: 'neutral' },
  CANCELLED: { label: 'Geannuleerd', variant: 'error' },
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
      locationCity: true,
      createdAt: true,
      category: {
        select: { name: true },
      },
      images: {
        select: { url: true },
        take: 1,
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Mijn klussen</h1>
        <Link href="/client/jobs/new">
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Nieuwe klus
          </Button>
        </Link>
      </div>

      {/* Jobs list */}
      {jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => {
            const statusConfig = STATUS_LABELS[job.status] || STATUS_LABELS.DRAFT;
            return (
              <Link key={job.id} href={`/client/jobs/${job.id}`}>
                <Card hover className="group">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    {job.images?.[0] ? (
                      <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-100">
                        <img src={job.images[0].url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-surface-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-surface-300" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant={statusConfig.variant} size="sm">
                            {statusConfig.label}
                          </Badge>
                          <h3 className="mt-1 font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      <p className="mt-1 text-sm text-surface-500">
                        {job.category.name}
                      </p>

                      <div className="mt-2 flex items-center gap-4 text-xs text-surface-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.locationCity}
                        </span>
                        {job._count.bids > 0 && (
                          <span className="flex items-center gap-1 text-brand-600 font-medium">
                            <MessageSquare className="h-3 w-3" />
                            {job._count.bids} reactie{job._count.bids !== 1 ? 's' : ''}
                          </span>
                        )}
                        <span>{formatRelativeTime(job.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">Nog geen klussen</h3>
          <p className="mt-2 text-surface-500">Plaats uw eerste klus</p>
          <Link href="/client/jobs/new" className="mt-6 inline-block">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Klus plaatsen
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
