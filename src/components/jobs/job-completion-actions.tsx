// src/components/jobs/job-completion-actions.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { JobStatus } from '@prisma/client';
import { Button, Card } from '@/components/ui';
import { CheckCircle2, Star } from 'lucide-react';

interface JobCompletionActionsProps {
  jobId: string;
  status: JobStatus;
  acceptedProId?: string;
  hasReview: boolean;
}

export function JobCompletionActions({
  jobId,
  status,
  acceptedProId,
  hasReview,
}: JobCompletionActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  // Don't show anything if no PRO is accepted
  if (!acceptedProId) {
    return null;
  }

  // Determine if we should show completion button
  const showCompletionButton =
    status === JobStatus.IN_PROGRESS ||
    status === JobStatus.SCHEDULED ||
    status === JobStatus.COMPLETED_BY_PRO;

  // Determine if we should show review prompt
  // Only show review prompt if consumer has confirmed completion (not just PRO)
  const canReview =
    (status === JobStatus.COMPLETED_BY_CONSUMER ||
     status === JobStatus.COMPLETED) &&
    !hasReview;

  const handleMarkComplete = async () => {
    const confirmMessage =
      status === JobStatus.COMPLETED_BY_PRO
        ? 'Weet u zeker dat u de voltooiing wilt bevestigen?'
        : 'Weet u zeker dat het werk is voltooid?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED_BY_CONSUMER',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Er ging iets mis');
      }

      // Show review prompt after successful completion
      setShowReviewPrompt(true);
      setIsSubmitting(false);

      // Reload page after a short delay to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis');
      setIsSubmitting(false);
    }
  };

  // Show review prompt after completion (priority if set via state)
  if (showReviewPrompt || canReview) {
    return (
      <Card className="border-success-200 bg-success-50/30">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100">
            <Star className="h-5 w-5 text-success-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-surface-900 mb-1">
              Laat een beoordeling achter
            </h3>
            <p className="text-sm text-surface-600 mb-3">
              Help andere klanten door uw ervaring te delen met deze vakman.
            </p>
            <Link href={`/client/jobs/${jobId}/review`}>
              <Button size="sm">
                <Star className="h-4 w-4 mr-2" />
                Laat een beoordeling achter
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Show completion button
  if (showCompletionButton) {
    const buttonText =
      status === JobStatus.COMPLETED_BY_PRO
        ? 'Bevestig voltooiing'
        : 'Markeer als voltooid';

    return (
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
            <CheckCircle2 className="h-5 w-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-surface-900 mb-1">
              {status === JobStatus.COMPLETED_BY_PRO
                ? 'Vakman heeft werk voltooid'
                : 'Werk voltooid?'}
            </h3>
            <p className="text-sm text-surface-600 mb-3">
              {status === JobStatus.COMPLETED_BY_PRO
                ? 'Bevestig dat het werk naar tevredenheid is uitgevoerd.'
                : 'Markeer deze klus als voltooid wanneer het werk klaar is.'}
            </p>
            {error && (
              <div className="mb-3 p-2 bg-error-50 border border-error-200 rounded text-sm text-error-700">
                {error}
              </div>
            )}
            <Button
              onClick={handleMarkComplete}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {buttonText}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
