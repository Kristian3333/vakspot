// src/app/suspended/page.tsx
// P2B Compliance: Suspension notice page with appeal option

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card, Button } from '@/components/ui';
import { AlertTriangle, Mail, FileText, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account geschorst',
  description: 'Uw account is tijdelijk geschorst.',
};

async function getUserSuspensionInfo(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      suspended: true,
      suspendedAt: true,
      suspensionReason: true,
    },
  });
}

async function getExistingAppeal(userId: string) {
  return prisma.appeal.findFirst({
    where: {
      userId,
      type: 'SUSPENSION',
      status: { in: ['PENDING', 'UNDER_REVIEW'] },
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });
}

export default async function SuspendedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const userInfo = await getUserSuspensionInfo(session.user.id);

  // If user is not suspended, redirect to home
  if (!userInfo?.suspended) {
    redirect('/');
  }

  const existingAppeal = await getExistingAppeal(session.user.id);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Card className="text-center">
          {/* Warning icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-error-600" />
          </div>

          <h1 className="text-2xl font-bold text-surface-900 mb-2">
            Account geschorst
          </h1>
          <p className="text-surface-600 mb-6">
            Uw account is tijdelijk geschorst vanwege een overtreding van onze voorwaarden.
          </p>

          {/* Reason */}
          {userInfo.suspensionReason && (
            <div className="p-4 rounded-lg bg-surface-50 border border-surface-200 text-left mb-6">
              <h2 className="font-medium text-surface-900 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reden van schorsing
              </h2>
              <p className="text-surface-600">{userInfo.suspensionReason}</p>
            </div>
          )}

          {/* Suspended date */}
          {userInfo.suspendedAt && (
            <p className="text-sm text-surface-500 mb-6 flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              Geschorst op: {new Date(userInfo.suspendedAt).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          {/* Existing appeal status */}
          {existingAppeal ? (
            <div className="p-4 rounded-lg bg-brand-50 border border-brand-200 mb-6">
              <h2 className="font-medium text-brand-900 mb-1">Bezwaar ingediend</h2>
              <p className="text-sm text-brand-700">
                Uw bezwaar is ontvangen en wordt momenteel beoordeeld.
                Status: {existingAppeal.status === 'PENDING' ? 'In afwachting' : 'In behandeling'}
              </p>
              <p className="text-xs text-brand-600 mt-2">
                Ingediend op: {new Date(existingAppeal.createdAt).toLocaleDateString('nl-NL')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-surface-600">
                Als u denkt dat dit een vergissing is, kunt u bezwaar maken tegen deze beslissing.
              </p>
              <Link href="/appeal">
                <Button className="w-full">
                  Bezwaar maken
                </Button>
              </Link>
            </div>
          )}

          {/* Contact info */}
          <div className="pt-6 border-t border-surface-200 mt-6">
            <p className="text-sm text-surface-500 mb-3">
              Heeft u vragen? Neem contact met ons op:
            </p>
            <a
              href="mailto:support@vakspot.nl"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
            >
              <Mail className="h-4 w-4" />
              support@vakspot.nl
            </a>
          </div>

          {/* Sign out link */}
          <div className="mt-6">
            <Link
              href="/api/auth/signout"
              className="text-sm text-surface-500 hover:text-surface-700"
            >
              Uitloggen
            </Link>
          </div>
        </Card>

        {/* Legal info */}
        <p className="text-center text-xs text-surface-400 mt-6">
          Conform de Platform-to-Business verordening (P2B) heeft u het recht om bezwaar te maken
          tegen deze beslissing. Uw bezwaar zal binnen 14 werkdagen worden beoordeeld.
        </p>
      </div>
    </div>
  );
}
