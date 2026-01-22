// src/app/api/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get conversation details with messages
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    console.log('[GET /api/messages/[id]] Fetching conversation:', id);
    
    const session = await auth();
    
    if (!session) {
      console.log('[GET /api/messages/[id]] No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('[GET /api/messages/[id]] User:', session.user.id, 'Role:', session.user.role);

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, name: true, image: true } },
            // Note: attachments removed - run `npx prisma generate` to re-enable
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
      console.log('[GET /api/messages/[id]] Conversation not found in database');
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    console.log('[GET /api/messages/[id]] Found conversation. Client userId:', conversation.bid.job.client.userId, 'Pro userId:', conversation.bid.pro.user.id);

    // Verify access - user must be client or pro involved
    const isClient = conversation.bid.job.client.userId === session.user.id;
    const isPro = conversation.bid.pro.user.id === session.user.id;

    console.log('[GET /api/messages/[id]] Access check - isClient:', isClient, 'isPro:', isPro);

    if (!isClient && !isPro) {
      console.log('[GET /api/messages/[id]] Access denied');
      return NextResponse.json({ error: 'Unauthorized - not a participant' }, { status: 403 });
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
    
    // Add empty attachments array to each message for frontend compatibility
    const messagesWithAttachments = conversation.messages.map(msg => ({
      ...msg,
      attachments: [],
    }));
    
    return NextResponse.json({
      conversation: {
        ...conversation,
        messages: messagesWithAttachments,
        bid: {
          ...conversation.bid,
          job: jobData,
        },
      },
    });
  } catch (error) {
    console.error('[GET /api/messages/[id]] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Send a message in this conversation
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;
    // Note: attachments support disabled until `npx prisma generate` is run

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
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

    // Create message (without attachments for now)
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ 
      message: {
        ...message,
        attachments: [], // Add empty array for frontend compatibility
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
