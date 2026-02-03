// src/lib/job-state-machine.ts
// Job Status State Machine for Phase 7

import { JobStatus, StatusChangedBy } from '@prisma/client';
import prisma from '@/lib/prisma';

// Define valid status transitions
// Key: current status, Value: array of valid next statuses
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  // Phase 1: Job Creation
  CREATED: [
    'RESPONSES_RECEIVED', // Auto: first PRO shows interest
    'FLAGGED',            // Via report system
    'NO_MATCH',           // Timeout: no responses
    'EXPIRED',            // Inactive
    'CANCELLED_BY_CONSUMER', // Consumer cancels before any interest
  ],

  FLAGGED: [
    'CREATED',  // Unflagged after review
    'EXPIRED',  // Permanently removed
  ],

  // Phase 2: PRO Interest & Communication
  RESPONSES_RECEIVED: [
    'IN_CONVERSATION',       // Auto: first message exchanged
    'FLAGGED',               // Via report system
    'CANCELLED_BY_CONSUMER', // Consumer cancels
    'EXPIRED',               // Inactive
  ],

  IN_CONVERSATION: [
    'QUOTE_RECEIVED',        // PRO sends quote
    'SELECTED',              // Consumer selects PRO directly
    'FLAGGED',               // Via report system
    'CANCELLED_BY_CONSUMER', // Consumer cancels
  ],

  QUOTE_RECEIVED: [
    'SELECTED',              // Consumer accepts quote/PRO
    'IN_CONVERSATION',       // Quote rejected, back to conversation
    'CANCELLED_BY_CONSUMER', // Consumer cancels
  ],

  // Phase 3: Selection & Scheduling
  SELECTED: [
    'SCHEDULED',             // PRO sets start date
    'IN_PROGRESS',           // Work starts immediately (trivial jobs)
    'COMPLETED_BY_CONSUMER', // Direct completion (very quick jobs)
    'COMPLETED_BY_PRO',      // Direct completion
    'CANCELLED_BY_CONSUMER', // Consumer cancels
    'CANCELLED_BY_PRO',      // PRO cancels (reason required)
  ],

  SCHEDULED: [
    'IN_PROGRESS',           // Work starts (auto on date or manual)
    'COMPLETED_BY_CONSUMER', // Direct completion
    'COMPLETED_BY_PRO',      // Direct completion
    'CANCELLED_BY_CONSUMER', // Consumer cancels
    'CANCELLED_BY_PRO',      // PRO cancels (reason required)
  ],

  IN_PROGRESS: [
    'COMPLETED_BY_CONSUMER', // Consumer marks done
    'COMPLETED_BY_PRO',      // PRO marks done
    'CANCELLED_BY_CONSUMER', // Consumer cancels mid-work
    'CANCELLED_BY_PRO',      // PRO cancels (reason required)
  ],

  // Phase 4: Completion
  COMPLETED_BY_CONSUMER: [
    'REVIEWED', // Consumer leaves review
  ],

  COMPLETED_BY_PRO: [
    'COMPLETED_BY_CONSUMER', // Consumer confirms completion
    'REVIEWED',              // Consumer leaves review
  ],

  REVIEWED: [], // Terminal state

  // Cancellation & Expiry
  CANCELLED_BY_CONSUMER: [], // Terminal state
  CANCELLED_BY_PRO: [],      // Terminal state
  NO_MATCH: [
    'CREATED', // Reopen job
  ],
  EXPIRED: [], // Terminal state

  // Legacy statuses (mapped to new ones)
  DRAFT: ['CREATED', 'PUBLISHED'],
  PUBLISHED: ['CREATED', 'RESPONSES_RECEIVED', 'ACCEPTED'],
  ACCEPTED: ['SELECTED'],
  COMPLETED: ['COMPLETED_BY_CONSUMER', 'REVIEWED'],
};

