// src/components/bids/bid-actions.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Check, X, MessageSquare, Loader2 } from 'lucide-react';

interface BidActionsProps {
  bidId: string;
  jobId: string;
  canAccept: boolean;
}

export function BidActions({ bidId, jobId, canAccept }: BidActionsProps) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!canAccept) return;
    
    setIsAccepting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bids/${bidId}/accept`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.redirected) {
        router.push(response.url);
        router.refresh();
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Er is iets misgegaan');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!canAccept) return;
    
    if (!confirm('Weet u zeker dat u deze offerte wilt afwijzen?')) {
      return;
    }
    
    setIsRejecting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/bids/${bidId}/reject`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.redirected) {
        router.push(response.url);
        router.refresh();
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Er is iets misgegaan');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
    } finally {
      setIsRejecting(false);
    }
  };

  if (!canAccept) {
    return null;
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleAccept}
          disabled={isAccepting || isRejecting}
          leftIcon={isAccepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        >
          Accepteren
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={isAccepting || isRejecting}
          leftIcon={isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          className="text-error-600 border-error-300 hover:bg-error-50"
        >
          Afwijzen
        </Button>
        <Link href={`/messages?bid=${bidId}`}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<MessageSquare className="h-4 w-4" />}
          >
            Bericht
          </Button>
        </Link>
      </div>
    </div>
  );
}
