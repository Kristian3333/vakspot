// src/components/certificates/certificate-list.tsx
import { CertificateCategory, CertificateStatus } from '@prisma/client';
import type { ProCertificateWithType } from '@/types/certificates';
import { CertificateBadge } from './certificate-badge';

interface CertificateListProps {
  certificates: ProCertificateWithType[];
  emptyMessage?: string;
}

const CATEGORY_LABELS: Record<CertificateCategory, string> = {
  SAFETY: 'Veiligheid',
  ELECTRICAL: 'Elektra',
  INSTALLATION: 'Installatie',
  EDUCATION: 'Opleiding',
  CONSTRUCTION: 'Bouw',
  GENERAL: 'Algemeen',
};

const CATEGORY_ORDER: CertificateCategory[] = [
  CertificateCategory.SAFETY,
  CertificateCategory.ELECTRICAL,
  CertificateCategory.INSTALLATION,
  CertificateCategory.EDUCATION,
  CertificateCategory.CONSTRUCTION,
  CertificateCategory.GENERAL,
];

export function CertificateList({ certificates, emptyMessage = 'Nog geen certificaten toegevoegd' }: CertificateListProps) {
  if (!certificates || certificates.length === 0) {
    return (
      <div className="text-center py-8 text-surface-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Group certificates by category
  const groupedCerts = certificates.reduce((acc, cert) => {
    const category = cert.certificateType.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(cert);
    return acc;
  }, {} as Record<CertificateCategory, ProCertificateWithType[]>);

  // Sort certificates within each category by status (verified first, then pending, then expired)
  const statusOrder = {
    [CertificateStatus.VERIFIED]: 1,
    [CertificateStatus.PENDING]: 2,
    [CertificateStatus.EXPIRED]: 3,
    [CertificateStatus.REJECTED]: 4,
  };

  Object.keys(groupedCerts).forEach((category) => {
    groupedCerts[category as CertificateCategory].sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      return orderA - orderB;
    });
  });

  return (
    <div data-testid="cert-list" className="space-y-6">
      {CATEGORY_ORDER.map((category) => {
        const certs = groupedCerts[category];
        if (!certs || certs.length === 0) return null;

        return (
          <div key={category} data-category={category}>
            <h4 className="text-sm font-semibold text-surface-700 mb-2">
              {CATEGORY_LABELS[category]}
            </h4>
            <div className="flex flex-wrap gap-2">
              {certs.map((cert) => (
                <CertificateBadge key={cert.id} certificate={cert} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
