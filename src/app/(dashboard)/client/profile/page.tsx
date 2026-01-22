// src/app/(dashboard)/client/profile/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, Avatar } from '@/components/ui';
import { Mail, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Mijn gegevens',
};

async function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      clientProfile: {
        select: {
          city: true,
          postcode: true,
        },
      },
    },
  });
}

export default async function ClientProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const profile = await getProfile(session.user.id);

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Mijn gegevens</h1>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Avatar
            src={profile.image}
            name={profile.name}
            size="xl"
          />
          <div>
            <h2 className="text-xl font-semibold text-surface-900">{profile.name}</h2>
            <p className="text-surface-500">Opdrachtgever</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-surface-600">
            <Mail className="h-4 w-4 text-surface-400" />
            {profile.email}
          </div>
          
          {profile.clientProfile?.city && (
            <div className="flex items-center gap-3 text-surface-600">
              <span className="h-4 w-4 text-surface-400">📍</span>
              {profile.clientProfile.city}
              {profile.clientProfile.postcode && `, ${profile.clientProfile.postcode}`}
            </div>
          )}

          <div className="flex items-center gap-3 text-surface-600">
            <Calendar className="h-4 w-4 text-surface-400" />
            Lid sinds {new Date(profile.createdAt).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </Card>
    </div>
  );
}
