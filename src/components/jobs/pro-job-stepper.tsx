// src/components/jobs/pro-job-stepper.tsx
// PRO 4-Step Flow UI for Phase 7
'use client';

import { useState } from 'react';
import { Check, Calendar, Play, CheckCircle, X, Loader2 } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { JobStatus } from '@prisma/client';
import {
  getProFlowStep,
  STATUS_LABELS,
  PRO_ACTION_STATUSES,
} from '@/lib/job-state-machine';

interface ProJobStepperProps {
  jobId: string;
  jobTitle: string;
  currentStatus: JobStatus;
  scheduledDate?: Date | null;
  onStatusChange?: () => void;
}

const STEPS = [
  { id: 1, name: 'Gekozen', description: 'Plan een startdatum', icon: Check },
  { id: 2, name: 'Ingepland', description: 'Klaar om te beginnen', icon: Calendar },
  { id: 3, name: 'Bezig', description: 'Werk in uitvoering', icon: Play },
  { id: 4, name: 'Voltooid', description: 'Klus afgerond', icon: CheckCircle },
];

export function ProJobStepper({
  jobId,
  jobTitle,
  currentStatus,
  scheduledDate,
  onStatusChange,
}: ProJobStepperProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const currentStep = getProFlowStep(currentStatus);
  const canTakeAction = PRO_ACTION_STATUSES.includes(currentStatus);

  const handleSetStartDate = async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStatus: 'SCHEDULED',
          startDate: selectedDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowDatePicker(false);
      onStatusChange?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWork = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStatus: 'IN_PROGRESS' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onStatusChange?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toStatus: 'COMPLETED_BY_PRO' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onStatusChange?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (cancelReason.length < 10) {
      setError('Voer een reden in (minimaal 10 tekens)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStatus: 'CANCELLED_BY_PRO',
          reason: cancelReason,
        }),
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

  // Don't show stepper for non-PRO-flow statuses
  if (currentStep === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <h3 className="font-semibold text-surface-900 mb-4">Voortgang</h3>

      {/* Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${isCompleted ? 'bg-success-500 border-success-500 text-white' : ''}
                    ${isCurrent ? 'bg-brand-500 border-brand-500 text-white' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-white border-surface-300 text-surface-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-brand-600' : isCompleted ? 'text-success-600' : 'text-surface-500'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-surface-400 hidden sm:block">{step.description}</p>
                </div>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 -z-10 ${
                      currentStep > step.id ? 'bg-success-500' : 'bg-surface-200'
                    }`}
                    style={{ width: 'calc(100vw / 4 - 40px)', maxWidth: '120px' }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress line background */}
        <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-surface-200 -z-20" />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error-50 border border-error-200">
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      {/* Actions based on current step */}
      {canTakeAction && (
        <div className="mt-6 pt-4 border-t border-surface-200">
          {/* Step 1: Set start date */}
          {currentStatus === 'SELECTED' && (
            <>
              {showDatePicker ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-surface-700">
                    Wanneer kunt u beginnen?
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSetStartDate}
                      disabled={!selectedDate || isLoading}
                      isLoading={isLoading}
                    >
                      Bevestigen
                    </Button>
                    <Button variant="outline" onClick={() => setShowDatePicker(false)}>
                      Annuleren
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setShowDatePicker(true)} leftIcon={<Calendar className="w-4 h-4" />}>
                    Startdatum instellen
                  </Button>
                  <Button variant="outline" className="text-error-600" onClick={() => setShowCancelModal(true)}>
                    Annuleren
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Step 2: Start work */}
          {currentStatus === 'SCHEDULED' && (
            <div className="space-y-3">
              {scheduledDate && (
                <p className="text-sm text-surface-600">
                  Startdatum: <strong>{new Date(scheduledDate).toLocaleDateString('nl-NL')}</strong>
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleStartWork}
                  isLoading={isLoading}
                  leftIcon={<Play className="w-4 h-4" />}
                >
                  Start werk
                </Button>
                <Button variant="outline" className="text-error-600" onClick={() => setShowCancelModal(true)}>
                  Annuleren
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Mark complete */}
          {currentStatus === 'IN_PROGRESS' && (
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleMarkComplete}
                isLoading={isLoading}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Markeer als voltooid
              </Button>
              <Button variant="outline" className="text-error-600" onClick={() => setShowCancelModal(true)}>
                Annuleren
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Completed */}
      {currentStep === 4 && (
        <div className="mt-6 pt-4 border-t border-surface-200">
          <div className="flex items-center gap-2 text-success-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Klus voltooid!</span>
          </div>
          {currentStatus === 'COMPLETED_BY_PRO' && (
            <p className="text-sm text-surface-500 mt-1">
              Wacht op bevestiging van de opdrachtgever.
            </p>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900">Klus annuleren</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 rounded-lg hover:bg-surface-100"
              >
                <X className="w-5 h-5 text-surface-400" />
              </button>
            </div>

            <p className="text-surface-600 mb-4">
              Weet u zeker dat u "{jobTitle}" wilt annuleren? Leg uit waarom u moet annuleren.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reden voor annulering (minimaal 10 tekens)..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none mb-4"
            />

            {error && (
              <p className="text-sm text-error-600 mb-4">{error}</p>
            )}

            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleCancel}
                isLoading={isLoading}
                disabled={cancelReason.length < 10}
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
