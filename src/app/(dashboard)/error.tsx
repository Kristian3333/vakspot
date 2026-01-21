// src/app/(dashboard)/error.tsx
'use client';

import { useEffect } from 'react';
import { Button, Card } from '@/components/ui';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-error-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-error-500" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-surface-900 mb-2">
          Er is iets misgegaan
        </h2>
        
        <p className="text-surface-600 mb-6">
          We konden deze pagina niet laden. Probeer het opnieuw of ga terug naar de homepage.
        </p>

        {error.digest && (
          <p className="text-xs text-surface-400 mb-4 font-mono">
            Foutcode: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Opnieuw proberen
          </Button>
          <Link href="/">
            <Button variant="outline" leftIcon={<Home className="h-4 w-4" />}>
              Homepage
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
