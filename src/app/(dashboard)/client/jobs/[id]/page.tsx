// src/app/(dashboard)/client/jobs/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Button, Card, Badge, Avatar } from '@/components/ui';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { 
  MapPin, 
  ArrowLeft, 
  MessageSquare,
  Star,
  User
} from 'lucide-react';

export const metadata = {
  title: 'Klus details',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' }> = {
  DRAFT: { label: 'Concept', variant: 'neutral' },
  PUBLISHED: { label: 'Actief', variant: 'success' },
  IN_CONVERSATION: { label: 'In gesprek', variant: 'warning' },
  ACCEPTED: { label: 'Vakman gekozen', variant: 'success' },
  IN_PROGRESS: { label: 'In uitvoering', variant: 'warning' },
  COMPLETED: { label: 'Afgerond', variant: 'neutral' },
  CANCELLED: { label: 'Geannuleerd', variant: 'error' },
};

async function getJob(id: string, userId: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      category: true,
      client: {
        include: {
          user: { select: { id: true } },
        },
      },
      images: { orderBy: { order: 'asc' } },
      bids: {
        orderBy: { createdAt: 'desc' },
        include: {
          pro: {
            include: {
              user: { select: { name: true, image: true } },
            },
          },
          conversation: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!job) return null;
  if (job.client.user.id !== userId) return null;

  return job;
}

export default async function JobDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  
  if (!session?.user) {
    redirect(`/login?callbackUrl=/client/jobs/${id}`);
  }

  const job = await getJob(id, session.user.id);

  if (!job) {
    notFound();
  }

  const status = statusConfig[job.status] || statusConfig.DRAFT;
  const interestedPros = job.bids;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href="/client/jobs"
        className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug
      </Link>

      {/* Job details */}
      <Card className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <Badge variant="neutral" size="sm" className="mb-2">{job.category.name}</Badge>
            <h1 className="text-xl font-bold text-surface-900">{job.title}</h1>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Images */}
        {job.images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {job.images.map((image) => (
              <div key={image.id} className="h-32 w-32 flex-shrink-0 rounded-lg overflow-hidden bg-surface-100">
                <Image
                  src={image.url}
                  alt=""
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-surface-700 whitespace-pre-wrap mb-4">{job.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-surface-500 pt-4 border-t border-surface-200">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.locationCity}
          </span>
          <span>{formatDate(job.createdAt)}</span>
        </div>
      </Card>

      {/* Interested pros */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">
          Geïnteresseerde vakmensen ({interestedPros.length})
        </h2>

        {interestedPros.length > 0 ? (
          <div className="space-y-4">
            {interestedPros.map((interest) => (
              <div
                key={interest.id}
                className="p-4 rounded-xl border border-surface-200 hover:border-surface-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    src={interest.pro.user.image}
                    name={interest.pro.user.name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-surface-900">
                          {interest.pro.companyName || interest.pro.user.name}
                        </h3>
                        {interest.pro.companyName && (
                          <p className="text-sm text-surface-500">{interest.pro.user.name}</p>
                        )}
                      </div>
                      <span className="text-xs text-surface-400">
                        {formatRelativeTime(interest.createdAt)}
                      </span>
                    </div>

                    {/* Pro info */}
                    <div className="flex items-center gap-3 mt-2 text-sm text-surface-500">
                      {interest.pro.avgRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-warning-500 fill-warning-500" />
                          {interest.pro.avgRating.toFixed(1)}
                        </span>
                      )}
                      {interest.pro.locationCity && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {interest.pro.locationCity}
                        </span>
                      )}
                    </div>

                    {/* Message preview */}
                    <p className="mt-3 text-sm text-surface-600 line-clamp-2">
                      {interest.message}
                    </p>

                    {/* Action */}
                    {interest.conversation && (
                      <Link href={`/messages/${interest.conversation.id}`} className="mt-3 inline-block">
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Bekijk gesprek
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-surface-500">
            <User className="mx-auto h-10 w-10 text-surface-300 mb-3" />
            <p>Nog geen reacties</p>
            <p className="text-sm mt-1">Vakmensen kunnen nu reageren op uw klus</p>
          </div>
        )}
      </Card>
    </div>
  );
}
