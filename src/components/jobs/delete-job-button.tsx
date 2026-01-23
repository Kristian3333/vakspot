// src/components/jobs/delete-job-button.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteJobButtonProps {
  jobId: string;
  jobTitle: string;
}

export function DeleteJobButton({ jobId, jobTitle }: DeleteJobButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verwijderen mislukt');
      }

      // Redirect to jobs list
      router.push('/client/jobs');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="p-4 rounded-xl border border-error-200 bg-error-50">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-error-100">
            <AlertTriangle className="h-5 w-5 text-error-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-surface-900">Klus verwijderen?</h3>
            <p className="mt-1 text-sm text-surface-600">
              Weet u zeker dat u "{jobTitle}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
            </p>
            {error && (
              <p className="mt-2 text-sm text-error-600">{error}</p>
            )}
            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
              >
                Annuleren
              </Button>
              <Button
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="bg-error-600 hover:bg-error-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Definitief verwijderen
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="text-error-600 border-error-200 hover:bg-error-50"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Verwijderen
    </Button>
  );
}
