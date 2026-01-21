// src/app/(dashboard)/messages/loading.tsx
import { SkeletonMessageList, SkeletonAvatar, Skeleton } from '@/components/ui';

export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-36 bg-surface-200 rounded-lg animate-pulse" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversations list */}
          <div className="lg:col-span-1 rounded-2xl border border-surface-200 bg-white p-4">
            <div className="h-5 w-32 bg-surface-200 rounded-lg animate-pulse mb-4" />
            <SkeletonMessageList />
          </div>

          {/* Message area */}
          <div className="lg:col-span-2 rounded-2xl border border-surface-200 bg-white">
            {/* Header */}
            <div className="p-4 border-b border-surface-200 flex items-center gap-3">
              <SkeletonAvatar size="md" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-4 min-h-[400px]">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                >
                  <Skeleton
                    className={`h-16 rounded-2xl ${
                      i % 2 === 0 ? 'w-2/3' : 'w-1/2'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-surface-200">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