// Status display names in Dutch
export const STATUS_LABELS: Record<JobStatus, string> = {
  CREATED: 'Actief',
  FLAGGED: 'Gemeld',
  RESPONSES_RECEIVED: 'Reacties ontvangen',
  IN_CONVERSATION: 'In gesprek',
  QUOTE_RECEIVED: 'Offerte ontvangen',
  SELECTED: 'Vakman gekozen',
  SCHEDULED: 'Ingepland',
  IN_PROGRESS: 'Bezig',
  COMPLETED_BY_CONSUMER: 'Voltooid',
  COMPLETED_BY_PRO: 'Voltooid (wacht op bevestiging)',
  REVIEWED: 'Beoordeeld',
  CANCELLED_BY_CONSUMER: 'Geannuleerd',
  CANCELLED_BY_PRO: 'Geannuleerd door vakman',
  NO_MATCH: 'Geen reacties',
  EXPIRED: 'Verlopen',
  // Legacy
  DRAFT: 'Concept',
  PUBLISHED: 'Gepubliceerd',
  ACCEPTED: 'Geaccepteerd',
  COMPLETED: 'Voltooid',
};

// Status colors for UI badges
export const STATUS_COLORS: Record<JobStatus, { bg: string; text: string }> = {
  CREATED: { bg: 'bg-brand-100', text: 'text-brand-700' },
  FLAGGED: { bg: 'bg-error-100', text: 'text-error-700' },
  RESPONSES_RECEIVED: { bg: 'bg-brand-100', text: 'text-brand-700' },
  IN_CONVERSATION: { bg: 'bg-brand-100', text: 'text-brand-700' },
  QUOTE_RECEIVED: { bg: 'bg-warning-100', text: 'text-warning-700' },
  SELECTED: { bg: 'bg-success-100', text: 'text-success-700' },
  SCHEDULED: { bg: 'bg-brand-100', text: 'text-brand-700' },
  IN_PROGRESS: { bg: 'bg-warning-100', text: 'text-warning-700' },
  COMPLETED_BY_CONSUMER: { bg: 'bg-success-100', text: 'text-success-700' },
  COMPLETED_BY_PRO: { bg: 'bg-success-100', text: 'text-success-700' },
  REVIEWED: { bg: 'bg-success-100', text: 'text-success-700' },
  CANCELLED_BY_CONSUMER: { bg: 'bg-surface-100', text: 'text-surface-700' },
  CANCELLED_BY_PRO: { bg: 'bg-surface-100', text: 'text-surface-700' },
  NO_MATCH: { bg: 'bg-surface-100', text: 'text-surface-700' },
  EXPIRED: { bg: 'bg-surface-100', text: 'text-surface-700' },
  // Legacy
  DRAFT: { bg: 'bg-surface-100', text: 'text-surface-700' },
  PUBLISHED: { bg: 'bg-brand-100', text: 'text-brand-700' },
  ACCEPTED: { bg: 'bg-success-100', text: 'text-success-700' },
  COMPLETED: { bg: 'bg-success-100', text: 'text-success-700' },
};

// Check if a transition is valid
export function isValidTransition(from: JobStatus, to: JobStatus): boolean {
  const validNextStatuses = VALID_TRANSITIONS[from] || [];
  return validNextStatuses.includes(to);
}

