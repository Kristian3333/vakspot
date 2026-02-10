// src/components/jobs/status-flow-tracker.tsx
import { JobStatus } from '@prisma/client';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { STATUS_LABELS } from '@/lib/job-state-machine';

interface StatusFlowTrackerProps {
  job: {
    id: string;
    status: JobStatus;
    statusChangedAt?: Date | null;
    statusHistory?: Array<{
      id: string;
      jobId: string;
      fromStatus: JobStatus;
      toStatus: JobStatus;
      changedBy: string;
      changedAt: Date;
      reason?: string | null;
      userId?: string | null;
    }>;
  };
  viewMode: 'pro' | 'client';
}

interface FlowStep {
  status: JobStatus;
  label: string;
  order: number;
}

// PRO 4-step flow
const PRO_FLOW_STEPS: FlowStep[] = [
  { status: JobStatus.SELECTED, label: 'Gekozen', order: 1 },
  { status: JobStatus.SCHEDULED, label: 'Ingepland', order: 2 },
  { status: JobStatus.IN_PROGRESS, label: 'Bezig', order: 3 },
  { status: JobStatus.COMPLETED_BY_PRO, label: 'Voltooid', order: 4 },
];

// Client full flow
const CLIENT_FLOW_STEPS: FlowStep[] = [
  { status: JobStatus.CREATED, label: 'Actief', order: 1 },
  { status: JobStatus.RESPONSES_RECEIVED, label: 'Reacties', order: 2 },
  { status: JobStatus.IN_CONVERSATION, label: 'Gesprek', order: 3 },
  { status: JobStatus.SELECTED, label: 'Gekozen', order: 4 },
  { status: JobStatus.SCHEDULED, label: 'Ingepland', order: 5 },
  { status: JobStatus.IN_PROGRESS, label: 'Bezig', order: 6 },
  { status: JobStatus.COMPLETED_BY_CONSUMER, label: 'Voltooid', order: 7 },
  { status: JobStatus.REVIEWED, label: 'Beoordeeld', order: 8 },
];

// Terminal states (branches from main flow)
const TERMINAL_STATUSES: JobStatus[] = [
  JobStatus.CANCELLED_BY_CONSUMER,
  JobStatus.CANCELLED_BY_PRO,
  JobStatus.EXPIRED,
  JobStatus.NO_MATCH,
];

export function StatusFlowTracker({ job, viewMode }: StatusFlowTrackerProps) {
  const flowSteps = viewMode === 'pro' ? PRO_FLOW_STEPS : CLIENT_FLOW_STEPS;
  const currentStatus = job.status;
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus as JobStatus);

  // Get timestamp for a specific status from history
  const getTimestampForStatus = (status: JobStatus): Date | null => {
    if (!job.statusHistory) return null;

    const historyEntry = job.statusHistory.find((h) => h.toStatus === status);
    return historyEntry ? historyEntry.changedAt : null;
  };

  // Determine if a step is completed, current, or pending
  const getStepState = (step: FlowStep): 'completed' | 'current' | 'pending' => {
    // Check if current status matches this step
    if (currentStatus === step.status) return 'current';

    // Check if this step was completed (exists in history or is before current step)
    const currentStepIndex = flowSteps.findIndex((s) => s.status === currentStatus);
    if (currentStepIndex === -1) {
      // Current status not in main flow (might be terminal)
      const timestamp = getTimestampForStatus(step.status);
      return timestamp ? 'completed' : 'pending';
    }

    // If this step comes before current step, it's completed
    return step.order < flowSteps[currentStepIndex].order ? 'completed' : 'pending';
  };

  // Adjust flow steps for completion states
  const getAdjustedFlowSteps = (): FlowStep[] => {
    if (viewMode === 'client') {
      // For client view, if status is COMPLETED_BY_PRO or REVIEWED, show both COMPLETED and REVIEWED
      if (currentStatus === JobStatus.COMPLETED_BY_PRO || currentStatus === JobStatus.REVIEWED) {
        return flowSteps;
      }
    }
    return flowSteps;
  };

  const adjustedSteps = getAdjustedFlowSteps();

  return (
    <div data-testid="status-flow" data-view={viewMode} className="py-6">
      {/* Main flow */}
      <div className="flex items-center justify-between">
        {adjustedSteps.map((step, index) => {
          const state = getStepState(step);
          const timestamp = getTimestampForStatus(step.status);
          const isLast = index === adjustedSteps.length - 1;

          return (
            <div key={step.status} className="flex items-center flex-1">
              {/* Step */}
              <div
                data-step={step.order}
                data-status={step.status}
                data-completed={state === 'completed' ? 'true' : 'false'}
                data-current={state === 'current' ? 'true' : 'false'}
                data-timestamp={timestamp ? timestamp.toISOString().split('T')[0] : undefined}
                className="flex flex-col items-center"
              >
                {/* Icon */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    state === 'completed'
                      ? 'bg-success-100 border-success-500'
                      : state === 'current'
                      ? 'bg-brand-100 border-brand-500'
                      : 'bg-surface-100 border-surface-300'
                  }`}
                >
                  {state === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-success-600" />
                  ) : (
                    <Circle className={`h-4 w-4 ${state === 'current' ? 'text-brand-600' : 'text-surface-400'}`} />
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      state === 'current' ? 'text-brand-700' : state === 'completed' ? 'text-surface-900' : 'text-surface-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  {timestamp && state !== 'pending' && (
                    <p className="text-xs text-surface-400 mt-1">
                      {new Date(timestamp).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  data-connector="true"
                  className={`flex-1 h-0.5 mx-2 ${
                    state === 'completed' ? 'bg-success-500' : 'bg-surface-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Terminal state (if applicable) */}
      {isTerminal && (
        <div className="mt-6 flex items-center justify-center">
          <div
            data-step="terminal"
            data-status={currentStatus}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-100 border border-surface-300"
          >
            <XCircle className="h-4 w-4 text-surface-600" />
            <span className="text-sm font-medium text-surface-700">
              {STATUS_LABELS[currentStatus]}
            </span>
            {job.statusChangedAt && (
              <span className="text-xs text-surface-500">
                • {new Date(job.statusChangedAt).toLocaleDateString('nl-NL')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
