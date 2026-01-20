// src/components/ui/badge.tsx
import { cn } from '@/lib/utils';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-brand-100 text-brand-700',
  secondary: 'bg-surface-100 text-surface-700',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  error: 'bg-error-50 text-error-600',
  neutral: 'bg-surface-100 text-surface-600',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({
  className,
  variant = 'neutral',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Status badge with dot indicator
interface StatusBadgeProps extends BadgeProps {
  dot?: boolean;
}

export function StatusBadge({
  dot = true,
  children,
  variant = 'neutral',
  ...props
}: StatusBadgeProps) {
  const dotColors: Record<BadgeVariant, string> = {
    primary: 'bg-brand-500',
    secondary: 'bg-surface-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    neutral: 'bg-surface-400',
  };

  return (
    <Badge variant={variant} {...props}>
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant])} />
      )}
      {children}
    </Badge>
  );
}
