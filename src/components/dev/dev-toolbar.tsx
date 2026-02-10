'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { User, RefreshCw, X } from 'lucide-react';

export function DevToolbar() {
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const handleCreateTestData = async (scenario: 'basic' | 'complete' | 'multi-pro') => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/dev-tools/create-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Test data created!\n\nClient: ${data.clientEmail}\nPassword: ${data.password}\n\nCheck console for details.`);
        console.log('Test data created:', data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Create test data error:', error);
      alert('Failed to create test data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg shadow-lg font-medium"
        >
          Dev Tools
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-900 text-white shadow-2xl border-t-2 border-brand-500">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-800 px-3 py-1.5 rounded-md">
              <User className="h-4 w-4 text-brand-400" />
              <div className="text-xs">
                <div className="font-medium">{session.user.email}</div>
                <div className="text-surface-400">
                  {session.user.role} • ID: {session.user.id.slice(0, 8)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <button
              onClick={() => handleCreateTestData('basic')}
              disabled={isLoading}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-surface-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
            >
              {isLoading ? 'Creating...' : 'Basic Scenario'}
            </button>
            <button
              onClick={() => handleCreateTestData('complete')}
              disabled={isLoading}
              className="bg-success-600 hover:bg-success-700 disabled:bg-surface-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
            >
              Complete Scenario
            </button>
            <button
              onClick={() => handleCreateTestData('multi-pro')}
              disabled={isLoading}
              className="bg-warning-600 hover:bg-warning-700 disabled:bg-surface-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
            >
              Multi-PRO Scenario
            </button>
            {session.user.role === 'ADMIN' && (
              <a
                href="/admin/dev-tools"
                className="bg-error-600 hover:bg-error-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
              >
                Dev Tools Admin
              </a>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="p-1.5 hover:bg-surface-800 rounded transition-colors"
              title="Refresh page"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 hover:bg-surface-800 rounded transition-colors"
              title="Collapse toolbar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Environment Badge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="bg-warning-500 text-surface-900 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
            Development Mode
          </div>
        </div>
      </div>
    </div>
  );
}
