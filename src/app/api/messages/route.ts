// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendMessageSchema } from '@/lib/validations';

// GET - List conversations or messages in a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get messages in a specific conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: { select: { id: true, name: true, image: true } },
            },
          },
          bid: {
            include: {
              job: { select: { id: true, title: true, status: true } },
              pro: {
                include: { user: { select: { id: true, name: true, image: true } } },
              },
            },
          },
        },
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      // Verify access - user must be client or pro involved
      const jobClientId = await prisma.job.findUnique({
        where: { id: conversation.bid.jobId },
        select: { client: { select: { userId: true } } },
      });

      const isClient = jobClientId?.client.userId === session.user.id;
      const isPro = conversation.bid.pro.userId === session.user.id;

      if (!isClient && !isPro) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: session.user.id },
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ conversation });
    }

    // List all conversations for the user
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

      return NextResponse.json({ conversations });
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
              job: { select: { id: true, title: true, status: true } },
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
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { conversationId, content } = parsed.data;

    // Verify conversation exists and user has access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        bid: {
          include: {
            job: { select: { client: { select: { userId: true } } } },
            pro: { select: { userId: true } },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const isClient = conversation.bid.job.client.userId === session.user.id;
    const isPro = conversation.bid.pro.userId === session.user.id;

    if (!isClient && !isPro) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create message and update conversation timestamp
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
