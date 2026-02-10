// tests/unit/components/job-completion-actions.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JobCompletionActions } from '@/components/jobs/job-completion-actions';
import { JobStatus } from '@prisma/client';

// Mock fetch globally
global.fetch = vi.fn();

describe('JobCompletionActions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm to return true by default
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    // Mock window.location.reload
    delete (window as any).location;
    (window as any).location = { reload: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show "Markeer als voltooid" button when status is IN_PROGRESS', () => {
    render(
      <JobCompletionActions
        jobId="job-123"
        status={JobStatus.IN_PROGRESS}
        acceptedProId="pro-456"
        hasReview={false}
      />
    );

    const button = screen.getByRole('button', { name: /Markeer als voltooid/i });
    expect(button).toBeInTheDocument();
  });

  it('should show "Markeer als voltooid" button when status is SCHEDULED', () => {
    render(
      <JobCompletionActions
        jobId="job-123"
        status={JobStatus.SCHEDULED}
        acceptedProId="pro-456"
        hasReview={false}
      />
    );

    const button = screen.getByRole('button', { name: /Markeer als voltooid/i });
    expect(button).toBeInTheDocument();
  });

  it('should not show button when status is CREATED', () => {
    render(
      <JobCompletionActions
        jobId="job-123"
        status={JobStatus.CREATED}
        acceptedProId={undefined}
        hasReview={false}
      />
    );

    const button = screen.queryByRole('button', { name: /Markeer als voltooid/i });
    expect(button).not.toBeInTheDocument();
  });

  it('should call API to transition status when button is clicked', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <JobCompletionActions
        jobId="job-789"
        status={JobStatus.IN_PROGRESS}
        acceptedProId="pro-101"
        hasReview={false}
      />
    );

    const button = screen.getByRole('button', { name: /Markeer als voltooid/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/jobs/job-789/status',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'COMPLETED_BY_CONSUMER',
          }),
        })
      );
    });
  });

  it('should show loading state while submitting', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <JobCompletionActions
        jobId="job-202"
        status={JobStatus.IN_PROGRESS}
        acceptedProId="pro-303"
        hasReview={false}
      />
    );

    const button = screen.getByRole('button', { name: /Markeer als voltooid/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
  });

  it('should show error message when API call fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    render(
      <JobCompletionActions
        jobId="job-404"
        status={JobStatus.IN_PROGRESS}
        acceptedProId="pro-505"
        hasReview={false}
      />
    );

    const button = screen.getByRole('button', { name: /Markeer als voltooid/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  it('should show review prompt after completion', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <JobCompletionActions
        jobId="job-606"
        status={JobStatus.IN_PROGRESS}
        acceptedProId="pro-707"
        hasReview={false}
      />
    );

    const button = screen.getByRole('button', { name: /Markeer als voltooid/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Laat een beoordeling achter/i })).toBeInTheDocument();
    });
  });

  it('should show review link when job is completed and no review exists', () => {
    render(
      <JobCompletionActions
        jobId="job-808"
        status={JobStatus.COMPLETED_BY_CONSUMER}
        acceptedProId="pro-909"
        hasReview={false}
      />
    );

    const reviewLink = screen.getByRole('link', { name: /Laat een beoordeling achter/i });
    expect(reviewLink).toBeInTheDocument();
    expect(reviewLink).toHaveAttribute('href', '/client/jobs/job-808/review');
  });

  it('should not show review prompt when review already exists', () => {
    render(
      <JobCompletionActions
        jobId="job-111"
        status={JobStatus.COMPLETED_BY_CONSUMER}
        acceptedProId="pro-222"
        hasReview={true}
      />
    );

    const reviewLink = screen.queryByRole('link', { name: /Laat een beoordeling achter/i });
    expect(reviewLink).not.toBeInTheDocument();
  });

  it('should not show review prompt when status is COMPLETED_BY_PRO but not confirmed', () => {
    render(
      <JobCompletionActions
        jobId="job-333"
        status={JobStatus.COMPLETED_BY_PRO}
        acceptedProId="pro-444"
        hasReview={false}
      />
    );

    // Should show completion button to confirm
    const button = screen.getByRole('button', { name: /Bevestig voltooiing/i });
    expect(button).toBeInTheDocument();
  });

  it('should not show any actions when no acceptedProId is provided', () => {
    render(
      <JobCompletionActions
        jobId="job-555"
        status={JobStatus.IN_PROGRESS}
        acceptedProId={undefined}
        hasReview={false}
      />
    );

    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('should reload page after successful completion', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <JobCompletionActions
        jobId="job-666"
        status={JobStatus.IN_PROGRESS}
        acceptedProId="pro-777"
        hasReview={false}
      />
    );

    const button = screen.getByRole('button', { name: /Markeer als voltooid/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it('should show confirmation dialog before marking as complete', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <JobCompletionActions
        jobId="job-888"
        status={JobStatus.IN_PROGRESS}
        acceptedProId="pro-999"
        hasReview={false}
      />
    );

    const button = screen.getByRole('button', { name: /Markeer als voltooid/i });
    fireEvent.click(button);

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Weet u zeker dat het werk is voltooid')
    );
  });

  it('should not call API if confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <JobCompletionActions
        jobId="job-1010"
        status={JobStatus.IN_PROGRESS}
        acceptedProId="pro-1111"
        hasReview={false}
      />
    );

    const button = screen.getByRole('button', { name: /Markeer als voltooid/i });
    fireEvent.click(button);

    expect(window.confirm).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
