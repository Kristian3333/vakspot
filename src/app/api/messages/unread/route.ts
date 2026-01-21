// src/app/api/messages/unread/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    // Count unread messages where the current user is NOT the sender
    // and the user is part of the conversation (either as client or pro)
    const unreadCount = await prisma.message.count({
      where: {
        read: false,
        senderId: { not: session.user.id },
        conversation: {
          bid: {
            OR: [
              // User is the client
              { job: { client: { userId: session.user.id } } },
              // User is the pro
              { pro: { userId: session.user.id } },
            ],
          },
        },
      },
    });

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ count: 0 });
  }
}
