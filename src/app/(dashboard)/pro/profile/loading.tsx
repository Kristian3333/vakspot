// src/app/(dashboard)/pro/profile/loading.tsx
import { SkeletonProfile } from '@/components/ui';

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-36 bg-surface-200 rounded-lg animate-pulse" />
          <div className="h-10 w-28 bg-surface-200 rounded-lg animate-pulse" />
        </div>

        <SkeletonProfile />
      </div>
    </div>
  );
}
