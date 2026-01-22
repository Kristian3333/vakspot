// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id } = params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    // Prevent self-demotion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'U kunt uw eigen rol niet wijzigen' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role, name, email } = body;

    const updateData: Record<string, unknown> = {};
    
    if (role !== undefined) {
      if (!['CLIENT', 'PRO', 'ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Ongeldige rol' }, { status: 400 });
      }
      updateData.role = role;
    }
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}

// Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const { id } = params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 });
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'U kunt uw eigen account niet verwijderen' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Er is iets misgegaan' }, { status: 500 });
  }
}
