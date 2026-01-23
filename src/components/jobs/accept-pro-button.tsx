// src/components/jobs/accept-pro-button.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface AcceptProButtonProps {
  bidId: string;
  proName: string;
  jobTitle: string;
}

export function AcceptProButton({ bidId, proName, jobTitle }: AcceptProButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/bids/${bidId}/accept`, {
        method: 'POST',
      });

      if (!response.ok && !response.redirected) {
        const data = await response.json();
        throw new Error(data.error || 'Accepteren mislukt');
      }

      // Refresh the page to show updated status
      router.refresh();
      setShowConfirm(false);
    } catch (err: any) {
      setError(err.message);
      setIsAccepting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="p-4 rounded-xl border border-success-200 bg-success-50">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-success-100">
            <CheckCircle2 className="h-5 w-5 text-success-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-surface-900">{proName} kiezen?</h3>
            <p className="mt-1 text-sm text-surface-600">
              Weet u zeker dat u deze vakman wilt kiezen voor "{jobTitle}"? 
              Andere geïnteresseerden worden automatisch afgewezen.
            </p>
            {error && (
              <p className="mt-2 text-sm text-error-600">{error}</p>
            )}
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isAccepting}
              >
                Annuleren
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                isLoading={isAccepting}
                className="bg-success-600 hover:bg-success-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Bevestig keuze
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="bg-success-600 hover:bg-success-700"
    >
      <CheckCircle2 className="h-4 w-4 mr-2" />
      Kies deze vakman
    </Button>
  );
}
