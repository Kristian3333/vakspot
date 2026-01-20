// src/components/ui/avatar.tsx
import { cn, getInitials } from '@/lib/utils';
import Image from 'next/image';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; pixels: number }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs', pixels: 24 },
  sm: { container: 'w-8 h-8', text: 'text-xs', pixels: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', pixels: 40 },
  lg: { container: 'w-12 h-12', text: 'text-base', pixels: 48 },
  xl: { container: 'w-16 h-16', text: 'text-lg', pixels: 64 },
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const styles = sizeStyles[size];
  const initials = name ? getInitials(name) : '?';

  // Generate consistent color based on name
  const colorIndex = name ? name.charCodeAt(0) % 5 : 0;
  const bgColors = [
    'bg-brand-100 text-brand-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
  ];

  if (src) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-surface-100',
          styles.container,
          className
        )}
      >
        <Image
          src={src}
          alt={name || 'Avatar'}
          fill
          className="object-cover"
          sizes={`${styles.pixels}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-medium',
        styles.container,
        styles.text,
        bgColors[colorIndex],
        className
      )}
    >
      {initials}
    </div>
  );
}

// Avatar group for showing multiple avatars
interface AvatarGroupProps {
  avatars: Array<{ src?: string | null; name?: string | null }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-surface-200 text-surface-600 font-medium ring-2 ring-white',
            sizeStyles[size].container,
            sizeStyles[size].text
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
