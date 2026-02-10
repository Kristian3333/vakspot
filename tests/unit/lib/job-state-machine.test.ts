// tests/unit/lib/job-state-machine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobStatus, StatusChangedBy } from '@prisma/client';
import {
  isValidTransition,
  getValidNextStatuses,
  transitionJobStatus,
  mapLegacyStatus,
  canBeReviewed,
  isActiveJob,
  isCompletedJob,
  getProFlowStep,
  STATUS_LABELS,
  STATUS_COLORS,
  PRO_VISIBLE_STATUSES,
  PRO_ACTION_STATUSES,
  CONSUMER_ACTION_STATUSES,
  TERMINAL_STATUSES,
  ACTIVE_STATUSES,
  COMPLETED_STATUSES,
} from '@/lib/job-state-machine';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    job: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    statusHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import prisma from '@/lib/prisma';

describe('job-state-machine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidTransition', () => {
    it('should allow valid transitions from CREATED', () => {
      expect(isValidTransition('CREATED', 'RESPONSES_RECEIVED')).toBe(true);
      expect(isValidTransition('CREATED', 'FLAGGED')).toBe(true);
      expect(isValidTransition('CREATED', 'NO_MATCH')).toBe(true);
      expect(isValidTransition('CREATED', 'EXPIRED')).toBe(true);
      expect(isValidTransition('CREATED', 'CANCELLED_BY_CONSUMER')).toBe(true);
    });

    it('should reject invalid transitions from CREATED', () => {
      expect(isValidTransition('CREATED', 'COMPLETED_BY_CONSUMER')).toBe(false);
      expect(isValidTransition('CREATED', 'REVIEWED')).toBe(false);
      expect(isValidTransition('CREATED', 'IN_PROGRESS')).toBe(false);
      expect(isValidTransition('CREATED', 'SELECTED')).toBe(false);
    });

    it('should allow valid transitions from RESPONSES_RECEIVED', () => {
      expect(isValidTransition('RESPONSES_RECEIVED', 'IN_CONVERSATION')).toBe(true);
      expect(isValidTransition('RESPONSES_RECEIVED', 'FLAGGED')).toBe(true);
      expect(isValidTransition('RESPONSES_RECEIVED', 'CANCELLED_BY_CONSUMER')).toBe(true);
      expect(isValidTransition('RESPONSES_RECEIVED', 'EXPIRED')).toBe(true);
    });

    it('should allow valid transitions from IN_CONVERSATION', () => {
      expect(isValidTransition('IN_CONVERSATION', 'QUOTE_RECEIVED')).toBe(true);
      expect(isValidTransition('IN_CONVERSATION', 'SELECTED')).toBe(true);
      expect(isValidTransition('IN_CONVERSATION', 'FLAGGED')).toBe(true);
      expect(isValidTransition('IN_CONVERSATION', 'CANCELLED_BY_CONSUMER')).toBe(true);
    });

    it('should allow valid transitions from SELECTED', () => {
      expect(isValidTransition('SELECTED', 'SCHEDULED')).toBe(true);
      expect(isValidTransition('SELECTED', 'IN_PROGRESS')).toBe(true);
      expect(isValidTransition('SELECTED', 'COMPLETED_BY_CONSUMER')).toBe(true);
      expect(isValidTransition('SELECTED', 'COMPLETED_BY_PRO')).toBe(true);
      expect(isValidTransition('SELECTED', 'CANCELLED_BY_CONSUMER')).toBe(true);
      expect(isValidTransition('SELECTED', 'CANCELLED_BY_PRO')).toBe(true);
    });

    it('should allow valid transitions from SCHEDULED', () => {
      expect(isValidTransition('SCHEDULED', 'IN_PROGRESS')).toBe(true);
      expect(isValidTransition('SCHEDULED', 'COMPLETED_BY_CONSUMER')).toBe(true);
      expect(isValidTransition('SCHEDULED', 'COMPLETED_BY_PRO')).toBe(true);
      expect(isValidTransition('SCHEDULED', 'CANCELLED_BY_CONSUMER')).toBe(true);
      expect(isValidTransition('SCHEDULED', 'CANCELLED_BY_PRO')).toBe(true);
    });

    it('should allow valid transitions from IN_PROGRESS', () => {
      expect(isValidTransition('IN_PROGRESS', 'COMPLETED_BY_CONSUMER')).toBe(true);
      expect(isValidTransition('IN_PROGRESS', 'COMPLETED_BY_PRO')).toBe(true);
      expect(isValidTransition('IN_PROGRESS', 'CANCELLED_BY_CONSUMER')).toBe(true);
      expect(isValidTransition('IN_PROGRESS', 'CANCELLED_BY_PRO')).toBe(true);
    });

    it('should allow valid transitions from COMPLETED_BY_PRO', () => {
      expect(isValidTransition('COMPLETED_BY_PRO', 'COMPLETED_BY_CONSUMER')).toBe(true);
      expect(isValidTransition('COMPLETED_BY_PRO', 'REVIEWED')).toBe(true);
    });

    it('should allow valid transitions from COMPLETED_BY_CONSUMER', () => {
      expect(isValidTransition('COMPLETED_BY_CONSUMER', 'REVIEWED')).toBe(true);
    });

    it('should not allow transitions from terminal statuses', () => {
      expect(isValidTransition('REVIEWED', 'CREATED')).toBe(false);
      expect(isValidTransition('REVIEWED', 'COMPLETED_BY_CONSUMER')).toBe(false);
      expect(isValidTransition('CANCELLED_BY_CONSUMER', 'CREATED')).toBe(false);
      expect(isValidTransition('CANCELLED_BY_PRO', 'CREATED')).toBe(false);
      expect(isValidTransition('EXPIRED', 'CREATED')).toBe(false);
    });

    it('should allow NO_MATCH to be reopened', () => {
      expect(isValidTransition('NO_MATCH', 'CREATED')).toBe(true);
    });

    it('should allow FLAGGED to be unflagged or expired', () => {
      expect(isValidTransition('FLAGGED', 'CREATED')).toBe(true);
      expect(isValidTransition('FLAGGED', 'EXPIRED')).toBe(true);
    });
  });

  describe('getValidNextStatuses', () => {
    it('should return correct next statuses for CREATED', () => {
      const nextStatuses = getValidNextStatuses('CREATED');
      expect(nextStatuses).toContain('RESPONSES_RECEIVED');
      expect(nextStatuses).toContain('FLAGGED');
      expect(nextStatuses).toContain('NO_MATCH');
      expect(nextStatuses).toContain('EXPIRED');
      expect(nextStatuses).toContain('CANCELLED_BY_CONSUMER');
      expect(nextStatuses).not.toContain('REVIEWED');
    });

    it('should return empty array for terminal statuses', () => {
      expect(getValidNextStatuses('REVIEWED')).toEqual([]);
      expect(getValidNextStatuses('CANCELLED_BY_CONSUMER')).toEqual([]);
      expect(getValidNextStatuses('CANCELLED_BY_PRO')).toEqual([]);
      expect(getValidNextStatuses('EXPIRED')).toEqual([]);
    });

    it('should return correct next statuses for IN_CONVERSATION', () => {
      const nextStatuses = getValidNextStatuses('IN_CONVERSATION');
      expect(nextStatuses).toContain('QUOTE_RECEIVED');
      expect(nextStatuses).toContain('SELECTED');
      expect(nextStatuses).toContain('FLAGGED');
      expect(nextStatuses).toContain('CANCELLED_BY_CONSUMER');
    });
  });

  describe('transitionJobStatus', () => {
    it('should successfully transition job status with valid transition', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'CREATED' as JobStatus,
      };

      const updatedJob = {
        ...mockJob,
        status: 'RESPONSES_RECEIVED' as JobStatus,
        statusChangedBy: 'SYSTEM' as StatusChangedBy,
        statusChangedAt: new Date(),
      };

      vi.mocked(prisma.job.findUnique).mockResolvedValue(mockJob as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback({
          job: {
            update: vi.fn().mockResolvedValue(updatedJob),
          },
          statusHistory: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await transitionJobStatus({
        jobId: 'job-123',
        toStatus: 'RESPONSES_RECEIVED',
        changedBy: 'SYSTEM',
      });

      expect(result.success).toBe(true);
      expect(result.job).toBeDefined();
      expect(prisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-123' },
        select: { id: true, status: true },
      });
    });

    it('should reject invalid transition', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'CREATED' as JobStatus,
      };

      vi.mocked(prisma.job.findUnique).mockResolvedValue(mockJob as any);

      const result = await transitionJobStatus({
        jobId: 'job-123',
        toStatus: 'REVIEWED',
        changedBy: 'CONSUMER',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Ongeldige statusovergang');
    });

    it('should return error if job not found', async () => {
      vi.mocked(prisma.job.findUnique).mockResolvedValue(null);

      const result = await transitionJobStatus({
        jobId: 'nonexistent-job',
        toStatus: 'RESPONSES_RECEIVED',
        changedBy: 'SYSTEM',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Klus niet gevonden');
    });

    it('should require cancellation reason for PRO cancellation (min 10 chars)', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'SELECTED' as JobStatus,
      };

      vi.mocked(prisma.job.findUnique).mockResolvedValue(mockJob as any);

      // Too short reason
      const result1 = await transitionJobStatus({
        jobId: 'job-123',
        toStatus: 'CANCELLED_BY_PRO',
        changedBy: 'PROFESSIONAL',
        reason: 'short',
      });

      expect(result1.success).toBe(false);
      expect(result1.error).toContain('minimaal 10 tekens');

      // No reason
      const result2 = await transitionJobStatus({
        jobId: 'job-123',
        toStatus: 'CANCELLED_BY_PRO',
        changedBy: 'PROFESSIONAL',
      });

      expect(result2.success).toBe(false);
      expect(result2.error).toContain('minimaal 10 tekens');
    });

    it('should set startedAt timestamp when transitioning to IN_PROGRESS', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'SCHEDULED' as JobStatus,
      };

      let updateData: any = null;

      vi.mocked(prisma.job.findUnique).mockResolvedValue(mockJob as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback({
          job: {
            update: vi.fn().mockImplementation((args) => {
              updateData = args.data;
              return Promise.resolve({ ...mockJob, ...updateData });
            }),
          },
          statusHistory: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      await transitionJobStatus({
        jobId: 'job-123',
        toStatus: 'IN_PROGRESS',
        changedBy: 'PROFESSIONAL',
      });

      expect(updateData.startedAt).toBeInstanceOf(Date);
    });

    it('should set completedAtByPro timestamp when transitioning to COMPLETED_BY_PRO', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'IN_PROGRESS' as JobStatus,
      };

      let updateData: any = null;

      vi.mocked(prisma.job.findUnique).mockResolvedValue(mockJob as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback({
          job: {
            update: vi.fn().mockImplementation((args) => {
              updateData = args.data;
              return Promise.resolve({ ...mockJob, ...updateData });
            }),
          },
          statusHistory: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      await transitionJobStatus({
        jobId: 'job-123',
        toStatus: 'COMPLETED_BY_PRO',
        changedBy: 'PROFESSIONAL',
      });

      expect(updateData.completedAtByPro).toBeInstanceOf(Date);
    });

    it('should set completedAtByCons and completedAt when transitioning to COMPLETED_BY_CONSUMER', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'IN_PROGRESS' as JobStatus,
      };

      let updateData: any = null;

      vi.mocked(prisma.job.findUnique).mockResolvedValue(mockJob as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback({
          job: {
            update: vi.fn().mockImplementation((args) => {
              updateData = args.data;
              return Promise.resolve({ ...mockJob, ...updateData });
            }),
          },
          statusHistory: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      await transitionJobStatus({
        jobId: 'job-123',
        toStatus: 'COMPLETED_BY_CONSUMER',
        changedBy: 'CONSUMER',
      });

      expect(updateData.completedAtByCons).toBeInstanceOf(Date);
      expect(updateData.completedAt).toBeInstanceOf(Date);
    });

    it('should set cancelledAt and cancellationReason when cancelling', async () => {
      const mockJob = {
        id: 'job-123',
        status: 'SELECTED' as JobStatus,
      };

      let updateData: any = null;

      vi.mocked(prisma.job.findUnique).mockResolvedValue(mockJob as any);
      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        return callback({
          job: {
            update: vi.fn().mockImplementation((args) => {
              updateData = args.data;
              return Promise.resolve({ ...mockJob, ...updateData });
            }),
          },
          statusHistory: {
            create: vi.fn().mockResolvedValue({}),
          },
        });
      });

      await transitionJobStatus({
        jobId: 'job-123',
        toStatus: 'CANCELLED_BY_PRO',
        changedBy: 'PROFESSIONAL',
        reason: 'Valid reason for cancellation',
      });

      expect(updateData.cancelledAt).toBeInstanceOf(Date);
      expect(updateData.cancellationReason).toBe('Valid reason for cancellation');
    });
  });

  describe('mapLegacyStatus', () => {
    it('should map DRAFT to CREATED', () => {
      expect(mapLegacyStatus('DRAFT')).toBe('CREATED');
    });

    it('should map PUBLISHED to CREATED', () => {
      expect(mapLegacyStatus('PUBLISHED')).toBe('CREATED');
    });

    it('should map ACCEPTED to SELECTED', () => {
      expect(mapLegacyStatus('ACCEPTED')).toBe('SELECTED');
    });

    it('should map COMPLETED to COMPLETED_BY_CONSUMER', () => {
      expect(mapLegacyStatus('COMPLETED')).toBe('COMPLETED_BY_CONSUMER');
    });

    it('should return same status for non-legacy statuses', () => {
      expect(mapLegacyStatus('CREATED')).toBe('CREATED');
      expect(mapLegacyStatus('REVIEWED')).toBe('REVIEWED');
      expect(mapLegacyStatus('IN_PROGRESS')).toBe('IN_PROGRESS');
    });
  });

  describe('canBeReviewed', () => {
    it('should return true for reviewable statuses', () => {
      expect(canBeReviewed('COMPLETED_BY_CONSUMER')).toBe(true);
      expect(canBeReviewed('COMPLETED_BY_PRO')).toBe(true);
    });

    it('should return false for non-reviewable statuses', () => {
      expect(canBeReviewed('CREATED')).toBe(false);
      expect(canBeReviewed('IN_PROGRESS')).toBe(false);
      expect(canBeReviewed('SELECTED')).toBe(false);
      expect(canBeReviewed('REVIEWED')).toBe(false);
      expect(canBeReviewed('CANCELLED_BY_CONSUMER')).toBe(false);
    });
  });

  describe('isActiveJob', () => {
    it('should return true for active statuses', () => {
      expect(isActiveJob('CREATED')).toBe(true);
      expect(isActiveJob('RESPONSES_RECEIVED')).toBe(true);
      expect(isActiveJob('IN_CONVERSATION')).toBe(true);
      expect(isActiveJob('QUOTE_RECEIVED')).toBe(true);
      expect(isActiveJob('SELECTED')).toBe(true);
      expect(isActiveJob('SCHEDULED')).toBe(true);
      expect(isActiveJob('IN_PROGRESS')).toBe(true);
      expect(isActiveJob('PUBLISHED')).toBe(true);
      expect(isActiveJob('ACCEPTED')).toBe(true);
    });

    it('should return false for inactive statuses', () => {
      expect(isActiveJob('COMPLETED_BY_CONSUMER')).toBe(false);
      expect(isActiveJob('COMPLETED_BY_PRO')).toBe(false);
      expect(isActiveJob('REVIEWED')).toBe(false);
      expect(isActiveJob('CANCELLED_BY_CONSUMER')).toBe(false);
      expect(isActiveJob('CANCELLED_BY_PRO')).toBe(false);
      expect(isActiveJob('EXPIRED')).toBe(false);
    });
  });

  describe('isCompletedJob', () => {
    it('should return true for completed statuses', () => {
      expect(isCompletedJob('COMPLETED_BY_CONSUMER')).toBe(true);
      expect(isCompletedJob('COMPLETED_BY_PRO')).toBe(true);
      expect(isCompletedJob('REVIEWED')).toBe(true);
      expect(isCompletedJob('COMPLETED')).toBe(true);
    });

    it('should return false for non-completed statuses', () => {
      expect(isCompletedJob('CREATED')).toBe(false);
      expect(isCompletedJob('IN_PROGRESS')).toBe(false);
      expect(isCompletedJob('SELECTED')).toBe(false);
      expect(isCompletedJob('CANCELLED_BY_CONSUMER')).toBe(false);
    });
  });

  describe('getProFlowStep', () => {
    it('should return 1 for SELECTED status', () => {
      expect(getProFlowStep('SELECTED')).toBe(1);
    });

    it('should return 2 for SCHEDULED status', () => {
      expect(getProFlowStep('SCHEDULED')).toBe(2);
    });

    it('should return 3 for IN_PROGRESS status', () => {
      expect(getProFlowStep('IN_PROGRESS')).toBe(3);
    });

    it('should return 4 for completed statuses', () => {
      expect(getProFlowStep('COMPLETED_BY_PRO')).toBe(4);
      expect(getProFlowStep('COMPLETED_BY_CONSUMER')).toBe(4);
      expect(getProFlowStep('REVIEWED')).toBe(4);
    });

    it('should return 0 for non-PRO-flow statuses', () => {
      expect(getProFlowStep('CREATED')).toBe(0);
      expect(getProFlowStep('RESPONSES_RECEIVED')).toBe(0);
      expect(getProFlowStep('IN_CONVERSATION')).toBe(0);
      expect(getProFlowStep('CANCELLED_BY_CONSUMER')).toBe(0);
    });
  });

  describe('STATUS_LABELS', () => {
    it('should have labels for all major JobStatus values', () => {
      const majorStatuses: JobStatus[] = [
        'CREATED', 'RESPONSES_RECEIVED', 'IN_CONVERSATION', 'SELECTED',
        'SCHEDULED', 'IN_PROGRESS', 'COMPLETED_BY_CONSUMER', 'COMPLETED_BY_PRO',
        'REVIEWED', 'CANCELLED_BY_CONSUMER', 'CANCELLED_BY_PRO', 'EXPIRED'
      ];

      majorStatuses.forEach((status) => {
        expect(STATUS_LABELS[status]).toBeDefined();
        expect(STATUS_LABELS[status]).toBeTruthy();
      });
    });

    it('should have Dutch labels', () => {
      expect(STATUS_LABELS.CREATED).toBe('Actief');
      expect(STATUS_LABELS.RESPONSES_RECEIVED).toBe('Reacties ontvangen');
      expect(STATUS_LABELS.IN_CONVERSATION).toBe('In gesprek');
      expect(STATUS_LABELS.SELECTED).toBe('Vakman gekozen');
      expect(STATUS_LABELS.REVIEWED).toBe('Beoordeeld');
    });
  });

  describe('STATUS_COLORS', () => {
    it('should have colors for all major JobStatus values', () => {
      const majorStatuses: JobStatus[] = [
        'CREATED', 'RESPONSES_RECEIVED', 'IN_CONVERSATION', 'SELECTED',
        'SCHEDULED', 'IN_PROGRESS', 'COMPLETED_BY_CONSUMER', 'COMPLETED_BY_PRO',
        'REVIEWED', 'CANCELLED_BY_CONSUMER', 'CANCELLED_BY_PRO', 'EXPIRED'
      ];

      majorStatuses.forEach((status) => {
        expect(STATUS_COLORS[status]).toBeDefined();
        expect(STATUS_COLORS[status].bg).toBeDefined();
        expect(STATUS_COLORS[status].text).toBeDefined();
      });
    });

    it('should have valid Tailwind color classes', () => {
      const testStatuses: JobStatus[] = ['CREATED', 'SELECTED', 'COMPLETED_BY_CONSUMER', 'REVIEWED'];

      testStatuses.forEach((status) => {
        const { bg, text } = STATUS_COLORS[status];
        expect(bg).toMatch(/^bg-\w+-\d+$/);
        expect(text).toMatch(/^text-\w+-\d+$/);
      });
    });
  });

  describe('Status arrays', () => {
    it('should have PRO_VISIBLE_STATUSES defined correctly', () => {
      expect(PRO_VISIBLE_STATUSES).toContain('SELECTED');
      expect(PRO_VISIBLE_STATUSES).toContain('SCHEDULED');
      expect(PRO_VISIBLE_STATUSES).toContain('IN_PROGRESS');
      expect(PRO_VISIBLE_STATUSES).toContain('COMPLETED_BY_PRO');
      expect(PRO_VISIBLE_STATUSES).not.toContain('CREATED');
    });

    it('should have PRO_ACTION_STATUSES defined correctly', () => {
      expect(PRO_ACTION_STATUSES).toContain('SELECTED');
      expect(PRO_ACTION_STATUSES).toContain('SCHEDULED');
      expect(PRO_ACTION_STATUSES).toContain('IN_PROGRESS');
      expect(PRO_ACTION_STATUSES).not.toContain('REVIEWED');
    });

    it('should have CONSUMER_ACTION_STATUSES defined correctly', () => {
      expect(CONSUMER_ACTION_STATUSES).toContain('CREATED');
      expect(CONSUMER_ACTION_STATUSES).toContain('IN_CONVERSATION');
      expect(CONSUMER_ACTION_STATUSES).toContain('COMPLETED_BY_PRO');
      expect(CONSUMER_ACTION_STATUSES).not.toContain('REVIEWED');
    });

    it('should have TERMINAL_STATUSES with no outgoing transitions', () => {
      TERMINAL_STATUSES.forEach((status) => {
        const nextStatuses = getValidNextStatuses(status);
        if (status !== 'NO_MATCH') {
          expect(nextStatuses).toEqual([]);
        }
      });
    });

    it('should have ACTIVE_STATUSES excluding completed/cancelled', () => {
      expect(ACTIVE_STATUSES).toContain('CREATED');
      expect(ACTIVE_STATUSES).toContain('IN_PROGRESS');
      expect(ACTIVE_STATUSES).not.toContain('COMPLETED_BY_CONSUMER');
      expect(ACTIVE_STATUSES).not.toContain('CANCELLED_BY_PRO');
    });

    it('should have COMPLETED_STATUSES including all completion states', () => {
      expect(COMPLETED_STATUSES).toContain('COMPLETED_BY_CONSUMER');
      expect(COMPLETED_STATUSES).toContain('COMPLETED_BY_PRO');
      expect(COMPLETED_STATUSES).toContain('REVIEWED');
      expect(COMPLETED_STATUSES).toContain('COMPLETED');
    });
  });
});
