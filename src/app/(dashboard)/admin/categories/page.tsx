// src/app/(dashboard)/admin/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Badge, Spinner } from '@/components/ui';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowLeft,
  GripVertical,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  order: number;
  _count?: { jobs: number; proCategories: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', icon: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      if (res.ok) {
        setNewCategory({ name: '', description: '', icon: '' });
        setShowAddForm(false);
        loadCategories();
      }
    } catch (error) {
      console.error('Failed to add category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
    });
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        loadCategories();
      }
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      loadCategories();
    } catch (error) {
      console.error('Failed to toggle category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze categorie wilt verwijderen?')) return;
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Categorieën</h1>
            <p className="text-surface-600 mt-1">Beheer kluscategorieën</p>
          </div>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            Nieuwe categorie
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="mb-6 p-6">
          <h3 className="font-semibold text-surface-900 mb-4">Nieuwe categorie</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              placeholder="Naam"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
            <Input
              placeholder="Beschrijving"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
            <Input
              placeholder="Icon (bijv. Paintbrush)"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleAdd} isLoading={saving}>
              Toevoegen
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>
              Annuleren
            </Button>
          </div>
        </Card>
      )}

      {/* Categories list */}
      <Card>
        <div className="divide-y divide-surface-200">
          {categories.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-surface-300" />
              <p className="mt-3 text-surface-500">Geen categorieën gevonden</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="p-4">
                {editingId === category.id ? (
                  <div className="flex items-center gap-4">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Beschrijving"
                      className="flex-1"
                    />
                    <Input
                      value={editForm.icon}
                      onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      placeholder="Icon"
                      className="w-32"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(category.id)}
                      isLoading={saving}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-5 w-5 text-surface-300 cursor-move" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-surface-900">{category.name}</span>
                        <Badge variant={category.active ? 'success' : 'neutral'} size="sm">
                          {category.active ? 'Actief' : 'Inactief'}
                        </Badge>
                      </div>
                      <p className="text-sm text-surface-500">
                        {category.description || 'Geen beschrijving'} • 
                        {category._count?.jobs || 0} klussen • 
                        {category._count?.proCategories || 0} vakmensen
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(category.id, category.active)}
                      >
                        {category.active ? 'Deactiveren' : 'Activeren'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-error-600 hover:text-error-700"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
