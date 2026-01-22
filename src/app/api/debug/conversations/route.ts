// src/app/api/debug/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Debug: List all conversations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all conversations
    const allConversations = await prisma.conversation.findMany({
      include: {
        bid: {
          include: {
            job: {
              include: {
                client: {
                  include: { user: { select: { id: true, email: true, name: true } } }
                }
              }
            },
            pro: {
              include: { user: { select: { id: true, email: true, name: true } } }
            }
          }
        },
        messages: true,
      }
    });

    // Get current user details
    const userId = session.user.id;
    const userRole = session.user.role;

    // Check if user has a profile
    let profile = null;
    if (userRole === 'PRO') {
      profile = await prisma.proProfile.findUnique({ where: { userId } });
    } else if (userRole === 'CLIENT') {
      profile = await prisma.clientProfile.findUnique({ where: { userId } });
    }

    return NextResponse.json({
      currentUser: {
        id: userId,
        role: userRole,
        profileId: profile?.id,
      },
      totalConversations: allConversations.length,
      conversations: allConversations.map(conv => ({
        id: conv.id,
        bidId: conv.bidId,
        jobTitle: conv.bid.job.title,
        clientUserId: conv.bid.job.client.user.id,
        clientEmail: conv.bid.job.client.user.email,
        proUserId: conv.bid.pro.user.id,
        proEmail: conv.bid.pro.user.email,
        messageCount: conv.messages.length,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Debug failed', details: String(error) }, { status: 500 });
  }
}
