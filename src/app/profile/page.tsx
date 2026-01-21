// src/app/profile/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, Button, Avatar } from '@/components/ui';
import {
  User,
  Mail,
  Calendar,
  Edit,
  Briefcase,
  MessageSquare,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mijn profiel',
  description: 'Beheer uw profiel op VakSpot.',
};

async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      clientProfile: {
        include: {
          _count: {
            select: {
              jobs: true,
            },
          },
        },
      },
    },
  });
}

async function getStats(clientProfileId: string | undefined) {
  if (!clientProfileId) {
    return { totalJobs: 0, activeJobs: 0, completedJobs: 0 };
  }

  const [totalJobs, activeJobs, completedJobs] = await Promise.all([
    prisma.job.count({ where: { clientId: clientProfileId } }),
    prisma.job.count({ where: { clientId: clientProfileId, status: { in: ['PUBLISHED', 'IN_CONVERSATION', 'IN_PROGRESS'] } } }),
    prisma.job.count({ where: { clientId: clientProfileId, status: 'COMPLETED' } }),
  ]);

  return {
    totalJobs,
    activeJobs,
    completedJobs,
  };
}

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Redirect PRO users to their specific profile
  if (session.user.role === 'PRO') {
    redirect('/pro/profile');
  }

  const profile = await getProfile(session.user.id);

  if (!profile) {
    redirect('/login');
  }

  const stats = await getStats(profile.clientProfile?.id);

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-surface-900">Mijn profiel</h1>
          <Link href="/profile/edit">
            <Button variant="outline" leftIcon={<Edit className="h-4 w-4" />}>
              Bewerken
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar
              src={profile.image}
              name={profile.name}
              size="xl"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-surface-900">
                {profile.name || 'Geen naam ingesteld'}
              </h2>
              
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-surface-600">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Lid sinds {new Date(profile.createdAt).toLocaleDateString('nl-NL', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <Briefcase className="h-6 w-6 text-brand-500 mx-auto" />
            <p className="mt-2 text-2xl font-bold text-surface-900">{stats.totalJobs}</p>
            <p className="text-sm text-surface-500">Klussen geplaatst</p>
          </Card>
          <Card className="text-center">
            <MessageSquare className="h-6 w-6 text-success-500 mx-auto" />
            <p className="mt-2 text-2xl font-bold text-surface-900">{stats.activeJobs}</p>
            <p className="text-sm text-surface-500">Actieve klussen</p>
          </Card>
          <Card className="text-center">
            <Star className="h-6 w-6 text-warning-500 mx-auto" />
            <p className="mt-2 text-2xl font-bold text-surface-900">{stats.completedJobs}</p>
            <p className="text-sm text-surface-500">Afgeronde klussen</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-surface-900 mb-4">Snelle acties</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/client/jobs/new">
              <Button variant="outline" className="w-full justify-start" leftIcon={<Briefcase className="h-4 w-4" />}>
                Nieuwe klus plaatsen
              </Button>
            </Link>
            <Link href="/client/jobs">
              <Button variant="outline" className="w-full justify-start" leftIcon={<MessageSquare className="h-4 w-4" />}>
                Mijn klussen bekijken
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="outline" className="w-full justify-start" leftIcon={<MessageSquare className="h-4 w-4" />}>
                Berichten
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start" leftIcon={<User className="h-4 w-4" />}>
                Account instellingen
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
