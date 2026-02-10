// src/components/certificates/certificate-form.tsx
'use client';

import { useState } from 'react';
import { CertificateCategory } from '@prisma/client';
import type { CertificateTypeInfo } from '@/types/certificates';
import { Button, Input } from '@/components/ui';
import { Plus } from 'lucide-react';

interface CertificateFormProps {
  certificateTypes: CertificateTypeInfo[];
  onSubmit: (data: CertificateFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface CertificateFormData {
  certificateTypeId: string;
  certificateNumber?: string;
  issuingBody?: string;
  issuedAt?: string;
}

const CATEGORY_LABELS: Record<CertificateCategory, string> = {
  SAFETY: 'Veiligheid',
  ELECTRICAL: 'Elektra',
  INSTALLATION: 'Installatie',
  EDUCATION: 'Opleiding',
  CONSTRUCTION: 'Bouw',
  GENERAL: 'Algemeen',
};

export function CertificateForm({ certificateTypes, onSubmit, isSubmitting = false }: CertificateFormProps) {
  const [formData, setFormData] = useState<CertificateFormData>({
    certificateTypeId: '',
    certificateNumber: '',
    issuingBody: '',
    issuedAt: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.certificateTypeId) return;

    await onSubmit({
      certificateTypeId: formData.certificateTypeId,
      certificateNumber: formData.certificateNumber || undefined,
      issuingBody: formData.issuingBody || undefined,
      issuedAt: formData.issuedAt || undefined,
    });

    // Reset form
    setFormData({
      certificateTypeId: '',
      certificateNumber: '',
      issuingBody: '',
      issuedAt: '',
    });
  };

  // Group certificate types by category
  const groupedTypes = certificateTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<CertificateCategory, CertificateTypeInfo[]>);

  return (
    <form onSubmit={handleSubmit} data-testid="cert-form" className="space-y-4">
      <div>
        <label htmlFor="certificateTypeId" className="block text-sm font-medium text-surface-700 mb-2">
          Certificaat type *
        </label>
        <select
          id="certificateTypeId"
          name="certificateTypeId"
          required
          value={formData.certificateTypeId}
          onChange={(e) => setFormData({ ...formData, certificateTypeId: e.target.value })}
          className="block w-full rounded-lg border border-surface-300 px-3 py-2 text-surface-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Selecteer certificaat</option>
          {Object.entries(groupedTypes).map(([category, types]) => (
            <optgroup key={category} label={CATEGORY_LABELS[category as CertificateCategory]}>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <Input
        label="Certificaatnummer (optioneel)"
        name="certificateNumber"
        placeholder="Bijvoorbeeld: VCA12345"
        value={formData.certificateNumber}
        onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
      />

      <Input
        label="Uitgevende instantie (optioneel)"
        name="issuingBody"
        placeholder="Bijvoorbeeld: SSVV, Kiwa"
        value={formData.issuingBody}
        onChange={(e) => setFormData({ ...formData, issuingBody: e.target.value })}
      />

      <Input
        label="Datum behaald (optioneel)"
        name="issuedAt"
        type="date"
        value={formData.issuedAt}
        onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
      />

      <Button
        type="submit"
        disabled={!formData.certificateTypeId || isSubmitting}
        isLoading={isSubmitting}
        leftIcon={<Plus className="h-4 w-4" />}
      >
        Toevoegen
      </Button>
    </form>
  );
}
