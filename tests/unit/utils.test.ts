// tests/unit/utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  calculateDistance,
  truncate,
  slugify,
  isValidEmail,
  isValidPostcode,
  isValidPhone,
  isValidKvk,
  getInitials,
} from '@/lib/utils';

describe('cn (classname merge)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active', false && 'hidden')).toBe('base active');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('p-4', 'p-6')).toBe('p-6');
  });
});

describe('formatCurrency', () => {
  it('formats cents to EUR', () => {
    expect(formatCurrency(10000)).toContain('100');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });

  it('handles decimals', () => {
    const result = formatCurrency(1050);
    expect(result).toContain('10');
  });
});

describe('formatDate', () => {
  it('formats date in Dutch locale', () => {
    const date = new Date('2024-03-15');
    const result = formatDate(date);
    expect(result).toContain('2024');
    expect(result).toContain('maart');
  });

  it('accepts string dates', () => {
    const result = formatDate('2024-06-01');
    expect(result).toContain('juni');
  });
});

describe('formatRelativeTime', () => {
  it('shows "Zojuist" for recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('Zojuist');
  });

  it('shows hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toContain('uur');
  });

  it('shows days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toContain('dag');
  });
});

describe('calculateDistance', () => {
  it('returns 0 for same coordinates', () => {
    const result = calculateDistance(52.3676, 4.9041, 52.3676, 4.9041);
    expect(result).toBe(0);
  });

  it('calculates distance between Amsterdam and Rotterdam', () => {
    // Amsterdam: 52.3676, 4.9041
    // Rotterdam: 51.9244, 4.4777
    const result = calculateDistance(52.3676, 4.9041, 51.9244, 4.4777);
    // Should be approximately 57 km
    expect(result).toBeGreaterThan(50);
    expect(result).toBeLessThan(65);
  });

  it('calculates distance between Amsterdam and Utrecht', () => {
    // Amsterdam: 52.3676, 4.9041
    // Utrecht: 52.0907, 5.1214
    const result = calculateDistance(52.3676, 4.9041, 52.0907, 5.1214);
    // Should be approximately 35 km
    expect(result).toBeGreaterThan(30);
    expect(result).toBeLessThan(45);
  });
});

describe('truncate', () => {
  it('returns original text if shorter than maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Héllo Wörld!')).toBe('hllo-wrld');
  });

  it('replaces spaces with dashes', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('removes leading/trailing dashes', () => {
    expect(slugify(' hello ')).toBe('hello');
  });
});

describe('isValidEmail', () => {
  it('validates correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('rejects invalid email without @', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('rejects invalid email without domain', () => {
    expect(isValidEmail('test@')).toBe(false);
  });
});

describe('isValidPostcode', () => {
  it('validates Dutch postcode with space', () => {
    expect(isValidPostcode('1234 AB')).toBe(true);
  });

  it('validates Dutch postcode without space', () => {
    expect(isValidPostcode('1234AB')).toBe(true);
  });

  it('rejects postcode starting with 0', () => {
    expect(isValidPostcode('0123 AB')).toBe(false);
  });

  it('rejects invalid format', () => {
    expect(isValidPostcode('12345')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('validates Dutch mobile number', () => {
    expect(isValidPhone('0612345678')).toBe(true);
  });

  it('validates with +31 prefix', () => {
    expect(isValidPhone('+31612345678')).toBe(true);
  });

  it('validates with dashes', () => {
    expect(isValidPhone('06-12345678')).toBe(true);
  });

  it('rejects too short numbers', () => {
    expect(isValidPhone('061234567')).toBe(false);
  });
});

describe('isValidKvk', () => {
  it('validates 8-digit KVK', () => {
    expect(isValidKvk('12345678')).toBe(true);
  });

  it('validates with spaces', () => {
    expect(isValidKvk('1234 5678')).toBe(true);
  });

  it('rejects too short', () => {
    expect(isValidKvk('1234567')).toBe(false);
  });

  it('rejects too long', () => {
    expect(isValidKvk('123456789')).toBe(false);
  });
});

describe('getInitials', () => {
  it('returns first letters of each word', () => {
    expect(getInitials('Jan de Vries')).toBe('JD');
  });

  it('handles single name', () => {
    expect(getInitials('Jan')).toBe('J');
  });

  it('returns uppercase', () => {
    expect(getInitials('jan vries')).toBe('JV');
  });

  it('limits to 2 characters', () => {
    expect(getInitials('Jan de Vries Junior')).toBe('JD');
  });
});
