// src/app/settings/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui';
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SettingsForm } from './settings-form';

export const metadata: Metadata = {
  title: 'Instellingen',
  description: 'Beheer uw account instellingen op VakSpot.',
};

async function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });
}

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const user = await getUser(session.user.id);

  if (!user) {
    redirect('/login');
  }

  const settingsSections = [
    {
      title: 'Account',
      description: 'Beheer uw persoonlijke gegevens',
      icon: User,
      href: '/settings/account',
    },
    {
      title: 'E-mail',
      description: 'Wijzig uw e-mailadres',
      icon: Mail,
      href: '/settings/email',
    },
    {
      title: 'Wachtwoord',
      description: 'Wijzig uw wachtwoord',
      icon: Lock,
      href: '/settings/password',
    },
    {
      title: 'Notificaties',
      description: 'Beheer uw e-mail notificaties',
      icon: Bell,
      href: '/settings/notifications',
    },
    {
      title: 'Privacy',
      description: 'Beheer uw privacy instellingen',
      icon: Shield,
      href: '/settings/privacy',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900">Instellingen</h1>
          <p className="mt-1 text-surface-600">
            Beheer uw account en voorkeuren
          </p>
        </div>

        {/* Account Overview */}
        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <User className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <h2 className="font-semibold text-surface-900">{user.name || 'Geen naam'}</h2>
              <p className="text-sm text-surface-500">{user.email}</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full bg-surface-100 text-surface-600 text-sm font-medium">
              {user.role === 'PRO' ? 'Vakman' : user.role === 'ADMIN' ? 'Admin' : 'Opdrachtgever'}
            </span>
          </div>
        </Card>

        {/* Quick Settings */}
        <SettingsForm user={user} />

        {/* Settings Sections */}
        <div className="space-y-3 mt-6">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">Meer instellingen</h3>
          {settingsSections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card hover className="flex items-center gap-4 cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-100">
                  <section.icon className="h-5 w-5 text-surface-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-surface-900">{section.title}</h3>
                  <p className="text-sm text-surface-500">{section.description}</p>
                </div>
                <span className="text-surface-400">→</span>
              </Card>
            </Link>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t border-surface-200">
          <h3 className="text-lg font-semibold text-error-600 mb-4">Gevarenzone</h3>
          <Card className="border-error-200 bg-error-50">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-100">
                <Trash2 className="h-5 w-5 text-error-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-error-900">Account verwijderen</h4>
                <p className="text-sm text-error-700">
                  Dit verwijdert permanent al uw gegevens. Deze actie kan niet ongedaan worden gemaakt.
                </p>
              </div>
              <Link
                href="/settings/delete-account"
                className="px-4 py-2 rounded-lg border border-error-300 text-error-600 text-sm font-medium hover:bg-error-100 transition-colors"
              >
                Verwijderen
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
