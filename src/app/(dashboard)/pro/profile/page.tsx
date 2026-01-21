// src/app/(dashboard)/pro/profile/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, Button, Avatar } from '@/components/ui';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Star,
  Briefcase,
  Calendar,
  Edit,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatRelativeTime } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Mijn profiel',
  description: 'Beheer uw profiel als vakman op VakSpot.',
};

async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      proProfile: {
        include: {
          categories: true,
        },
      },
      _count: {
        select: {
          bids: true,
          reviewsReceived: true,
        },
      },
    },
  });
}

async function getStats(userId: string) {
  const [completedBids, reviews] = await Promise.all([
    prisma.bid.count({
      where: {
        proId: userId,
        status: 'ACCEPTED',
      },
    }),
    prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  return {
    completedJobs: completedBids,
    avgRating: reviews._avg.rating || 0,
    reviewCount: reviews._count,
  };
}

async function getReviews(userId: string) {
  // First get the pro profile to find reviews
  const proProfile = await prisma.proProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!proProfile) return [];

  return prisma.review.findMany({
    where: { proId: proProfile.id },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          category: { select: { name: true } },
          client: {
            select: { user: { select: { name: true, image: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'text-warning-500 fill-warning-500'
              : 'text-surface-300'
          }`}
        />
      ))}
    </div>
  );
}

export default async function ProProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'PRO') {
    redirect('/profile');
  }

  const [profile, stats, reviews] = await Promise.all([
    getProfile(session.user.id),
    getStats(session.user.id),
    getReviews(session.user.id),
  ]);

  if (!profile) {
    redirect('/login');
  }

  const proProfile = profile.proProfile;

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-surface-900">Mijn profiel</h1>
          <Link href="/pro/profile/edit">
            <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />}>
              Bewerken
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar
              src={profile.image}
              name={profile.name}
              size="xl"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-surface-900">
                  {profile.name}
                </h2>
                {proProfile?.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success-100 text-success-700 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Geverifieerd
                  </span>
                )}
              </div>
              
              {proProfile?.companyName && (
                <p className="mt-1 text-surface-600 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {proProfile.companyName}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-surface-600">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </span>
                {proProfile?.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {proProfile.phone}
                  </span>
                )}
                {(proProfile?.city || proProfile?.postcode) && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {[proProfile.city, proProfile.postcode].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <Briefcase className="h-6 w-6 text-brand-500 mx-auto" />
            <p className="mt-2 text-2xl font-bold text-surface-900">{stats.completedJobs}</p>
            <p className="text-sm text-surface-500">Afgeronde klussen</p>
          </Card>
          <Card className="text-center">
            <Star className="h-6 w-6 text-warning-500 mx-auto" />
            <p className="mt-2 text-2xl font-bold text-surface-900">
              {stats.avgRating.toFixed(1)}
            </p>
            <p className="text-sm text-surface-500">{stats.reviewCount} reviews</p>
          </Card>
          <Card className="text-center">
            <Clock className="h-6 w-6 text-surface-400 mx-auto" />
            <p className="mt-2 text-2xl font-bold text-surface-900">
              {new Date(profile.createdAt).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}
            </p>
            <p className="text-sm text-surface-500">Lid sinds</p>
          </Card>
        </div>

        {/* Bio */}
        {proProfile?.bio && (
          <Card className="mb-6">
            <h3 className="font-semibold text-surface-900 mb-3">Over mij</h3>
            <p className="text-surface-600 whitespace-pre-wrap">{proProfile.bio}</p>
          </Card>
        )}

        {/* Categories */}
        {proProfile?.categories && proProfile.categories.length > 0 && (
          <Card className="mb-6">
            <h3 className="font-semibold text-surface-900 mb-3">Specialisaties</h3>
            <div className="flex flex-wrap gap-2">
              {proProfile.categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Work Area */}
        {proProfile?.workRadius && (
          <Card className="mb-6">
            <h3 className="font-semibold text-surface-900 mb-3">Werkgebied</h3>
            <p className="text-surface-600">
              {proProfile.city || 'Uw locatie'} + {proProfile.workRadius} km radius
            </p>
          </Card>
        )}

        {/* Reviews Section */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">
              Beoordelingen ({stats.reviewCount})
            </h3>
            {stats.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(stats.avgRating)} />
                <span className="text-sm font-medium text-surface-700">
                  {stats.avgRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-lg border border-surface-200 bg-surface-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={review.job.client.user.image}
                        name={review.job.client.user.name}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-surface-900">
                          {review.job.client.user.name}
                        </p>
                        <p className="text-xs text-surface-500">
                          {review.job.title} • {review.job.category.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StarRating rating={review.rating} />
                      <p className="text-xs text-surface-500 mt-1">
                        {formatRelativeTime(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {review.title && (
                    <h4 className="mt-3 font-medium text-surface-900">
                      {review.title}
                    </h4>
                  )}
                  
                  {review.content && (
                    <p className="mt-2 text-sm text-surface-600">
                      {review.content}
                    </p>
                  )}

                  {/* Detailed ratings */}
                  {(review.qualityRating || review.communicationRating || review.timelinessRating || review.valueRating) && (
                    <div className="mt-3 pt-3 border-t border-surface-200 grid grid-cols-2 gap-2 text-xs">
                      {review.qualityRating && (
                        <div className="flex items-center justify-between">
                          <span className="text-surface-500">Kwaliteit</span>
                          <StarRating rating={review.qualityRating} />
                        </div>
                      )}
                      {review.communicationRating && (
                        <div className="flex items-center justify-between">
                          <span className="text-surface-500">Communicatie</span>
                          <StarRating rating={review.communicationRating} />
                        </div>
                      )}
                      {review.timelinessRating && (
                        <div className="flex items-center justify-between">
                          <span className="text-surface-500">Stiptheid</span>
                          <StarRating rating={review.timelinessRating} />
                        </div>
                      )}
                      {review.valueRating && (
                        <div className="flex items-center justify-between">
                          <span className="text-surface-500">Prijs/kwaliteit</span>
                          <StarRating rating={review.valueRating} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-surface-500">
              <MessageSquare className="mx-auto h-10 w-10 text-surface-300 mb-3" />
              <p>Nog geen beoordelingen ontvangen</p>
              <p className="text-sm mt-1">
                Beoordelingen verschijnen hier nadat klanten feedback geven
              </p>
            </div>
          )}
        </Card>

        {/* Empty State for new profiles */}
        {!proProfile && (
          <Card className="text-center py-12">
            <User className="h-12 w-12 text-surface-300 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-surface-900">
              Maak uw profiel compleet
            </h3>
            <p className="mt-2 text-surface-500">
              Een compleet profiel vergroot uw kans op opdrachten.
            </p>
            <Link href="/pro/profile/edit" className="mt-4 inline-block">
              <Button>Profiel aanvullen</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
