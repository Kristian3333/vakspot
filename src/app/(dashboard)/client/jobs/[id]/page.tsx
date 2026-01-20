// src/app/(dashboard)/client/jobs/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Button, Card, Badge, StatusBadge, Avatar } from '@/components/ui';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  ArrowLeft, 
  MessageSquare,
  Star,
  Check,
  X
} from 'lucide-react';

export const metadata = {
  title: 'Klus details',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<string, 'neutral' | 'primary' | 'success' | 'warning' | 'error'> = {
  DRAFT: 'neutral',
  PUBLISHED: 'primary',
  IN_CONVERSATION: 'warning',
  ACCEPTED: 'success',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
  REVIEWED: 'success',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Concept',
  PUBLISHED: 'Gepubliceerd',
  IN_CONVERSATION: 'In gesprek',
  ACCEPTED: 'Geaccepteerd',
  IN_PROGRESS: 'In uitvoering',
  COMPLETED: 'Afgerond',
  CANCELLED: 'Geannuleerd',
  REVIEWED: 'Beoordeeld',
};

const timelineLabels: Record<string, string> = {
  URGENT: 'Urgent',
  THIS_WEEK: 'Deze week',
  THIS_MONTH: 'Deze maand',
  NEXT_MONTH: 'Volgende maand',
  FLEXIBLE: 'Flexibel',
};

async function getJob(id: string, userId: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      category: true,
      client: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      images: { orderBy: { order: 'asc' } },
      bids: {
        orderBy: { createdAt: 'desc' },
        include: {
          pro: {
            include: {
              user: { select: { id: true, name: true, image: true } },
              categories: { include: { category: true } },
            },
          },
        },
      },
      acceptedBid: {
        include: {
          pro: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
          },
        },
      },
    },
  });

  if (!job) return null;

  // Verify ownership
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

  const canAcceptBids = ['PUBLISHED', 'IN_CONVERSATION'].includes(job.status);
  const hasBids = job.bids.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/client/jobs"
        className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar mijn klussen
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <Badge variant="primary" className="mb-2">{job.category.name}</Badge>
                <h1 className="text-2xl font-bold text-surface-900">{job.title}</h1>
              </div>
              <StatusBadge variant={statusColors[job.status]} size="md">
                {statusLabels[job.status]}
              </StatusBadge>
            </div>

            {/* Images */}
            {job.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {job.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative aspect-video rounded-lg overflow-hidden ${
                      index === 0 ? 'col-span-2 row-span-2' : ''
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${job.title} foto ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="prose prose-surface max-w-none">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </div>
          </Card>

          {/* Bids section */}
          <Card>
            <h2 className="text-lg font-semibold text-surface-900 mb-4">
              Offertes ({job.bids.length})
            </h2>

            {hasBids ? (
              <div className="space-y-4">
                {job.bids.map((bid) => (
                  <div
                    key={bid.id}
                    className={`p-4 rounded-xl border ${
                      bid.status === 'ACCEPTED'
                        ? 'border-success-200 bg-success-50'
                        : 'border-surface-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={bid.pro.user.image}
                        name={bid.pro.user.name}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-surface-900">
                              {bid.pro.companyName}
                            </h3>
                            <p className="text-sm text-surface-500">
                              {bid.pro.user.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-surface-900">
                              {formatCurrency(bid.amount)}
                            </p>
                            <p className="text-xs text-surface-500">
                              {formatRelativeTime(bid.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Pro stats */}
                        <div className="flex items-center gap-3 mt-2 text-sm text-surface-500">
                          {bid.pro.avgRating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-warning-500 fill-warning-500" />
                              {bid.pro.avgRating.toFixed(1)}
                              <span className="text-surface-400">
                                ({bid.pro.totalReviews})
                              </span>
                            </span>
                          )}
                          {bid.pro.verified && (
                            <Badge variant="success" size="sm">Geverifieerd</Badge>
                          )}
                        </div>

                        {/* Bid message */}
                        <p className="mt-3 text-sm text-surface-600">
                          {bid.message}
                        </p>

                        {/* Actions */}
                        {canAcceptBids && bid.status === 'PENDING' && (
                          <div className="flex gap-2 mt-4">
                            <form action={`/api/bids/${bid.id}/accept`} method="POST">
                              <Button
                                type="submit"
                                size="sm"
                                leftIcon={<Check className="h-4 w-4" />}
                              >
                                Accepteren
                              </Button>
                            </form>
                            <Link href={`/messages?bid=${bid.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<MessageSquare className="h-4 w-4" />}
                              >
                                Bericht
                              </Button>
                            </Link>
                          </div>
                        )}

                        {bid.status === 'ACCEPTED' && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-success-600">
                            <Check className="h-4 w-4" />
                            Geaccepteerd
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-surface-500">
                <MessageSquare className="mx-auto h-10 w-10 text-surface-300 mb-3" />
                <p>Nog geen offertes ontvangen</p>
                <p className="text-sm mt-1">
                  Vakmensen kunnen nu reageren op uw klus
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job details */}
          <Card>
            <h3 className="font-semibold text-surface-900 mb-4">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-surface-400" />
                <dt className="sr-only">Locatie</dt>
                <dd className="text-surface-600">{job.locationCity}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-surface-400" />
                <dt className="sr-only">Planning</dt>
                <dd className="text-surface-600">{timelineLabels[job.timeline]}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-surface-400" />
                <dt className="sr-only">Geplaatst</dt>
                <dd className="text-surface-600">{formatDate(job.createdAt)}</dd>
              </div>
              {(job.budgetMin || job.budgetMax) && (
                <div className="pt-2 border-t border-surface-200">
                  <dt className="text-surface-500 mb-1">Budget</dt>
                  <dd className="font-medium text-surface-900">
                    {job.budgetMin && job.budgetMax
                      ? `${formatCurrency(job.budgetMin)} - ${formatCurrency(job.budgetMax)}`
                      : job.budgetMax
                      ? `Tot ${formatCurrency(job.budgetMax)}`
                      : `Vanaf ${formatCurrency(job.budgetMin!)}`}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          {/* Accepted pro */}
          {job.acceptedBid && (
            <Card>
              <h3 className="font-semibold text-surface-900 mb-4">
                Geselecteerde vakman
              </h3>
              <div className="flex items-center gap-3">
                <Avatar
                  src={job.acceptedBid.pro.user.image}
                  name={job.acceptedBid.pro.user.name}
                  size="lg"
                />
                <div>
                  <p className="font-medium text-surface-900">
                    {job.acceptedBid.pro.companyName}
                  </p>
                  <p className="text-sm text-surface-500">
                    {job.acceptedBid.pro.user.name}
                  </p>
                </div>
              </div>
              <Link href={`/messages?bid=${job.acceptedBid.id}`} className="block mt-4">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact opnemen
                </Button>
              </Link>
            </Card>
          )}

          {/* Actions */}
          {job.status === 'DRAFT' && (
            <Card>
              <h3 className="font-semibold text-surface-900 mb-4">Acties</h3>
              <form action={`/api/jobs/${job.id}/publish`} method="POST">
                <Button type="submit" className="w-full">
                  Klus publiceren
                </Button>
              </form>
              <p className="mt-2 text-xs text-surface-500 text-center">
                Na publicatie kunnen vakmensen reageren
              </p>
            </Card>
          )}

          {job.status === 'COMPLETED' && !job.review && (
            <Card>
              <h3 className="font-semibold text-surface-900 mb-4">Beoordeling</h3>
              <p className="text-sm text-surface-600 mb-4">
                Tevreden? Laat een beoordeling achter voor de vakman.
              </p>
              <Link href={`/client/jobs/${job.id}/review`}>
                <Button className="w-full">
                  <Star className="h-4 w-4 mr-2" />
                  Beoordeling schrijven
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
