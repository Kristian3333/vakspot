// src/app/(dashboard)/messages/[id]/loading.tsx
import { Card } from '@/components/ui';

export default function ConversationLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-5 w-32 bg-surface-200 rounded mb-4" />

      <div className="space-y-4">
        {/* Job Summary Card */}
        <Card className="border-brand-100">
          <div className="flex gap-4">
            <div className="h-20 w-20 flex-shrink-0 bg-surface-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-5 w-24 bg-surface-200 rounded mb-2" />
              <div className="h-6 w-48 bg-surface-200 rounded mb-2" />
              <div className="flex gap-4">
                <div className="h-4 w-24 bg-surface-200 rounded" />
                <div className="h-4 w-24 bg-surface-200 rounded" />
                <div className="h-4 w-32 bg-surface-200 rounded" />
              </div>
            </div>
          </div>
        </Card>

        {/* Bid Details Card */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 bg-surface-200 rounded-full" />
              <div>
                <div className="h-5 w-40 bg-surface-200 rounded mb-2" />
                <div className="h-4 w-24 bg-surface-200 rounded mb-2" />
                <div className="h-4 w-32 bg-surface-200 rounded" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-8 w-24 bg-surface-200 rounded mb-2" />
              <div className="h-4 w-20 bg-surface-200 rounded" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-surface-200">
            <div className="h-4 w-full bg-surface-200 rounded mb-2" />
            <div className="h-4 w-3/4 bg-surface-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-surface-200 rounded" />
          </div>
        </Card>

        {/* Messages Card */}
        <Card className="p-0">
          <div className="p-4 border-b border-surface-200">
            <div className="h-5 w-24 bg-surface-200 rounded mb-2" />
            <div className="h-4 w-48 bg-surface-200 rounded" />
          </div>
          <div className="h-96 p-4 space-y-4">
            {/* Message skeletons */}
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-surface-200 rounded-full flex-shrink-0" />
              <div className="h-16 w-48 bg-surface-200 rounded-2xl rounded-bl-md" />
            </div>
            <div className="flex gap-2 flex-row-reverse">
              <div className="h-8 w-8 bg-surface-200 rounded-full flex-shrink-0" />
              <div className="h-12 w-40 bg-surface-200 rounded-2xl rounded-br-md" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-surface-200 rounded-full flex-shrink-0" />
              <div className="h-20 w-56 bg-surface-200 rounded-2xl rounded-bl-md" />
            </div>
          </div>
          <div className="p-4 border-t border-surface-200">
            <div className="flex gap-2">
              <div className="h-10 w-10 bg-surface-200 rounded-lg" />
              <div className="flex-1 h-10 bg-surface-200 rounded-lg" />
              <div className="h-10 w-10 bg-surface-200 rounded-lg" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
