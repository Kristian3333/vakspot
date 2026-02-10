// tests/unit/components/status-flow.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { JobStatus } from '@prisma/client';

describe('StatusFlowTracker', () => {
  describe('PRO view', () => {
    it('should render 4-step PRO flow', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'pro' },
          React.createElement('div', { 'data-step': '1', 'data-status': 'SELECTED' }, 'Gekozen'),
          React.createElement('div', { 'data-step': '2', 'data-status': 'SCHEDULED' }, 'Ingepland'),
          React.createElement('div', { 'data-step': '3', 'data-status': 'IN_PROGRESS' }, 'Bezig'),
          React.createElement('div', { 'data-step': '4', 'data-status': 'COMPLETED' }, 'Voltooid')
        )
      );

      expect(tracker.getByTestId('status-flow')).toHaveAttribute('data-view', 'pro');
      const steps = tracker.container.querySelectorAll('[data-step]');
      expect(steps.length).toBe(4);
    });

    it('should highlight current step', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'pro' },
          React.createElement('div', { 'data-step': '1', 'data-completed': 'true' }, 'Gekozen'),
          React.createElement('div', { 'data-step': '2', 'data-completed': 'true' }, 'Ingepland'),
          React.createElement('div', { 'data-step': '3', 'data-current': 'true' }, 'Bezig'),
          React.createElement('div', { 'data-step': '4', 'data-completed': 'false' }, 'Voltooid')
        )
      );

      const currentStep = tracker.container.querySelector('[data-current="true"]');
      expect(currentStep).toHaveAttribute('data-step', '3');
    });

    it('should show timestamps for completed steps', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'pro' },
          React.createElement('div', { 'data-step': '1', 'data-completed': 'true', 'data-timestamp': '2024-01-12' }, 'Gekozen'),
          React.createElement('div', { 'data-step': '2', 'data-completed': 'true', 'data-timestamp': '2024-01-13' }, 'Ingepland'),
          React.createElement('div', { 'data-step': '3', 'data-current': 'true', 'data-timestamp': '2024-01-15' }, 'Bezig'),
          React.createElement('div', { 'data-step': '4' }, 'Voltooid')
        )
      );

      const step1 = tracker.container.querySelector('[data-step="1"]');
      const step2 = tracker.container.querySelector('[data-step="2"]');
      expect(step1).toHaveAttribute('data-timestamp', '2024-01-12');
      expect(step2).toHaveAttribute('data-timestamp', '2024-01-13');
    });

    it('should show PRO flow steps in correct order', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'pro' },
          React.createElement('div', { 'data-step': '1' }, 'Gekozen'),
          React.createElement('div', { 'data-step': '2' }, 'Ingepland'),
          React.createElement('div', { 'data-step': '3' }, 'Bezig'),
          React.createElement('div', { 'data-step': '4' }, 'Voltooid')
        )
      );

      const steps = Array.from(tracker.container.querySelectorAll('[data-step]'));
      expect(steps[0]).toHaveAttribute('data-step', '1');
      expect(steps[1]).toHaveAttribute('data-step', '2');
      expect(steps[2]).toHaveAttribute('data-step', '3');
      expect(steps[3]).toHaveAttribute('data-step', '4');
    });
  });

  describe('Client view', () => {
    it('should render full client flow from CREATED to REVIEWED', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'client' },
          React.createElement('div', { 'data-step': '1', 'data-status': 'CREATED' }, 'Actief'),
          React.createElement('div', { 'data-step': '2', 'data-status': 'RESPONSES_RECEIVED' }, 'Reacties'),
          React.createElement('div', { 'data-step': '3', 'data-status': 'IN_CONVERSATION' }, 'Gesprek'),
          React.createElement('div', { 'data-step': '4', 'data-status': 'SELECTED' }, 'Gekozen'),
          React.createElement('div', { 'data-step': '5', 'data-status': 'SCHEDULED' }, 'Ingepland'),
          React.createElement('div', { 'data-step': '6', 'data-status': 'IN_PROGRESS' }, 'Bezig'),
          React.createElement('div', { 'data-step': '7', 'data-status': 'COMPLETED' }, 'Voltooid'),
          React.createElement('div', { 'data-step': '8', 'data-status': 'REVIEWED' }, 'Beoordeeld')
        )
      );

      expect(tracker.getByTestId('status-flow')).toHaveAttribute('data-view', 'client');
      const steps = tracker.container.querySelectorAll('[data-step]');
      expect(steps.length).toBeGreaterThanOrEqual(7);
    });

    it('should highlight current status in client flow', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'client' },
          React.createElement('div', { 'data-step': '1', 'data-completed': 'true' }, 'Actief'),
          React.createElement('div', { 'data-step': '2', 'data-completed': 'true' }, 'Reacties'),
          React.createElement('div', { 'data-step': '3', 'data-completed': 'true' }, 'Gesprek'),
          React.createElement('div', { 'data-step': '4', 'data-current': 'true' }, 'Gekozen'),
          React.createElement('div', { 'data-step': '5' }, 'Ingepland'),
          React.createElement('div', { 'data-step': '6' }, 'Bezig'),
          React.createElement('div', { 'data-step': '7' }, 'Voltooid')
        )
      );

      const currentStep = tracker.container.querySelector('[data-current="true"]');
      expect(currentStep).toHaveAttribute('data-step', '4');
      expect(currentStep).toHaveTextContent('Gekozen');
    });

    it('should show timestamps for completed client steps', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'client' },
          React.createElement('div', { 'data-step': '1', 'data-completed': 'true', 'data-timestamp': '2024-01-10' }, 'Actief'),
          React.createElement('div', { 'data-step': '2', 'data-completed': 'true', 'data-timestamp': '2024-01-11' }, 'Reacties'),
          React.createElement('div', { 'data-step': '3', 'data-current': 'true' }, 'Gesprek')
        )
      );

      const step1 = tracker.container.querySelector('[data-step="1"]');
      const step2 = tracker.container.querySelector('[data-step="2"]');
      expect(step1).toHaveAttribute('data-timestamp');
      expect(step2).toHaveAttribute('data-timestamp');
    });
  });

  describe('Cancelled/Expired states', () => {
    it('should show cancelled as terminal branch in PRO view', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'pro' },
          React.createElement('div', { 'data-step': '1', 'data-completed': 'true' }, 'Gekozen'),
          React.createElement('div', { 'data-step': '2', 'data-completed': 'true' }, 'Ingepland'),
          React.createElement('div', { 'data-step': 'terminal', 'data-status': 'CANCELLED_BY_PRO' }, 'Geannuleerd')
        )
      );

      const terminalStep = tracker.container.querySelector('[data-step="terminal"]');
      expect(terminalStep).toBeTruthy();
      expect(terminalStep).toHaveTextContent('Geannuleerd');
    });

    it('should show cancelled as terminal branch in client view', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'client' },
          React.createElement('div', { 'data-step': '1', 'data-completed': 'true' }, 'Actief'),
          React.createElement('div', { 'data-step': '2', 'data-completed': 'true' }, 'Reacties'),
          React.createElement('div', { 'data-step': 'terminal', 'data-status': 'CANCELLED_BY_CONSUMER' }, 'Geannuleerd')
        )
      );

      const terminalStep = tracker.container.querySelector('[data-step="terminal"]');
      expect(terminalStep).toBeTruthy();
      expect(terminalStep).toHaveTextContent('Geannuleerd');
    });

    it('should show expired as terminal state', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'client' },
          React.createElement('div', { 'data-step': '1', 'data-completed': 'true' }, 'Actief'),
          React.createElement('div', { 'data-step': 'terminal', 'data-status': 'EXPIRED' }, 'Verlopen')
        )
      );

      const terminalStep = tracker.container.querySelector('[data-step="terminal"]');
      expect(terminalStep).toHaveAttribute('data-status', 'EXPIRED');
    });

    it('should show NO_MATCH as terminal state', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', 'data-view': 'client' },
          React.createElement('div', { 'data-step': '1', 'data-completed': 'true' }, 'Actief'),
          React.createElement('div', { 'data-step': 'terminal', 'data-status': 'NO_MATCH' }, 'Geen reacties')
        )
      );

      const terminalStep = tracker.container.querySelector('[data-step="terminal"]');
      expect(terminalStep).toHaveAttribute('data-status', 'NO_MATCH');
    });
  });

  describe('Visual indicators', () => {
    it('should use different styles for completed vs pending steps', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow' },
          React.createElement('div', { 'data-step': '1', 'data-completed': 'true', className: 'bg-green-100' }, 'Gekozen'),
          React.createElement('div', { 'data-step': '2', 'data-current': 'true', className: 'bg-blue-100' }, 'Ingepland'),
          React.createElement('div', { 'data-step': '3', 'data-completed': 'false', className: 'bg-gray-100' }, 'Bezig')
        )
      );

      const completedStep = tracker.container.querySelector('[data-completed="true"]');
      const currentStep = tracker.container.querySelector('[data-current="true"]');
      const pendingStep = tracker.container.querySelector('[data-completed="false"]');

      expect(completedStep).toHaveClass('bg-green-100');
      expect(currentStep).toHaveClass('bg-blue-100');
      expect(pendingStep).toHaveClass('bg-gray-100');
    });

    it('should show connecting lines between steps', () => {
      const tracker = render(
        React.createElement('div', { 'data-testid': 'status-flow', className: 'flex items-center' },
          React.createElement('div', { 'data-step': '1' }, 'Gekozen'),
          React.createElement('div', { 'data-connector': 'true', className: 'w-8 h-0.5 bg-gray-300' }),
          React.createElement('div', { 'data-step': '2' }, 'Ingepland'),
          React.createElement('div', { 'data-connector': 'true', className: 'w-8 h-0.5 bg-gray-300' }),
          React.createElement('div', { 'data-step': '3' }, 'Bezig')
        )
      );

      const connectors = tracker.container.querySelectorAll('[data-connector="true"]');
      expect(connectors.length).toBeGreaterThan(0);
    });
  });
});
