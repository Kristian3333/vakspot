// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - List all conversations for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    if (session.user.role === 'PRO') {
      const proProfile = await prisma.proProfile.findUnique({
        where: { userId },
      });

      if (!proProfile) {
        return NextResponse.json({ conversations: [] });
      }

      const conversations = await prisma.conversation.findMany({
        where: {
          bid: { proId: proProfile.id },
        },
        include: {
          bid: {
            include: {
              job: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  images: { select: { url: true }, take: 1 },
                  client: {
                    select: {
                      user: { select: { id: true, name: true, image: true } },
                    },
                  },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: { select: { id: true, name: true } },
            },
          },
          _count: {
            select: {
              messages: { where: { read: false, senderId: { not: userId } } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // For PROs, we need to add a dummy pro object with their own info
      const conversationsWithPro = conversations.map(conv => ({
        ...conv,
        bid: {
          ...conv.bid,
          pro: {
            companyName: proProfile.companyName,
            user: { id: userId, name: session.user.name, image: session.user.image },
          },
        },
      }));

      return NextResponse.json({ conversations: conversationsWithPro });
    }

    if (session.user.role === 'CLIENT') {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId },
      });

      if (!clientProfile) {
        return NextResponse.json({ conversations: [] });
      }

      const conversations = await prisma.conversation.findMany({
        where: {
          bid: {
            job: { clientId: clientProfile.id },
          },
        },
        include: {
          bid: {
            include: {
              job: { 
                select: { 
                  id: true, 
                  title: true, 
                  status: true,
                  images: { select: { url: true }, take: 1 },
                } 
              },
              pro: {
                include: {
                  user: { select: { id: true, name: true, image: true } },
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: { select: { id: true, name: true } },
            },
          },
          _count: {
            select: {
              messages: { where: { read: false, senderId: { not: userId } } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return NextResponse.json({ conversations });
    }

    return NextResponse.json({ conversations: [] });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