// Get all valid next statuses from current status
export function getValidNextStatuses(currentStatus: JobStatus): JobStatus[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

// PRO-visible statuses (what PROs can see and interact with)
export const PRO_VISIBLE_STATUSES: JobStatus[] = [
  'SELECTED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED_BY_PRO',
  'COMPLETED_BY_CONSUMER',
  'REVIEWED',
  'CANCELLED_BY_PRO',
  'CANCELLED_BY_CONSUMER',
];

// PRO action statuses (where PRO can take action)
export const PRO_ACTION_STATUSES: JobStatus[] = [
  'SELECTED',      // Can set start date
  'SCHEDULED',     // Can start work or cancel
  'IN_PROGRESS',   // Can mark complete or cancel
];

// Consumer action statuses (where consumer can take action)
export const CONSUMER_ACTION_STATUSES: JobStatus[] = [
  'CREATED',
  'RESPONSES_RECEIVED',
  'IN_CONVERSATION',
  'QUOTE_RECEIVED',
  'SELECTED',
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED_BY_PRO',
];

// Terminal statuses (no further transitions)
export const TERMINAL_STATUSES: JobStatus[] = [
  'REVIEWED',
  'CANCELLED_BY_CONSUMER',
  'CANCELLED_BY_PRO',
  'EXPIRED',
];

// Active statuses (job is in progress)
export const ACTIVE_STATUSES: JobStatus[] = [
  'CREATED',
  'RESPONSES_RECEIVED',
  'IN_CONVERSATION',
  'QUOTE_RECEIVED',
  'SELECTED',
  'SCHEDULED',
  'IN_PROGRESS',
  // Legacy
  'PUBLISHED',
  'ACCEPTED',
];

// Completed statuses
export const COMPLETED_STATUSES: JobStatus[] = [
  'COMPLETED_BY_CONSUMER',
  'COMPLETED_BY_PRO',
  'REVIEWED',
  'COMPLETED', // Legacy
];

interface TransitionOptions {
  jobId: string;
  toStatus: JobStatus;
  changedBy: StatusChangedBy;
  userId?: string;
  reason?: string;
  additionalData?: Record<string, any>;
}

interface TransitionResult {
  success: boolean;
  error?: string;
  job?: any;
}

// Execute a status transition with validation and history logging
export async function transitionJobStatus(options: TransitionOptions): Promise<TransitionResult> {
  const { jobId, toStatus, changedBy, userId, reason, additionalData } = options;

  try {
    // Get current job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!job) {
      return { success: false, error: 'Klus niet gevonden' };
    }

    const fromStatus = job.status;

    // Validate transition
    if (!isValidTransition(fromStatus, toStatus)) {
      return {
        success: false,
        error: `Ongeldige statusovergang: ${STATUS_LABELS[fromStatus]} → ${STATUS_LABELS[toStatus]}`,
      };
    }

    // Validate cancellation reason for PRO cancellations
    if (toStatus === 'CANCELLED_BY_PRO' && (!reason || reason.length < 10)) {
      return {
        success: false,
        error: 'Een reden (minimaal 10 tekens) is verplicht bij annulering',
      };
    }

    // Build update data
    const updateData: any = {
      status: toStatus,
      statusChangedBy: changedBy,
      statusChangedAt: new Date(),
      ...additionalData,
    };

    // Set specific timestamps based on status
    if (toStatus === 'IN_PROGRESS') {
      updateData.startedAt = new Date();
    } else if (toStatus === 'COMPLETED_BY_PRO') {
      updateData.completedAtByPro = new Date();
    } else if (toStatus === 'COMPLETED_BY_CONSUMER') {
      updateData.completedAtByCons = new Date();
      updateData.completedAt = new Date(); // Legacy field
    } else if (toStatus === 'CANCELLED_BY_CONSUMER' || toStatus === 'CANCELLED_BY_PRO') {
      updateData.cancelledAt = new Date();
      if (reason) {
        updateData.cancellationReason = reason;
      }
    }

    // Execute transition with history logging in a transaction
    const updatedJob = await prisma.$transaction(async (tx) => {
      // Update job status
      const updated = await tx.job.update({
        where: { id: jobId },
        data: updateData,
      });

      // Log status change to history
      await tx.statusHistory.create({
        data: {
          jobId,
          fromStatus,
          toStatus,
          changedBy,
          userId,
          reason,
        },
      });

      return updated;
    });

    return { success: true, job: updatedJob };
  } catch (error) {
    console.error('Status transition error:', error);
    return { success: false, error: 'Er ging iets mis bij het bijwerken van de status' };
  }
}

// Map legacy statuses to new ones
export function mapLegacyStatus(status: JobStatus): JobStatus {
  switch (status) {
    case 'DRAFT':
      return 'CREATED';
    case 'PUBLISHED':
      return 'CREATED';
    case 'ACCEPTED':
      return 'SELECTED';
    case 'COMPLETED':
      return 'COMPLETED_BY_CONSUMER';
    default:
      return status;
  }
}

// Check if job can be reviewed
export function canBeReviewed(status: JobStatus): boolean {
  return status === 'COMPLETED_BY_CONSUMER' || status === 'COMPLETED_BY_PRO';
}

// Check if job is active (not completed, cancelled, or expired)
export function isActiveJob(status: JobStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

// Check if job is completed
export function isCompletedJob(status: JobStatus): boolean {
  return COMPLETED_STATUSES.includes(status);
}

// Get the PRO's step in the 4-step flow (1-4 or 0 if not applicable)
export function getProFlowStep(status: JobStatus): number {
  switch (status) {
    case 'SELECTED':
      return 1; // Selected - set start date
    case 'SCHEDULED':
      return 2; // Scheduled - wait for start
    case 'IN_PROGRESS':
      return 3; // In Progress - working
    case 'COMPLETED_BY_PRO':
    case 'COMPLETED_BY_CONSUMER':
    case 'REVIEWED':
      return 4; // Completed
    default:
      return 0;
  }
}
