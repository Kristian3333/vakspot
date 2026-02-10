'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import {
  Users,
  PlayCircle,
  Database,
  Link as LinkIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface TestUser {
  id: string;
  email: string;
  role: string;
  name: string | null;
}

interface Job {
  id: string;
  title: string;
  status: string;
}

export function DevToolsClient() {
  const [users, setUsers] = useState<TestUser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUsers();
    loadJobs();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=10');
      const data = await response.json();
      if (response.ok && data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/jobs?limit=10');
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSwitchUser = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/dev-tools/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', `Switched to: ${data.user.email} (${data.user.role})`);
        console.log('Switched user:', data);
      } else {
        showMessage('error', data.error || 'Failed to switch user');
      }
    } catch (error) {
      console.error('Switch user error:', error);
      showMessage('error', 'Failed to switch user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScenario = async (scenario: 'basic' | 'complete' | 'multi-pro') => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/dev-tools/create-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', `${scenario} scenario created! Check console for details.`);
        console.log('Test data created:', data);
        // Reload users and jobs
        await loadUsers();
        await loadJobs();
      } else {
        showMessage('error', data.error || 'Failed to create test data');
      }
    } catch (error) {
      console.error('Create scenario error:', error);
      showMessage('error', 'Failed to create test data');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFlow = async (jobId: string, toStatus: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/dev-tools/simulate-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, toStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', `Job status changed to ${toStatus}`);
        console.log('Flow simulated:', data);
        await loadJobs();
      } else {
        showMessage('error', data.error || 'Failed to simulate flow');
      }
    } catch (error) {
      console.error('Simulate flow error:', error);
      showMessage('error', 'Failed to simulate flow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Status Message */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg ${
            message.type === 'success'
              ? 'bg-success-100 text-success-800 border border-success-200'
              : 'bg-error-100 text-error-800 border border-error-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* User Switcher */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Users className="h-5 w-5 text-brand-500" />
          <h2 className="text-xl font-semibold text-surface-900">User Switcher</h2>
        </div>
        <p className="text-sm text-surface-600 mb-4">
          Impersonate any user for testing purposes
        </p>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-surface-500">No users found. Create some test data first.</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-surface-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-surface-900">{user.name || 'No name'}</div>
                  <div className="text-sm text-surface-600">{user.email}</div>
                  <div className="text-xs text-surface-500 mt-1">
                    Role: <span className="font-medium">{user.role}</span> • ID: {user.id.slice(0, 8)}
                  </div>
                </div>
                <button
                  onClick={() => handleSwitchUser(user.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-surface-300 text-white text-sm font-medium rounded transition-colors"
                >
                  Switch
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Flow Simulator */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <PlayCircle className="h-5 w-5 text-brand-500" />
          <h2 className="text-xl font-semibold text-surface-900">Flow Simulator</h2>
        </div>
        <p className="text-sm text-surface-600 mb-4">
          Simulate job status transitions for testing
        </p>
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-sm text-surface-500">No jobs found. Create some test data first.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="p-4 bg-surface-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-surface-900">{job.title}</h3>
                    <div className="text-sm text-surface-600 mt-1">
                      Current status: <span className="font-medium">{job.status}</span>
                    </div>
                    <div className="text-xs text-surface-500 mt-1">ID: {job.id.slice(0, 8)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['CREATED', 'RESPONSES_RECEIVED', 'IN_CONVERSATION', 'SELECTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED_BY_CONSUMER', 'REVIEWED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleSimulateFlow(job.id, status)}
                      disabled={loading || job.status === status}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        job.status === status
                          ? 'bg-brand-100 text-brand-700 cursor-not-allowed'
                          : 'bg-white border border-surface-300 hover:bg-surface-50 text-surface-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Test Data Generator */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Database className="h-5 w-5 text-brand-500" />
          <h2 className="text-xl font-semibold text-surface-900">Test Data Generator</h2>
        </div>
        <p className="text-sm text-surface-600 mb-4">
          Generate realistic test data for different scenarios
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => handleCreateScenario('basic')}
            disabled={loading}
            className="p-4 bg-brand-50 hover:bg-brand-100 border-2 border-brand-200 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-semibold text-brand-900 mb-1">Basic Scenario</div>
            <div className="text-sm text-brand-700">
              1 client + 1 PRO + 1 active job
            </div>
          </button>
          <button
            onClick={() => handleCreateScenario('complete')}
            disabled={loading}
            className="p-4 bg-success-50 hover:bg-success-100 border-2 border-success-200 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-semibold text-success-900 mb-1">Complete Scenario</div>
            <div className="text-sm text-success-700">
              Full lifecycle with review
            </div>
          </button>
          <button
            onClick={() => handleCreateScenario('multi-pro')}
            disabled={loading}
            className="p-4 bg-warning-50 hover:bg-warning-100 border-2 border-warning-200 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="font-semibold text-warning-900 mb-1">Multi-PRO Scenario</div>
            <div className="text-sm text-warning-700">
              1 job + 3 interested PROs
            </div>
          </button>
        </div>
        {loading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-surface-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <LinkIcon className="h-5 w-5 text-brand-500" />
          <h2 className="text-xl font-semibold text-surface-900">Quick Links</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin"
            className="p-3 bg-surface-50 hover:bg-surface-100 rounded-lg text-surface-900 font-medium transition-colors"
          >
            Admin Dashboard
          </a>
          <a
            href="/admin/users"
            className="p-3 bg-surface-50 hover:bg-surface-100 rounded-lg text-surface-900 font-medium transition-colors"
          >
            User Management
          </a>
          <a
            href="/admin/analytics"
            className="p-3 bg-surface-50 hover:bg-surface-100 rounded-lg text-surface-900 font-medium transition-colors"
          >
            Analytics
          </a>
          <a
            href="/client/dashboard"
            className="p-3 bg-surface-50 hover:bg-surface-100 rounded-lg text-surface-900 font-medium transition-colors"
          >
            Client Dashboard
          </a>
          <a
            href="/pro/dashboard"
            className="p-3 bg-surface-50 hover:bg-surface-100 rounded-lg text-surface-900 font-medium transition-colors"
          >
            PRO Dashboard
          </a>
          <a
            href="/api/debug/conversations"
            className="p-3 bg-surface-50 hover:bg-surface-100 rounded-lg text-surface-900 font-medium transition-colors"
          >
            Debug API
          </a>
        </div>
      </Card>
    </>
  );
}
