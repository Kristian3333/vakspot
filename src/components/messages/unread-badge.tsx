// src/components/messages/unread-badge.tsx
'use client';

import { useEffect, useState } from 'react';

interface UnreadBadgeProps {
  className?: string;
}

export function UnreadBadge({ className }: UnreadBadgeProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/messages/unread');
        const data = await response.json();
        setCount(data.count || 0);
      } catch {
        // Silently fail
      }
    };

    // Fetch immediately
    fetchCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, []);

  if (count === 0) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-semibold text-white bg-error-500 rounded-full ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
