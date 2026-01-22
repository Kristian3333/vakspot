// src/app/(dashboard)/pro/jobs/loading.tsx
import { Card, Spinner } from '@/components/ui';

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-surface-200 rounded animate-pulse" />
        <div className="h-5 w-32 bg-surface-100 rounded animate-pulse mt-2" />
      </div>
      
      <div className="mb-6">
        <div className="h-10 w-64 bg-surface-100 rounded-lg animate-pulse" />
      </div>

      <div className="flex flex-col items-center py-12">
        <Spinner size="lg" />
        <p className="mt-4 text-surface-500">Laden...</p>
      </div>
    </div>
  );
}
