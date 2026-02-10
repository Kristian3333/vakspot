// src/components/certificates/certificate-manager.tsx
'use client';

import { useState } from 'react';
import { CertificateStatus } from '@prisma/client';
import type { ProCertificateWithType, CertificateTypeInfo } from '@/types/certificates';
import { CertificateBadge } from './certificate-badge';
import { CertificateForm, type CertificateFormData } from './certificate-form';
import { Button, Card } from '@/components/ui';
import { Trash2, Send } from 'lucide-react';

interface CertificateManagerProps {
  certificates: ProCertificateWithType[];
  certificateTypes: CertificateTypeInfo[];
  onAdd: (data: CertificateFormData) => Promise<void>;
  onRemove: (certificateId: string) => Promise<void>;
  onRequestVerification: (certificateId: string) => Promise<void>;
}

export function CertificateManager({
  certificates,
  certificateTypes,
  onAdd,
  onRemove,
  onRequestVerification,
}: CertificateManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [requestingVerificationId, setRequestingVerificationId] = useState<string | null>(null);

  const handleAdd = async (data: CertificateFormData) => {
    setIsSubmitting(true);
    try {
      await onAdd(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (certificateId: string) => {
    setRemovingId(certificateId);
    try {
      await onRemove(certificateId);
    } finally {
      setRemovingId(null);
    }
  };

  const handleRequestVerification = async (certificateId: string) => {
    setRequestingVerificationId(certificateId);
    try {
      await onRequestVerification(certificateId);
    } finally {
      setRequestingVerificationId(null);
    }
  };

  const getStatusLabel = (status: CertificateStatus): string => {
    switch (status) {
      case CertificateStatus.VERIFIED:
        return 'Geverifieerd';
      case CertificateStatus.PENDING:
        return 'In behandeling';
      case CertificateStatus.EXPIRED:
        return 'Verlopen';
      case CertificateStatus.REJECTED:
        return 'Afgekeurd';
      default:
        return 'Onbekend';
    }
  };

  return (
    <div data-testid="cert-manager" className="space-y-6">
      {/* Add certificate form */}
      <Card>
        <h3 className="text-lg font-semibold text-surface-900 mb-4">
          Certificaat toevoegen
        </h3>
        <CertificateForm
          certificateTypes={certificateTypes}
          onSubmit={handleAdd}
          isSubmitting={isSubmitting}
        />
      </Card>

      {/* List of certificates */}
      {certificates.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-surface-900 mb-4">
            Mijn certificaten
          </h3>
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                data-testid={`cert-item-${cert.id}`}
                className="flex items-center justify-between gap-4 p-3 rounded-lg border border-surface-200 bg-surface-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CertificateBadge certificate={cert} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-surface-500">
                    <span data-status={cert.status}>
                      {getStatusLabel(cert.status)}
                    </span>
                    {cert.certificateNumber && (
                      <>
                        <span>•</span>
                        <span>Nr: {cert.certificateNumber}</span>
                      </>
                    )}
                    {cert.issuingBody && (
                      <>
                        <span>•</span>
                        <span>{cert.issuingBody}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cert.status === CertificateStatus.PENDING && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestVerification(cert.id)}
                      isLoading={requestingVerificationId === cert.id}
                      leftIcon={<Send className="h-3 w-3" />}
                    >
                      Verificatie aanvragen
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(cert.id)}
                    isLoading={removingId === cert.id}
                    leftIcon={<Trash2 className="h-3 w-3" />}
                  >
                    Verwijderen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
