// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="nl">
      <body className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-surface-200 p-8 shadow-soft">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-error-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-error-500" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-surface-900 mb-2">
            Er is een fout opgetreden
          </h2>
          
          <p className="text-surface-600 mb-6">
            Er is een onverwachte fout opgetreden. Onze excuses voor het ongemak.
          </p>

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
        </div>
      </body>
    </html>
  );
}
