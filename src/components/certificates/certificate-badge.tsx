// src/components/certificates/certificate-badge.tsx
import { CertificateStatus } from '@prisma/client';
import type { ProCertificateWithType } from '@/types/certificates';
import { formatCertificateBadge } from '@/lib/certificates';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface CertificateBadgeProps {
  certificate: ProCertificateWithType;
  showTooltip?: boolean;
}

export function CertificateBadge({ certificate, showTooltip = true }: CertificateBadgeProps) {
  const badge = formatCertificateBadge(certificate);

  // Map status to colors
  const colorClasses = {
    green: 'bg-success-50 text-success-700 border-success-200',
    yellow: 'bg-warning-50 text-warning-700 border-warning-200',
    amber: 'bg-warning-50 text-warning-700 border-warning-200',
    red: 'bg-error-50 text-error-700 border-error-200',
    grey: 'bg-surface-100 text-surface-600 border-surface-300',
    gray: 'bg-surface-100 text-surface-600 border-surface-300',
  };

  // Map status to icons
  const getIcon = () => {
    switch (certificate.status) {
      case CertificateStatus.VERIFIED:
        return <CheckCircle2 className="h-3 w-3" />;
      case CertificateStatus.PENDING:
        return <Clock className="h-3 w-3" />;
      case CertificateStatus.EXPIRED:
        return <XCircle className="h-3 w-3" />;
      case CertificateStatus.REJECTED:
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  // Build tooltip content
  const tooltipContent = () => {
    const parts = [badge.label];

    if (certificate.expiresAt) {
      const expiryDate = new Date(certificate.expiresAt).toLocaleDateString('nl-NL');
      parts.push(`Geldig tot: ${expiryDate}`);
    }

    if (certificate.certificateType.requiredHours) {
      parts.push(`${certificate.certificateType.requiredHours} uur`);
    }

    return parts.join(' - ');
  };

  const colorClass = colorClasses[badge.color as keyof typeof colorClasses] || colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}
      title={showTooltip ? tooltipContent() : undefined}
      data-status={certificate.status}
      data-label={badge.label}
      data-color={badge.color}
    >
      {getIcon()}
      {badge.label}
    </span>
  );
}
