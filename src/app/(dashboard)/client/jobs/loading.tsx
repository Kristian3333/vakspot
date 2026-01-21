// src/app/(dashboard)/client/jobs/loading.tsx
import { SkeletonJobCard } from '@/components/ui';

export default function JobsLoading() {
  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 w-40 bg-surface-200 rounded-lg mb-2" />
            <div className="h-4 w-64 bg-surface-200 rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-surface-200 rounded-lg animate-pulse" />
        </div>

        {/* Jobs list skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonJobCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
