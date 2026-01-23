// src/app/(dashboard)/client/jobs/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Button, Card, Badge, Avatar } from '@/components/ui';
import { DeleteJobButton } from '@/components/jobs/delete-job-button';
import { AcceptProButton } from '@/components/jobs/accept-pro-button';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { 
  MapPin, 
  ArrowLeft, 
  MessageSquare,
  Star,
  User,
  CheckCircle2
} from 'lucide-react';

export const metadata = {
  title: 'Klus details',
};

interface PageProps {
  params: { id: string };
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
  const { id } = params;
  
  if (!session?.user) {
    redirect(`/login?callbackUrl=/client/jobs/${id}`);
  }

  const job = await getJob(id, session.user.id);

  if (!job) {
    notFound();
  }

  const status = statusConfig[job.status] || statusConfig.DRAFT;
  const interestedPros = job.bids;
  const canDelete = !['COMPLETED', 'REVIEWED'].includes(job.status);
  const canAcceptPros = ['PUBLISHED', 'IN_CONVERSATION'].includes(job.status);
  const acceptedBid = interestedPros.find(b => b.status === 'ACCEPTED');

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

        {/* Delete button */}
        {canDelete && (
          <div className="mt-4 pt-4 border-t border-surface-200">
            <DeleteJobButton jobId={job.id} jobTitle={job.title} />
          </div>
        )}
      </Card>

      {/* Accepted pro - show prominently if someone is chosen */}
      {acceptedBid && (
        <Card className="mb-6 border-success-200 bg-success-50/30">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success-600" />
            <h2 className="text-lg font-semibold text-surface-900">Gekozen vakman</h2>
          </div>
          <div className="flex items-start gap-4">
            <Avatar
              src={acceptedBid.pro.user.image}
              name={acceptedBid.pro.user.name}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-surface-900">
                {acceptedBid.pro.companyName || acceptedBid.pro.user.name}
              </h3>
              {acceptedBid.pro.companyName && (
                <p className="text-sm text-surface-500">{acceptedBid.pro.user.name}</p>
              )}
              {acceptedBid.pro.avgRating > 0 && (
                <span className="flex items-center gap-1 mt-1 text-sm text-surface-500">
                  <Star className="h-4 w-4 text-warning-500 fill-warning-500" />
                  {acceptedBid.pro.avgRating.toFixed(1)}
                </span>
              )}
              {acceptedBid.conversation && (
                <Link href={`/messages/${acceptedBid.conversation.id}`} className="mt-3 inline-block">
                  <Button size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ga naar gesprek
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Interested pros */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">
          {acceptedBid ? 'Andere reacties' : 'Geïnteresseerde vakmensen'} ({interestedPros.filter(b => b.status !== 'ACCEPTED').length})
        </h2>

        {interestedPros.filter(b => b.status !== 'ACCEPTED').length > 0 ? (
          <div className="space-y-4">
            {interestedPros.filter(b => b.status !== 'ACCEPTED').map((interest) => {
              const isRejected = interest.status === 'REJECTED';
              
              return (
                <div
                  key={interest.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    isRejected 
                      ? 'border-surface-200 bg-surface-50 opacity-60' 
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
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
                        <div className="flex items-center gap-2">
                          {isRejected && (
                            <Badge variant="neutral" size="sm">Afgewezen</Badge>
                          )}
                          <span className="text-xs text-surface-400">
                            {formatRelativeTime(interest.createdAt)}
                          </span>
                        </div>
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

                      {/* Actions */}
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {interest.conversation && (
                          <Link href={`/messages/${interest.conversation.id}`}>
                            <Button size="sm" variant={canAcceptPros && !isRejected ? 'outline' : 'default'}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Bekijk gesprek
                            </Button>
                          </Link>
                        )}
                        
                        {/* Accept button - only show if job can accept and bid isn't rejected */}
                        {canAcceptPros && !isRejected && (
                          <AcceptProButton 
                            bidId={interest.id} 
                            proName={interest.pro.companyName || interest.pro.user.name || 'deze vakman'}
                            jobTitle={job.title}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
