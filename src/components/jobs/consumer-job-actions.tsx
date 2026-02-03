// src/components/jobs/consumer-job-actions.tsx
// Consumer Actions UI for Phase 7
'use client';

import { useState } from 'react';
import { CheckCircle, X, AlertTriangle, Star } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { JobStatus } from '@prisma/client';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  CONSUMER_ACTION_STATUSES,
  getProFlowStep,
} from '@/lib/job-state-machine';
import Link from 'next/link';

interface ConsumerJobActionsProps {
  jobId: string;
  jobTitle: string;
  currentStatus: JobStatus;
  hasReview?: boolean;
  onStatusChange?: () => void;
}

export function ConsumerJobActions({
  jobId,
  jobTitle,
  currentStatus,
  hasReview = false,
  onStatusChange,
}: ConsumerJobActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const canTakeAction = CONSUMER_ACTION_STATUSES.includes(currentStatus);
  const proFlowStep = getProFlowStep(currentStatus);
  const statusColor = STATUS_COLORS[currentStatus];

  const handleMarkComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStatus: 'COMPLETED_BY_CONSUMER' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowCompleteModal(false);
      onStatusChange?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStatus: 'CANCELLED_BY_CONSUMER' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowCancelModal(false);
      onStatusChange?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show status badge
  const StatusBadge = () => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
      {STATUS_LABELS[currentStatus]}
    </span>
  );

  // Show PRO progress if in PRO flow
  const ProProgressIndicator = () => {
    if (proFlowStep === 0) return null;

    const steps = ['Gekozen', 'Ingepland', 'Bezig', 'Voltooid'];
    return (
      <div className="mt-4">
        <p className="text-sm text-surface-500 mb-2">Voortgang vakman:</p>
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isComplete = proFlowStep > stepNum;
            const isCurrent = proFlowStep === stepNum;
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isComplete
                      ? 'bg-success-500 text-white'
                      : isCurrent
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-200 text-surface-500'
                  }`}
                >
                  {isComplete ? '✓' : stepNum}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      proFlowStep > stepNum ? 'bg-success-500' : 'bg-surface-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-surface-400 mt-1">
          {steps.map((step) => (
            <span key={step} className="w-6 text-center">{step.charAt(0)}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-surface-900">Status</h3>
        <StatusBadge />
      </div>

      <ProProgressIndicator />

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error-50 border border-error-200">
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      {/* Actions based on current status */}
      {canTakeAction && (
        <div className="mt-4 pt-4 border-t border-surface-200 space-y-3">
          {/* Waiting for PRO to complete */}
          {currentStatus === 'COMPLETED_BY_PRO' && (
            <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
              <p className="text-sm text-brand-700">
                De vakman heeft de klus als voltooid gemarkeerd. Bevestig dat het werk naar tevredenheid is afgerond.
              </p>
            </div>
          )}

          {/* Complete button - available when PRO completed or job is in progress */}
          {(currentStatus === 'COMPLETED_BY_PRO' ||
            currentStatus === 'IN_PROGRESS' ||
            currentStatus === 'SCHEDULED' ||
            currentStatus === 'SELECTED') && (
            <Button
              onClick={() => setShowCompleteModal(true)}
              leftIcon={<CheckCircle className="w-4 h-4" />}
              className="w-full"
            >
              Markeer als voltooid
            </Button>
          )}

          {/* Review prompt after completion */}
          {(currentStatus === 'COMPLETED_BY_CONSUMER' || currentStatus === 'COMPLETED_BY_PRO') && !hasReview && (
            <Link href={`/client/jobs/${jobId}/review`}>
              <Button
                variant="outline"
                leftIcon={<Star className="w-4 h-4" />}
                className="w-full"
              >
                Laat een review achter
              </Button>
            </Link>
          )}

          {/* Cancel button - available before completion */}
          {(currentStatus === 'SELECTED' ||
            currentStatus === 'SCHEDULED' ||
            currentStatus === 'IN_PROGRESS' ||
            currentStatus === 'IN_CONVERSATION' ||
            currentStatus === 'QUOTE_RECEIVED' ||
            currentStatus === 'RESPONSES_RECEIVED' ||
            currentStatus === 'CREATED') && (
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="w-full text-error-600 hover:bg-error-50"
            >
              Klus annuleren
            </Button>
          )}
        </div>
      )}

      {/* Completed state */}
      {currentStatus === 'REVIEWED' && (
        <div className="mt-4 pt-4 border-t border-surface-200">
          <div className="flex items-center gap-2 text-success-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Klus afgerond en beoordeeld!</span>
          </div>
        </div>
      )}

      {/* Cancelled state */}
      {(currentStatus === 'CANCELLED_BY_CONSUMER' || currentStatus === 'CANCELLED_BY_PRO') && (
        <div className="mt-4 pt-4 border-t border-surface-200">
          <div className="flex items-center gap-2 text-surface-500">
            <X className="w-5 h-5" />
            <span className="font-medium">
              {currentStatus === 'CANCELLED_BY_CONSUMER'
                ? 'U heeft deze klus geannuleerd'
                : 'De vakman heeft deze klus geannuleerd'}
            </span>
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCompleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-success-100">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900">Klus voltooien</h3>
            </div>

            <p className="text-surface-600 mb-6">
              Bevestig dat "{jobTitle}" naar tevredenheid is afgerond. Na bevestiging kunt u een review achterlaten.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={handleMarkComplete}
                isLoading={isLoading}
                className="flex-1"
              >
                Bevestigen
              </Button>
              <Button variant="outline" onClick={() => setShowCompleteModal(false)} className="flex-1">
                Annuleren
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-error-100">
                <AlertTriangle className="w-6 h-6 text-error-600" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900">Klus annuleren</h3>
            </div>

            <p className="text-surface-600 mb-6">
              Weet u zeker dat u "{jobTitle}" wilt annuleren? Dit kan niet ongedaan worden gemaakt.
            </p>

            {error && (
              <p className="text-sm text-error-600 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleCancel}
                isLoading={isLoading}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1">
                Terug
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
