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
  const [success, setSuccess] = useState<{ rejectedCount: number } | null>(null);

  const handleAccept = async () => {
    setIsAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/bids/${bidId}/accept`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Accepteren mislukt');
      }

      // Show success briefly, then refresh
      setSuccess({ rejectedCount: data.rejectedCount || 0 });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setIsAccepting(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 rounded-xl border border-success-200 bg-success-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-success-100">
            <CheckCircle2 className="h-5 w-5 text-success-600" />
          </div>
          <div>
            <h3 className="font-semibold text-success-800">{proName} gekozen!</h3>
            <p className="text-sm text-success-700">
              {success.rejectedCount > 0 
                ? `${success.rejectedCount} andere vakman${success.rejectedCount > 1 ? 'nen' : ''} automatisch afgewezen.`
                : 'De vakman ontvangt nu bericht.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              Andere geïnteresseerden worden automatisch afgewezen en ontvangen hierover bericht.
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
