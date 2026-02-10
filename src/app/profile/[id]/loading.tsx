// src/app/profile/[id]/loading.tsx
import { SkeletonProfile } from '@/components/ui';

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <SkeletonProfile />
    </div>
  );
}
