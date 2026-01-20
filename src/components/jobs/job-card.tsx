// src/components/jobs/job-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge, StatusBadge } from '@/components/ui';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { MapPin, Clock, MessageSquare } from 'lucide-react';
import type { JobListItem, JOB_STATUS_CONFIG, TIMELINE_CONFIG } from '@/types';

interface JobCardProps {
  job: JobListItem;
  href: string;
  showBidCount?: boolean;
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

export function JobCard({ job, href, showBidCount = true }: JobCardProps) {
  const hasImage = job.images && job.images.length > 0;

  return (
    <Link href={href}>
      <Card hover className="h-full">
        {/* Image */}
        {hasImage && (
          <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl">
            <Image
              src={job.images[0].url}
              alt={job.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          {/* Category & Status */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="primary">{job.category.name}</Badge>
            <StatusBadge variant={statusColors[job.status]}>
              {statusLabels[job.status]}
            </StatusBadge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-surface-900 line-clamp-2">
            {job.title}
          </h3>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-surface-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.locationCity}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {timelineLabels[job.timeline]}
            </span>
            {showBidCount && job._count && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {job._count.bids} {job._count.bids === 1 ? 'offerte' : 'offertes'}
              </span>
            )}
          </div>

          {/* Budget */}
          {(job.budgetMin || job.budgetMax) && (
            <div className="text-sm">
              <span className="text-surface-500">Budget: </span>
              <span className="font-medium text-surface-900">
                {job.budgetMin && job.budgetMax
                  ? `${formatCurrency(job.budgetMin)} - ${formatCurrency(job.budgetMax)}`
                  : job.budgetMax
                  ? `Tot ${formatCurrency(job.budgetMax)}`
                  : `Vanaf ${formatCurrency(job.budgetMin!)}`}
              </span>
            </div>
          )}

          {/* Posted time */}
          <p className="text-xs text-surface-400">
            {formatRelativeTime(job.createdAt)}
          </p>
        </div>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function JobCardSkeleton() {
  return (
    <Card>
      <div className="animate-pulse space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-20 bg-surface-200 rounded-full" />
          <div className="h-5 w-24 bg-surface-200 rounded-full" />
        </div>
        <div className="h-6 w-3/4 bg-surface-200 rounded" />
        <div className="flex gap-3">
          <div className="h-4 w-24 bg-surface-200 rounded" />
          <div className="h-4 w-20 bg-surface-200 rounded" />
        </div>
        <div className="h-4 w-32 bg-surface-200 rounded" />
      </div>
    </Card>
  );
}
