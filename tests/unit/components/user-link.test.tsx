// tests/unit/components/user-link.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserLink } from '@/components/ui/user-link';

describe('UserLink Component', () => {
  it('should render user name as a clickable link', () => {
    render(
      <UserLink
        userId="user-123"
        name="Jan de Vries"
      />
    );

    const link = screen.getByRole('link', { name: /Jan de Vries/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/profile/user-123');
  });

  it('should display user avatar with name', () => {
    render(
      <UserLink
        userId="user-456"
        name="Maria Jansen"
        image="https://example.com/avatar.jpg"
      />
    );

    const avatar = screen.getByAltText(/Maria Jansen/i);
    expect(avatar).toBeInTheDocument();
  });

  it('should render with small size by default', () => {
    const { container } = render(
      <UserLink
        userId="user-789"
        name="Pieter Bakker"
      />
    );

    // Avatar should have small size classes
    const avatarContainer = container.querySelector('.w-8.h-8');
    expect(avatarContainer).toBeInTheDocument();
  });

  it('should render with medium size when specified', () => {
    const { container } = render(
      <UserLink
        userId="user-101"
        name="Sophie van Dijk"
        size="md"
      />
    );

    // Avatar should have medium size classes
    const avatarContainer = container.querySelector('.w-10.h-10');
    expect(avatarContainer).toBeInTheDocument();
  });

  it('should display initials when no image provided', () => {
    render(
      <UserLink
        userId="user-202"
        name="Karel de Groot"
      />
    );

    // Avatar component will show initials (first letter of first and last word)
    expect(screen.getByText('KD')).toBeInTheDocument();
  });

  it('should handle null name gracefully', () => {
    render(
      <UserLink
        userId="user-303"
        name={null}
      />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Onbekend');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <UserLink
        userId="user-404"
        name="Lisa Vermeer"
        className="custom-class"
      />
    );

    const link = container.querySelector('.custom-class');
    expect(link).toBeInTheDocument();
  });

  it('should show hover effect on link', () => {
    const { container } = render(
      <UserLink
        userId="user-505"
        name="Thomas Hendriks"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('hover:bg-surface-50');
  });

  it('should render company name when provided', () => {
    render(
      <UserLink
        userId="user-606"
        name="Erik Mulder"
        companyName="Mulder Installaties BV"
      />
    );

    expect(screen.getByText('Mulder Installaties BV')).toBeInTheDocument();
    expect(screen.getByText('Erik Mulder')).toBeInTheDocument();
  });

  it('should prioritize company name in display', () => {
    render(
      <UserLink
        userId="user-707"
        name="Anna de Boer"
        companyName="De Boer Loodgieters"
      />
    );

    const mainText = screen.getByText('De Boer Loodgieters');
    const subText = screen.getByText('Anna de Boer');

    // Company name should be bold/prominent
    expect(mainText).toHaveClass('font-medium');
    // Personal name should be smaller/subdued
    expect(subText).toHaveClass('text-sm', 'text-surface-500');
  });
});
