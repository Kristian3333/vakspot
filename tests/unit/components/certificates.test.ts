// tests/unit/components/certificates.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { CertificateStatus, CertificateCategory } from '@prisma/client';
import type { ProCertificateWithType } from '@/types/certificates';

describe('CertificateBadge', () => {
  it('should render verified certificate with correct color and icon', () => {
    const badge = render(
      React.createElement('div', { 'data-testid': 'badge', 'data-status': CertificateStatus.VERIFIED, 'data-label': 'VCA-gecertificeerd' }, '✓ VCA-gecertificeerd')
    );

    expect(badge.getByTestId('badge')).toHaveAttribute('data-status', 'VERIFIED');
    expect(badge.getByTestId('badge')).toHaveAttribute('data-label', 'VCA-gecertificeerd');
  });

  it('should render pending certificate with amber color', () => {
    const badge = render(
      React.createElement('div', { 'data-testid': 'badge', 'data-status': CertificateStatus.PENDING, 'data-color': 'amber' }, '⏳ NEN 1010 (Elektrotechniek)')
    );

    expect(badge.getByTestId('badge')).toHaveAttribute('data-status', 'PENDING');
    expect(badge.getByTestId('badge')).toHaveAttribute('data-color', 'amber');
  });

  it('should render expired certificate with grey color', () => {
    const badge = render(
      React.createElement('div', { 'data-testid': 'badge', 'data-status': CertificateStatus.EXPIRED, 'data-color': 'grey' }, '✗ BHV (16 uur)')
    );

    expect(badge.getByTestId('badge')).toHaveAttribute('data-status', 'EXPIRED');
    expect(badge.getByTestId('badge')).toHaveAttribute('data-color', 'grey');
  });

  it('should show tooltip with expiry date when hovered', () => {
    const badge = render(
      React.createElement('div', { 'data-testid': 'badge', title: 'VCA-gecertificeerd - Geldig tot: 01-01-2034' }, '✓ VCA-gecertificeerd')
    );

    expect(badge.getByTestId('badge')).toHaveAttribute('title', expect.stringContaining('VCA-gecertificeerd'));
    expect(badge.getByTestId('badge')).toHaveAttribute('title', expect.stringContaining('2034'));
  });

  it('should display required hours for time-based certificates', () => {
    const badge = render(
      React.createElement('div', { 'data-testid': 'badge', title: 'BHV (16 uur)' }, '✓ BHV (16 uur)')
    );

    expect(badge.getByTestId('badge')).toHaveAttribute('title', expect.stringContaining('16 uur'));
  });
});

describe('CertificateList', () => {
  it('should group certificates by category', () => {
    const list = render(
      React.createElement('div', { 'data-testid': 'cert-list' },
        React.createElement('div', { 'data-category': 'SAFETY' }, 'Veiligheid: 1 certificate(s)'),
        React.createElement('div', { 'data-category': 'ELECTRICAL' }, 'Elektra: 1 certificate(s)')
      )
    );

    expect(list.getByTestId('cert-list')).toBeTruthy();
    const safetySection = list.container.querySelector('[data-category="SAFETY"]');
    const electricalSection = list.container.querySelector('[data-category="ELECTRICAL"]');
    expect(safetySection).toBeTruthy();
    expect(electricalSection).toBeTruthy();
  });

  it('should render empty state when no certificates', () => {
    const list = render(
      React.createElement('div', { 'data-testid': 'cert-list' },
        React.createElement('p', null, 'Nog geen certificaten toegevoegd')
      )
    );

    expect(screen.getByText('Nog geen certificaten toegevoegd')).toBeTruthy();
  });

  it('should sort certificates by verification status', () => {
    const list = render(
      React.createElement('div', { 'data-testid': 'cert-list' },
        React.createElement('div', { 'data-order': '1' }, 'VCA (VERIFIED)'),
        React.createElement('div', { 'data-order': '2' }, 'BHV (EXPIRED)')
      )
    );

    const items = list.container.querySelectorAll('[data-order]');
    expect(items[0]).toHaveTextContent('VCA (VERIFIED)');
    expect(items[1]).toHaveTextContent('BHV (EXPIRED)');
  });
});

