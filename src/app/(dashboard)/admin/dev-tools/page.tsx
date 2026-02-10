// src/app/(dashboard)/admin/dev-tools/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Card } from '@/components/ui';
import { DevToolsClient } from './dev-tools-client';

export const metadata = {
  title: 'Dev Tools',
  description: 'Development tools for testing and debugging',
};

export default async function DevToolsPage() {
  const session = await auth();

  // Require admin role
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/admin');
  }

  // Only available in development mode
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-error-600 mb-4">
            Dev Tools Not Available
          </h1>
          <p className="text-surface-600">
            Development tools are only available in development mode.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-surface-900">Development Tools</h1>
        <p className="text-surface-600 mt-2">
          Testing utilities for simulating user flows and generating test data
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-warning-100 text-warning-800 px-4 py-2 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></span>
          Development Mode Only
        </div>
      </div>

      {/* Client Component with all interactive features */}
      <DevToolsClient />
    </div>
  );
}
