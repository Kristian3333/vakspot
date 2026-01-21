// src/app/(dashboard)/pro/leads/loading.tsx
import { SkeletonJobCard } from '@/components/ui';

export default function LeadsLoading() {
  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-surface-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-72 bg-surface-200 rounded-lg animate-pulse" />
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-4 mb-6">
          <div className="h-10 w-40 bg-surface-200 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-surface-200 rounded-lg animate-pulse" />
          <div className="h-10 w-36 bg-surface-200 rounded-lg animate-pulse" />
        </div>

        {/* Leads list skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonJobCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
