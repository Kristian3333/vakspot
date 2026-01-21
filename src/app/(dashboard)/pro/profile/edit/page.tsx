// src/app/(dashboard)/pro/profile/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Textarea, Avatar, Spinner, Select } from '@/components/ui';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Link from 'next/link';

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
    companyName: string | null;
    phone: string | null;
    city: string | null;
    postcode: string | null;
    bio: string | null;
    kvkNumber: string | null;
    workRadius: number | null;
    categories: { categoryId: string }[];
  } | null;
};

export default function EditProProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    city: '',
    postcode: '',
    bio: '',
    kvkNumber: '',
    workRadius: 25,
    categoryIds: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/session').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
    ])
      .then(([sessionData, categoriesData]) => {
        if (sessionData?.user) {
          const user = sessionData.user;
          const pro = user.proProfile;
          setProfile(user);
          setFormData({
            name: user.name || '',
            companyName: pro?.companyName || '',
            phone: pro?.phone || '',
            city: pro?.city || '',
            postcode: pro?.postcode || '',
            bio: pro?.bio || '',
            kvkNumber: pro?.kvkNumber || '',
            workRadius: pro?.workRadius || 25,
            categoryIds: pro?.categories?.map((c: { categoryId: string }) => c.categoryId) || [],
          });
        }
        // API returns array directly, handle both array and object format for safety
        setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
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

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-6">Persoonlijke gegevens</h2>

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
                label="Naam"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Uw naam"
              />
              <Input
                label="Bedrijfsnaam"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Uw bedrijfsnaam"
              />
              <Input
                label="Telefoonnummer"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="06-12345678"
                type="tel"
              />
              <Input
                label="KvK-nummer"
                value={formData.kvkNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, kvkNumber: e.target.value }))}
                placeholder="12345678"
              />
            </div>
          </Card>

          {/* Location */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-6">Locatie & werkgebied</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Stad"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Amsterdam"
              />
              <Input
                label="Postcode"
                value={formData.postcode}
                onChange={(e) => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
                placeholder="1234 AB"
              />
              <div className="sm:col-span-2">
                <label className="label">Werkstraal (km)</label>
                <Select
                  options={[
                    { value: '10', label: '10 km' },
                    { value: '25', label: '25 km' },
                    { value: '50', label: '50 km' },
                    { value: '75', label: '75 km' },
                    { value: '100', label: '100 km' },
                  ]}
                  value={formData.workRadius.toString()}
                  onChange={(e) => setFormData(prev => ({ ...prev, workRadius: parseInt(e.target.value) }))}
                />
                <p className="text-xs text-surface-500 mt-1">
                  U ontvangt leads binnen deze afstand van uw locatie.
                </p>
              </div>
            </div>
          </Card>

          {/* Bio */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Over u</h2>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Vertel iets over uzelf, uw ervaring en specialisaties..."
              rows={5}
            />
            <p className="text-xs text-surface-500 mt-2">
              Een goed profiel helpt u meer opdrachten te krijgen.
            </p>
          </Card>

          {/* Categories */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Specialisaties</h2>
            <p className="text-sm text-surface-600 mb-4">
              Selecteer de categorieën waarin u werkzaam bent.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    formData.categoryIds.includes(category.id)
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
              Opslaan
            </Button>
            <Link href="/pro/profile">
              <Button type="button" variant="outline">
                Annuleren
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
