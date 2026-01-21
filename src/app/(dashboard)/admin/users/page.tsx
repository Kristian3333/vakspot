// src/app/(dashboard)/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Input, Badge, Spinner, Avatar, Select } from '@/components/ui';
import { 
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Shield,
  ShieldCheck,
  Ban,
  Mail,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'CLIENT' | 'PRO' | 'ADMIN';
  emailVerified: string | null;
  createdAt: string;
  _count: { jobs: number; bids: number };
  proProfile?: { companyName: string; verified: boolean } | null;
};

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Klant',
  PRO: 'Vakman',
  ADMIN: 'Admin',
};

const ROLE_COLORS: Record<string, 'neutral' | 'primary' | 'success' | 'warning' | 'error'> = {
  CLIENT: 'neutral',
  PRO: 'primary',
  ADMIN: 'warning',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      params.set('page', page.toString());
      params.set('limit', '20');

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      loadUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar dashboard
        </Link>
        <h1 className="text-2xl font-bold text-surface-900">Gebruikers</h1>
        <p className="text-surface-600 mt-1">{total} gebruikers in totaal</p>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <Input
              placeholder="Zoek op naam of e-mail..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            options={[
              { value: '', label: 'Alle rollen' },
              { value: 'CLIENT', label: 'Klanten' },
              { value: 'PRO', label: 'Vakmensen' },
              { value: 'ADMIN', label: 'Admins' },
            ]}
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
        </div>
      </Card>

      {/* Users table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-surface-500">Geen gebruikers gevonden</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-4 font-medium text-surface-600">Gebruiker</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-600">Rol</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-600">Activiteit</th>
                    <th className="text-left py-3 px-4 font-medium text-surface-600">Lid sinds</th>
                    <th className="text-right py-3 px-4 font-medium text-surface-600">Acties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.image} name={user.name} size="sm" />
                          <div>
                            <p className="font-medium text-surface-900">
                              {user.name || 'Geen naam'}
                            </p>
                            <p className="text-sm text-surface-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={ROLE_COLORS[user.role]} size="sm">
                          {ROLE_LABELS[user.role]}
                        </Badge>
                        {user.proProfile?.verified && (
                          <ShieldCheck className="inline-block h-4 w-4 ml-1 text-success-500" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={user.emailVerified ? 'success' : 'warning'} 
                          size="sm"
                        >
                          {user.emailVerified ? 'Geverifieerd' : 'Niet geverifieerd'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-surface-600">
                        {user.role === 'CLIENT' && `${user._count.jobs} klussen`}
                        {user.role === 'PRO' && `${user._count.bids} offertes`}
                        {user.role === 'ADMIN' && '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-surface-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Select
                            options={[
                              { value: 'CLIENT', label: 'Klant' },
                              { value: 'PRO', label: 'Vakman' },
                              { value: 'ADMIN', label: 'Admin' },
                            ]}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="w-28 text-sm"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
                <p className="text-sm text-surface-600">
                  Pagina {page} van {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
