// src/app/profile/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { Card, Avatar, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import {
  MapPin,
  Star,
  Calendar,
  Building,
  User,
  Award,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';

interface PageProps {
  params: { id: string };
}

async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      profileVisible: true,
      clientProfile: {
        select: {
          jobs: {
            select: { id: true },
          },
        },
      },
      proProfile: {
        select: {
          id: true,
          companyName: true,
          description: true,
          phone: true,
          website: true,
          locationCity: true,
          verified: true,
          avgRating: true,
          totalReviews: true,
          entityType: true,
          categories: {
            select: {
              category: {
                select: {
                  name: true,
                  slug: true,
                },
              },
              yearsExp: true,
            },
          },
          certificates: {
            where: {
              status: 'VERIFIED',
            },
            select: {
              certificateType: {
                select: {
                  name: true,
                  code: true,
                  clientLabel: true,
                  category: true,
                },
              },
              expiresAt: true,
              issuedAt: true,
            },
          },
          reviews: {
            where: {
              flagged: false,
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
            select: {
              id: true,
              rating: true,
              title: true,
              content: true,
              response: true,
              respondedAt: true,
              createdAt: true,
              job: {
                select: {
                  title: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                  client: {
                    select: {
                      user: {
                        select: {
                          name: true,
                          image: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // Check if profile is hidden
  if (!user.profileVisible) return null;

  return user;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getProfile(params.id);

  if (!user) {
    return {
      title: 'Profiel niet gevonden',
    };
  }

  const isPro = user.role === 'PRO' && user.proProfile;
  const displayName = isPro ? user.proProfile?.companyName || user.name : user.name;

  return {
    title: `${displayName} - VakSpot`,
    description: isPro
      ? user.proProfile?.description?.slice(0, 160)
      : `Bekijk het profiel van ${displayName} op VakSpot`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const user = await getProfile(params.id);

  if (!user) {
    notFound();
  }

  const isPro = user.role === 'PRO' && user.proProfile;
  const isClient = user.role === 'CLIENT';

  // PRO Profile
  if (isPro && user.proProfile) {
    const pro = user.proProfile;

    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <Card className="mb-6">
          <div className="flex items-start gap-6">
            <Avatar
              src={user.image}
              name={pro.companyName || user.name}
              size="xl"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-surface-900">
                  {pro.companyName || user.name}
                </h1>
                {pro.verified && (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Geverifieerd
                  </Badge>
                )}
              </div>

              {pro.companyName && user.name && (
                <p className="text-surface-600 mb-3">{user.name}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-surface-600">
                {pro.avgRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-warning-500 fill-warning-500" />
                    <strong className="text-surface-900">{pro.avgRating.toFixed(1)}</strong>
                    <span>({pro.totalReviews} {pro.totalReviews === 1 ? 'beoordeling' : 'beoordelingen'})</span>
                  </span>
                )}

                {pro.locationCity && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {pro.locationCity}
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {pro.entityType === 'BUSINESS' ? 'Bedrijf' : 'ZZP\'er'}
                </span>

                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Sinds {formatDate(user.createdAt, { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {pro.description && (
            <div className="mt-6 pt-6 border-t border-surface-200">
              <h2 className="text-sm font-semibold text-surface-700 mb-2">Over</h2>
              <p className="text-surface-600 whitespace-pre-wrap">{pro.description}</p>
            </div>
          )}
        </Card>

        {/* Categories */}
        {pro.categories.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">
              <Briefcase className="inline h-5 w-5 mr-2" />
              Diensten
            </h2>
            <div className="flex flex-wrap gap-2">
              {pro.categories.map((cat) => (
                <Badge key={cat.category.slug} variant="neutral">
                  {cat.category.name}
                  {cat.yearsExp && cat.yearsExp > 0 && (
                    <span className="ml-1 text-surface-500">
                      ({cat.yearsExp} {cat.yearsExp === 1 ? 'jaar' : 'jaar'})
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Certificates */}
        {pro.certificates.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">
              <Award className="inline h-5 w-5 mr-2" />
              Certificaten
            </h2>
            <div className="space-y-3">
              {pro.certificates.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-success-50 rounded-lg"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
                    <CheckCircle2 className="h-4 w-4 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-surface-900">
                      {cert.certificateType.clientLabel || cert.certificateType.name}
                    </p>
                    <p className="text-sm text-surface-600">
                      {cert.certificateType.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Reviews */}
        {pro.reviews.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-surface-900 mb-4">
              <Star className="inline h-5 w-5 mr-2" />
              Beoordelingen ({pro.totalReviews})
            </h2>
            <div className="space-y-6">
              {pro.reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-surface-200 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4 mb-3">
                    <Avatar
                      src={review.job.client.user.image}
                      name={review.job.client.user.name}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-surface-900">
                          {review.job.client.user.name || 'Klant'}
                        </span>
                        <span className="text-sm text-surface-500">•</span>
                        <span className="text-sm text-surface-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-warning-500 fill-warning-500'
                                : 'text-surface-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-surface-500 mb-2">
                        {review.job.category.name} - {review.job.title}
                      </p>
                    </div>
                  </div>

                  {review.title && (
                    <h3 className="font-medium text-surface-900 mb-2">{review.title}</h3>
                  )}
                  <p className="text-surface-700 whitespace-pre-wrap">{review.content}</p>

                  {/* PRO Response */}
                  {review.response && (
                    <div className="mt-4 p-4 bg-surface-50 rounded-lg">
                      <p className="text-sm font-medium text-surface-900 mb-2">
                        Reactie van {pro.companyName || user.name}
                      </p>
                      <p className="text-sm text-surface-600 whitespace-pre-wrap">
                        {review.response}
                      </p>
                      {review.respondedAt && (
                        <p className="text-xs text-surface-400 mt-2">
                          {formatDate(review.respondedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // CLIENT Profile
  if (isClient) {
    const jobCount = user.clientProfile?.jobs.length || 0;

    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Card>
          <div className="flex items-start gap-6">
            <Avatar
              src={user.image}
              name={user.name}
              size="xl"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-surface-900 mb-2">
                {user.name || 'VakSpot gebruiker'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-surface-600">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Klant
                </span>

                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Lid sinds {formatDate(user.createdAt, { month: 'short', year: 'numeric' })}
                </span>

                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {jobCount} {jobCount === 1 ? 'klus' : 'klussen'} geplaatst
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback for other roles
  notFound();
}