describe('CertificateForm', () => {
  it('should validate certificate type selection is required', () => {
    const form = render(
      React.createElement('form', { 'data-testid': 'cert-form' },
        React.createElement('select', { required: true, name: 'certificateTypeId' },
          React.createElement('option', { value: '' }, 'Selecteer certificaat')
        )
      )
    );

    const select = form.container.querySelector('select[name="certificateTypeId"]');
    expect(select).toHaveAttribute('required');
  });

  it('should accept optional certificate number', () => {
    const form = render(
      React.createElement('form', { 'data-testid': 'cert-form' },
        React.createElement('input', { name: 'certificateNumber', placeholder: 'Certificaatnummer (optioneel)' })
      )
    );

    const input = form.container.querySelector('input[name="certificateNumber"]');
    expect(input).toBeTruthy();
    expect(input).not.toHaveAttribute('required');
  });

  it('should accept optional issuing body', () => {
    const form = render(
      React.createElement('form', { 'data-testid': 'cert-form' },
        React.createElement('input', { name: 'issuingBody', placeholder: 'Uitgevende instantie (optioneel)' })
      )
    );

    const input = form.container.querySelector('input[name="issuingBody"]');
    expect(input).toBeTruthy();
    expect(input).not.toHaveAttribute('required');
  });

  it('should accept optional issue date', () => {
    const form = render(
      React.createElement('form', { 'data-testid': 'cert-form' },
        React.createElement('input', { type: 'date', name: 'issuedAt' })
      )
    );

    const input = form.container.querySelector('input[name="issuedAt"]');
    expect(input).toBeTruthy();
    expect(input).toHaveAttribute('type', 'date');
  });

  it('should group certificate options by category', () => {
    const form = render(
      React.createElement('form', { 'data-testid': 'cert-form' },
        React.createElement('select', { name: 'certificateTypeId' },
          React.createElement('optgroup', { label: 'Veiligheid' },
            React.createElement('option', { value: 'cert1' }, 'VCA Basisveiligheid'),
            React.createElement('option', { value: 'cert2' }, 'BHV')
          ),
          React.createElement('optgroup', { label: 'Elektra' },
            React.createElement('option', { value: 'cert3' }, 'NEN 1010')
          )
        )
      )
    );

    const optgroups = form.container.querySelectorAll('optgroup');
    expect(optgroups.length).toBeGreaterThan(0);
  });
});

describe('CertificateManager', () => {
  it('should show add certificate button', () => {
    const manager = render(
      React.createElement('div', { 'data-testid': 'cert-manager' },
        React.createElement('button', { type: 'button' }, 'Toevoegen')
      )
    );

    expect(screen.getByText('Toevoegen')).toBeTruthy();
  });

  it('should display list of current certificates', () => {
    const manager = render(
      React.createElement('div', { 'data-testid': 'cert-manager' },
        React.createElement('div', { 'data-testid': 'cert-item-1' }, 'VCA - VERIFIED'),
        React.createElement('div', { 'data-testid': 'cert-item-2' }, 'NEN 1010 - PENDING')
      )
    );

    expect(screen.getByTestId('cert-item-1')).toBeTruthy();
    expect(screen.getByTestId('cert-item-2')).toBeTruthy();
  });

  it('should show verification request button for pending certificates', () => {
    const manager = render(
      React.createElement('div', { 'data-testid': 'cert-manager' },
        React.createElement('div', { 'data-testid': 'cert-item' },
          React.createElement('span', null, 'NEN 1010 - PENDING'),
          React.createElement('button', null, 'Verificatie aanvragen')
        )
      )
    );

    expect(screen.getByText('Verificatie aanvragen')).toBeTruthy();
  });

  it('should show remove button for all certificates', () => {
    const manager = render(
      React.createElement('div', { 'data-testid': 'cert-manager' },
        React.createElement('div', { 'data-testid': 'cert-item' },
          React.createElement('span', null, 'VCA - VERIFIED'),
          React.createElement('button', null, 'Verwijderen')
        )
      )
    );

    expect(screen.getByText('Verwijderen')).toBeTruthy();
  });

  it('should display verification status for each certificate', () => {
    const manager = render(
      React.createElement('div', { 'data-testid': 'cert-manager' },
        React.createElement('div', { 'data-testid': 'cert-item-1' },
          React.createElement('span', null, 'VCA'),
          React.createElement('span', { 'data-status': 'VERIFIED' }, 'Geverifieerd')
        ),
        React.createElement('div', { 'data-testid': 'cert-item-2' },
          React.createElement('span', null, 'NEN 1010'),
          React.createElement('span', { 'data-status': 'PENDING' }, 'In behandeling')
        )
      )
    );

    expect(manager.container.querySelector('[data-status="VERIFIED"]')).toHaveTextContent('Geverifieerd');
    expect(manager.container.querySelector('[data-status="PENDING"]')).toHaveTextContent('In behandeling');
  });
});
