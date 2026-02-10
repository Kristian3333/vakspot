// src/app/(dashboard)/pro/profile/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Textarea, Avatar, Spinner, Select } from '@/components/ui';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';
import { CertificateManager } from '@/components/certificates/certificate-manager';
import type { ProCertificateWithType, CertificateTypeInfo } from '@/types/certificates';
import type { CertificateFormData } from '@/components/certificates/certificate-form';

type Category = {
  id: string;
  name: string;
};

type ProProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  proProfile?: {
    id: string;
    companyName: string | null;
    kvkNumber: string | null;
    entityType: 'BUSINESS' | 'INDIVIDUAL' | null;
    phone: string | null;
    description: string | null;
    locationCity: string | null;
    locationPostcode: string | null;
    serviceRadius: number | null;
    categories: { categoryId: string }[];
    certificates?: ProCertificateWithType[];
  } | null;
};

export default function EditProProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [certificateTypes, setCertificateTypes] = useState<CertificateTypeInfo[]>([]);
  const [certificates, setCertificates] = useState<ProCertificateWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    kvkNumber: '',
    entityType: 'INDIVIDUAL' as 'BUSINESS' | 'INDIVIDUAL',
    phone: '',
    postcode: '',
    description: '',
    serviceRadius: 25,
    categories: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/pro/profile').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
      fetch('/api/certificates/types').then(res => res.json()),
    ])
      .then(([profileData, categoriesData, certTypesData]) => {
        if (profileData && !profileData.error) {
          setProfile(profileData);
          setCertificates(profileData.proProfile?.certificates || []);
          setFormData({
            companyName: profileData.proProfile?.companyName || '',
            kvkNumber: profileData.proProfile?.kvkNumber || '',
            entityType: profileData.proProfile?.entityType || 'INDIVIDUAL',
            phone: profileData.proProfile?.phone || '',
            postcode: profileData.proProfile?.locationPostcode || '',
            description: profileData.proProfile?.description || '',
            serviceRadius: profileData.proProfile?.serviceRadius || 25,
            categories: profileData.proProfile?.categories?.map((c: { categoryId: string }) => c.categoryId) || [],
          });
        }
        setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.categories || []);
        setCertificateTypes(Array.isArray(certTypesData) ? certTypesData : certTypesData.certificateTypes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/pro/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Opslaan mislukt');
      }

      setSuccess(true);
      setTimeout(() => router.push('/pro/profile'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt');
    }
    setSaving(false);
  };

  const handleAddCertificate = async (data: CertificateFormData) => {
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Toevoegen mislukt');
      }

      const newCert = await res.json();
      setCertificates([...certificates, newCert]);
    } catch (err) {
      console.error('Error adding certificate:', err);
      throw err;
    }
  };

  const handleRemoveCertificate = async (certificateId: string) => {
    try {
      const res = await fetch(`/api/certificates/${certificateId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Verwijderen mislukt');
      }

      setCertificates(certificates.filter(c => c.id !== certificateId));
    } catch (err) {
      console.error('Error removing certificate:', err);
      throw err;
    }
  };

  const handleRequestVerification = async (certificateId: string) => {
    try {
      const res = await fetch(`/api/certificates/${certificateId}/verify`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Verificatie aanvragen mislukt');
      }

      // Refresh certificates
      const updatedCert = await res.json();
      setCertificates(certificates.map(c => c.id === certificateId ? updatedCert : c));
    } catch (err) {
      console.error('Error requesting verification:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/pro/profile"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar profiel
        </Link>

        <h1 className="text-2xl font-bold text-surface-900 mb-6">Profiel bewerken</h1>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl text-success-700">
              Profiel opgeslagen! U wordt doorgestuurd...
            </div>
          )}

          {/* Basic Info */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-6">Bedrijfsgegevens</h2>

            {/* Profile picture */}
            <div className="flex items-center gap-6 mb-6">
              <Avatar
                src={profile.image}
                name={profile.name}
                size="xl"
              />
              <div>
                <Button type="button" variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>
                  Foto wijzigen
                </Button>
                <p className="text-xs text-surface-500 mt-2">
                  JPG, PNG of GIF. Max 5MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Bedrijfsnaam"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Uw bedrijfsnaam"
                required
              />
              <Input
                label="KvK-nummer"
                value={formData.kvkNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, kvkNumber: e.target.value }))}
                placeholder="12345678"
                maxLength={8}
              />
              <Input
                label="Telefoonnummer"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="06-12345678"
                type="tel"
                required
              />
            </div>
            <p className="text-xs text-surface-500 mt-3">
              Het KvK-nummer helpt opdrachtgevers uw bedrijf te verifiëren.
            </p>

            {/* Entity Type */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-surface-700 mb-3">
                Type onderneming
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    formData.entityType === 'INDIVIDUAL'
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="entityType"
                    value="INDIVIDUAL"
                    checked={formData.entityType === 'INDIVIDUAL'}
                    onChange={() => setFormData(prev => ({ ...prev, entityType: 'INDIVIDUAL' }))}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium text-surface-900">ZZP / Eenmanszaak</span>
                    <p className="text-sm text-surface-500 mt-1">
                      U werkt als zelfstandige of heeft een eenmanszaak
                    </p>
                  </div>
                </label>
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                    formData.entityType === 'BUSINESS'
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="entityType"
                    value="BUSINESS"
                    checked={formData.entityType === 'BUSINESS'}
                    onChange={() => setFormData(prev => ({ ...prev, entityType: 'BUSINESS' }))}
                    className="mt-1"
                  />
                  <div>
                    <span className="font-medium text-surface-900">Bedrijf (BV/VOF)</span>
                    <p className="text-sm text-surface-500 mt-1">
                      U vertegenwoordigt een geregistreerd bedrijf
                    </p>
                  </div>
                </label>
              </div>
              <p className="text-xs text-surface-500 mt-2">
                Dit helpt opdrachtgevers te begrijpen met wie ze zaken doen.
              </p>
            </div>
          </Card>

          {/* Service Area */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Werkgebied</h2>
            <p className="text-sm text-surface-600 mb-4">
              Vul uw postcode in om klussen in uw omgeving te vinden.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Postcode"
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value.toUpperCase() }))}
                placeholder="1234 AB"
                maxLength={7}
                required
              />
              <Select
                label="Werkafstand"
                options={[
                  { value: '10', label: '10 km' },
                  { value: '25', label: '25 km' },
                  { value: '50', label: '50 km' },
                  { value: '75', label: '75 km' },
                  { value: '100', label: '100 km' },
                ]}
                value={formData.serviceRadius.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceRadius: parseInt(e.target.value) }))}
              />
            </div>
            <p className="text-xs text-surface-500 mt-3">
              U ontvangt klussen binnen de geselecteerde afstand van uw postcode.
            </p>
          </Card>

          {/* Description */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Over uw bedrijf</h2>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Vertel iets over uw bedrijf, ervaring, certificeringen en specialisaties. Bijvoorbeeld: jaren ervaring, diploma's, verzekeringen, etc."
              rows={6}
            />
            <p className="text-xs text-surface-500 mt-2">
              Een uitgebreide beschrijving helpt opdrachtgevers u te kiezen.
            </p>
          </Card>

          {/* Categories */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Specialisaties</h2>
            <p className="text-sm text-surface-600 mb-4">
              Selecteer de categorieën waarin u werkzaam bent. U ziet alleen klussen in deze categorieën.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    formData.categories.includes(category.id)
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </label>
              ))}
            </div>
            {formData.categories.length === 0 && (
              <p className="text-sm text-warning-600 mt-2">
                Selecteer minimaal één categorie om klussen te ontvangen.
              </p>
            )}
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              isLoading={saving}
              leftIcon={<Save className="h-4 w-4" />}
              disabled={formData.categories.length === 0}
            >
              Opslaan
            </Button>
            <Link href="/pro/profile">
              <Button type="button" variant="outline">
                Annuleren
              </Button>
            </Link>
          </div>
        </form>

        {/* Certificate Management */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-surface-900 mb-6">
            Certificaten & Diploma's
          </h2>
          <CertificateManager
            certificates={certificates}
            certificateTypes={certificateTypes}
            onAdd={handleAddCertificate}
            onRemove={handleRemoveCertificate}
            onRequestVerification={handleRequestVerification}
          />
        </div>
      </div>
    </div>
  );
}
