// src/app/api/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get conversation details with messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, image: true } },
            attachments: true,
          },
        },
        bid: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                description: true,
                status: true,
                budgetMin: true,
                budgetMax: true,
                locationCity: true,
                locationPostcode: true,
                timeline: true,
                publishedAt: true,
                category: { select: { name: true, icon: true } },
                images: { select: { url: true }, take: 1 },
                client: { select: { userId: true } },
              },
            },
            pro: {
              include: {
                user: { select: { id: true, name: true, image: true } },
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify access - user must be client or pro involved
    const isClient = conversation.bid.job.client.userId === session.user.id;
    const isPro = conversation.bid.pro.user.id === session.user.id;

    if (!isClient && !isPro) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.user.id },
        read: false,
      },
      data: { read: true },
    });

    // Remove client userId from response (privacy)
    const { client, ...jobData } = conversation.bid.job;
    
    return NextResponse.json({
      conversation: {
        ...conversation,
        bid: {
          ...conversation.bid,
          job: jobData,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

// POST - Send a message in this conversation
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, attachments } = body;

    if (!content?.trim() && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'Message content or attachments required' }, { status: 400 });
    }

    // Verify conversation exists and user has access
    const conversation = await prisma.conversation.findUnique({
      where: { id },
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

    // Create message with attachments
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        content: content?.trim() || '📎 Bijlage',
        attachments: attachments && attachments.length > 0 ? {
          create: attachments.map((att: any) => ({
            url: att.url,
            filename: att.filename,
            fileType: att.fileType,
            fileSize: att.fileSize,
          })),
        } : undefined,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        attachments: true,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
