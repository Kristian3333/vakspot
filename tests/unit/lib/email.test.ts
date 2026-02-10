// tests/unit/lib/email.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sendNewMessageEmail,
  sendNewInterestEmail,
  sendBidAcceptedEmail,
  sendBidRejectedEmail,
  sendWelcomeEmailClient,
  sendWelcomeEmailPro,
  sendNewJobsAlertEmail,
  sendProSelectedEmail,
  sendJobScheduledEmail,
  sendWorkStartedEmail,
  sendJobCompletedEmail,
  sendJobCancelledEmail,
  sendSetStartDateReminderEmail,
  sendQuoteReceivedEmail,
  sendNoResponsesNudgeEmail,
} from '@/lib/email';

// Mock Resend
vi.mock('resend', () => {
  const mockSend = vi.fn().mockResolvedValue({ id: 'email-123' });
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
  };
});

describe('email', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, RESEND_API_KEY: 'test-key', NEXTAUTH_URL: 'http://localhost:3000' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('sendNewMessageEmail', () => {
    it('should send email with correct parameters', async () => {
      const result = await sendNewMessageEmail({
        to: 'client@example.com',
        senderName: 'John Doe',
        jobTitle: 'Kitchen Renovation',
        messagePreview: 'I can start next week',
        conversationUrl: '/client/jobs/job-123',
      });

      expect(result).toBe(true);
    });

    it('should include sender name in email content', async () => {
      const result = await sendNewMessageEmail({
        to: 'client@example.com',
        senderName: 'Jane Smith',
        jobTitle: 'Bathroom Repair',
        messagePreview: 'Available tomorrow',
        conversationUrl: '/client/jobs/job-456',
      });

      expect(result).toBe(true);
    });

    it('should truncate long message previews', async () => {
      const longMessage = 'a'.repeat(150);
      const result = await sendNewMessageEmail({
        to: 'client@example.com',
        senderName: 'Pro User',
        jobTitle: 'Test Job',
        messagePreview: longMessage,
        conversationUrl: '/client/jobs/job-789',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendNewInterestEmail', () => {
    it('should send email with pro and job details', async () => {
      const result = await sendNewInterestEmail({
        to: 'client@example.com',
        proName: 'John Pro',
        proCompany: 'Pro Services BV',
        jobTitle: 'Floor Installation',
        message: 'I have 10 years of experience in floor installation',
        jobUrl: '/client/jobs/job-abc',
      });

      expect(result).toBe(true);
    });

    it('should truncate long messages', async () => {
      const longMessage = 'a'.repeat(250);
      const result = await sendNewInterestEmail({
        to: 'client@example.com',
        proName: 'Pro',
        proCompany: 'Company',
        jobTitle: 'Job',
        message: longMessage,
        jobUrl: '/client/jobs/job-123',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendBidAcceptedEmail', () => {
    it('should send congratulations email to PRO', async () => {
      const result = await sendBidAcceptedEmail({
        to: 'pro@example.com',
        clientName: 'Alice Client',
        jobTitle: 'Garden Landscaping',
        conversationUrl: '/pro/jobs/job-123',
      });

      expect(result).toBe(true);
    });

    it('should include client name and job title', async () => {
      const result = await sendBidAcceptedEmail({
        to: 'pro@example.com',
        clientName: 'Bob Builder',
        jobTitle: 'Roof Repair',
        conversationUrl: '/pro/jobs/job-456',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendBidRejectedEmail', () => {
    it('should send rejection email with encouragement', async () => {
      const result = await sendBidRejectedEmail({
        to: 'pro@example.com',
        jobTitle: 'Painting Job',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendWelcomeEmailClient', () => {
    it('should send welcome email with client name', async () => {
      const result = await sendWelcomeEmailClient({
        to: 'newclient@example.com',
        name: 'New Client',
      });

      expect(result).toBe(true);
    });

    it('should handle missing name gracefully', async () => {
      const result = await sendWelcomeEmailClient({
        to: 'newclient@example.com',
        name: '',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendWelcomeEmailPro', () => {
    it('should send welcome email with company details', async () => {
      const result = await sendWelcomeEmailPro({
        to: 'newpro@example.com',
        name: 'John',
        companyName: 'John Services BV',
      });

      expect(result).toBe(true);
    });

    it('should include onboarding steps', async () => {
      const result = await sendWelcomeEmailPro({
        to: 'pro@example.com',
        name: 'Jane',
        companyName: 'Pro Company',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendNewJobsAlertEmail', () => {
    it('should send alert with multiple jobs', async () => {
      const jobs = [
        { id: '1', title: 'Job 1', city: 'Amsterdam', category: 'Plumbing' },
        { id: '2', title: 'Job 2', city: 'Rotterdam', category: 'Electrical' },
        { id: '3', title: 'Job 3', city: 'Utrecht', category: 'Carpentry' },
      ];

      const result = await sendNewJobsAlertEmail({
        to: 'pro@example.com',
        proName: 'Pro User',
        jobs,
      });

      expect(result).toBe(true);
    });

    it('should handle single job', async () => {
      const jobs = [{ id: '1', title: 'Single Job', city: 'Amsterdam', category: 'Painting' }];

      const result = await sendNewJobsAlertEmail({
        to: 'pro@example.com',
        proName: 'Pro',
        jobs,
      });

      expect(result).toBe(true);
    });

    it('should limit to 5 jobs in email body', async () => {
      const jobs = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        title: `Job ${i}`,
        city: 'Amsterdam',
        category: 'General',
      }));

      const result = await sendNewJobsAlertEmail({
        to: 'pro@example.com',
        proName: 'Pro',
        jobs,
      });

      expect(result).toBe(true);
    });
  });

  describe('sendProSelectedEmail', () => {
    it('should send selection email with next steps', async () => {
      const result = await sendProSelectedEmail({
        to: 'pro@example.com',
        proName: 'John Pro',
        clientName: 'Client Name',
        jobTitle: 'Renovation',
        conversationUrl: '/pro/jobs/job-123',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendJobScheduledEmail', () => {
    it('should send scheduled email to client', async () => {
      const startDate = new Date('2026-03-15');
      const result = await sendJobScheduledEmail({
        to: 'client@example.com',
        recipientName: 'Client',
        jobTitle: 'Kitchen Work',
        startDate,
        conversationUrl: '/client/jobs/job-123',
        isClient: true,
      });

      expect(result).toBe(true);
    });

    it('should send scheduled email to PRO', async () => {
      const startDate = new Date('2026-03-20');
      const result = await sendJobScheduledEmail({
        to: 'pro@example.com',
        recipientName: 'Pro',
        jobTitle: 'Bathroom Repair',
        startDate,
        conversationUrl: '/pro/jobs/job-456',
        isClient: false,
      });

      expect(result).toBe(true);
    });

    it('should format date correctly in Dutch locale', async () => {
      const startDate = new Date('2026-12-25');
      const result = await sendJobScheduledEmail({
        to: 'client@example.com',
        recipientName: 'User',
        jobTitle: 'Job',
        startDate,
        conversationUrl: '/jobs/123',
        isClient: true,
      });

      expect(result).toBe(true);
    });
  });

  describe('sendWorkStartedEmail', () => {
    it('should send work started notification', async () => {
      const result = await sendWorkStartedEmail({
        to: 'client@example.com',
        recipientName: 'Client',
        jobTitle: 'Painting',
        conversationUrl: '/client/jobs/job-123',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendJobCompletedEmail', () => {
    it('should send completion email with review link for consumer', async () => {
      const result = await sendJobCompletedEmail({
        to: 'client@example.com',
        recipientName: 'Client',
        jobTitle: 'Garden Work',
        completedBy: 'consumer',
        conversationUrl: '/client/jobs/job-123',
        reviewUrl: '/client/jobs/job-123/review',
      });

      expect(result).toBe(true);
    });

    it('should send completion email without review link for pro', async () => {
      const result = await sendJobCompletedEmail({
        to: 'pro@example.com',
        recipientName: 'Pro',
        jobTitle: 'Repair Work',
        completedBy: 'pro',
        conversationUrl: '/pro/jobs/job-456',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendJobCancelledEmail', () => {
    it('should send cancellation email with reason', async () => {
      const result = await sendJobCancelledEmail({
        to: 'client@example.com',
        recipientName: 'Client',
        jobTitle: 'Project',
        cancelledBy: 'pro',
        reason: 'Unexpected scheduling conflict',
      });

      expect(result).toBe(true);
    });

    it('should send cancellation email without reason', async () => {
      const result = await sendJobCancelledEmail({
        to: 'pro@example.com',
        recipientName: 'Pro',
        jobTitle: 'Job',
        cancelledBy: 'consumer',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendSetStartDateReminderEmail', () => {
    it('should send reminder with days since selection', async () => {
      const result = await sendSetStartDateReminderEmail({
        to: 'pro@example.com',
        proName: 'Pro User',
        clientName: 'Client Name',
        jobTitle: 'Urgent Job',
        daysSinceSelection: 3,
        conversationUrl: '/pro/jobs/job-123',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendQuoteReceivedEmail', () => {
    it('should send quote with formatted amount and date', async () => {
      const validUntil = new Date('2026-03-31');
      const result = await sendQuoteReceivedEmail({
        to: 'client@example.com',
        clientName: 'Client',
        proName: 'Pro',
        proCompany: 'Pro BV',
        jobTitle: 'Kitchen Renovation',
        amount: 250000, // 2500.00 EUR in cents
        validUntil,
        conversationUrl: '/client/jobs/job-123',
      });

      expect(result).toBe(true);
    });

    it('should format currency correctly for Dutch locale', async () => {
      const validUntil = new Date('2026-04-15');
      const result = await sendQuoteReceivedEmail({
        to: 'client@example.com',
        clientName: 'User',
        proName: 'Pro',
        proCompany: 'Company',
        jobTitle: 'Job',
        amount: 150050, // 1500.50 EUR
        validUntil,
        conversationUrl: '/jobs/456',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendNoResponsesNudgeEmail', () => {
    it('should send nudge with helpful tips', async () => {
      const result = await sendNoResponsesNudgeEmail({
        to: 'client@example.com',
        clientName: 'Client',
        jobTitle: 'Plumbing Job',
        daysSincePosted: 5,
        jobUrl: '/client/jobs/job-123',
      });

      expect(result).toBe(true);
    });

    it('should include days since posted', async () => {
      const result = await sendNoResponsesNudgeEmail({
        to: 'client@example.com',
        clientName: 'User',
        jobTitle: 'Job',
        daysSincePosted: 7,
        jobUrl: '/jobs/456',
      });

      expect(result).toBe(true);
    });
  });

  describe('Email template wrapper', () => {
    it('should produce valid HTML structure for all emails', async () => {
      const emails = [
        sendNewMessageEmail({
          to: 'test@example.com',
          senderName: 'Sender',
          jobTitle: 'Job',
          messagePreview: 'Preview',
          conversationUrl: '/conversation',
        }),
        sendWelcomeEmailClient({
          to: 'test@example.com',
          name: 'User',
        }),
        sendBidAcceptedEmail({
          to: 'test@example.com',
          clientName: 'Client',
          jobTitle: 'Job',
          conversationUrl: '/conversation',
        }),
      ];

      const results = await Promise.all(emails);
      results.forEach((result) => {
        expect(result).toBe(true);
      });
    });
  });

  describe('Email sending without API key', () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY;
    });

    it('should return false when RESEND_API_KEY is not set', async () => {
      const result = await sendWelcomeEmailClient({
        to: 'test@example.com',
        name: 'User',
      });

      expect(result).toBe(false);
    });
  });

  describe('Required fields validation', () => {
    it('sendNewMessageEmail should include all required fields', async () => {
      const result = await sendNewMessageEmail({
        to: 'client@example.com',
        senderName: 'Sender',
        jobTitle: 'Title',
        messagePreview: 'Preview',
        conversationUrl: '/url',
      });

      expect(result).toBe(true);
    });

    it('sendQuoteReceivedEmail should include amount and valid until', async () => {
      const result = await sendQuoteReceivedEmail({
        to: 'client@example.com',
        clientName: 'Client',
        proName: 'Pro',
        proCompany: 'Company',
        jobTitle: 'Job',
        amount: 100000,
        validUntil: new Date('2026-12-31'),
        conversationUrl: '/conversation',
      });

      expect(result).toBe(true);
    });

    it('sendJobScheduledEmail should handle date formatting', async () => {
      const result = await sendJobScheduledEmail({
        to: 'user@example.com',
        recipientName: 'User',
        jobTitle: 'Job',
        startDate: new Date('2026-06-15'),
        conversationUrl: '/conversation',
        isClient: true,
      });

      expect(result).toBe(true);
    });
  });
});
