// src/components/ui/user-link.tsx
import Link from 'next/link';
import { Avatar } from './avatar';
import { cn } from '@/lib/utils';

type UserLinkSize = 'sm' | 'md' | 'lg';

interface UserLinkProps {
  userId: string;
  name: string | null;
  image?: string | null;
  companyName?: string | null;
  size?: UserLinkSize;
  className?: string;
}

const sizeStyles: Record<UserLinkSize, { avatar: 'xs' | 'sm' | 'md' | 'lg'; text: string }> = {
  sm: { avatar: 'sm', text: 'text-sm' },
  md: { avatar: 'md', text: 'text-base' },
  lg: { avatar: 'lg', text: 'text-lg' },
};

export function UserLink({
  userId,
  name,
  image,
  companyName,
  size = 'sm',
  className,
}: UserLinkProps) {
  const styles = sizeStyles[size];
  const displayName = name || 'Onbekend';

  return (
    <Link
      href={`/profile/${userId}`}
      className={cn(
        'inline-flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-surface-50',
        className
      )}
    >
      <Avatar src={image} name={displayName} size={styles.avatar} />
      <div className="flex flex-col min-w-0">
        {companyName ? (
          <>
            <span className={cn('font-medium text-surface-900', styles.text)}>
              {companyName}
            </span>
            <span className="text-sm text-surface-500">{displayName}</span>
          </>
        ) : (
          <span className={cn('font-medium text-surface-900', styles.text)}>
            {displayName}
          </span>
        )}
      </div>
    </Link>
  );
}
