// src/app/(dashboard)/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Avatar, Spinner, Badge } from '@/components/ui';
import { formatRelativeTime, cn } from '@/lib/utils';
import { MessageSquare, ChevronRight, Briefcase } from 'lucide-react';

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string | null };
};

type Conversation = {
  id: string;
  updatedAt: string;
  bid: {
    status: string;
    job: { 
      id: string; 
      title: string; 
      status: string;
      images?: { url: string }[];
      client?: {
        user: { id: string; name: string | null; image: string | null };
      };
    };
    pro: { 
      companyName: string;
      user: { id: string; name: string | null; image: string | null } 
    };
  };
  messages: Message[];
  _count: { messages: number };
};

const BID_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-warning-100 text-warning-700',
  VIEWED: 'bg-brand-100 text-brand-700',
  ACCEPTED: 'bg-success-100 text-success-700',
  REJECTED: 'bg-error-100 text-error-700',
  WITHDRAWN: 'bg-surface-100 text-surface-700',
};

const BID_STATUS_LABELS: Record<string, string> = {
  PENDING: 'In afwachting',
  VIEWED: 'Bekeken',
  ACCEPTED: 'Geaccepteerd',
  REJECTED: 'Afgewezen',
  WITHDRAWN: 'Ingetrokken',
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/messages').then(res => res.json()),
      fetch('/api/auth/session').then(res => res.json()),
    ]).then(([convData, sessionData]) => {
      setConversations(convData.conversations || []);
      setCurrentUserId(sessionData?.user?.id || null);
      setUserRole(sessionData?.user?.role || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Berichten</h1>
        <p className="mt-1 text-surface-600">
          {userRole === 'PRO' 
            ? 'Uw gesprekken met opdrachtgevers'
            : 'Uw gesprekken met vakmensen'
          }
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-surface-300" />
          <h3 className="mt-4 text-lg font-medium text-surface-900">Geen gesprekken</h3>
          <p className="mt-1 text-surface-500">
            {userRole === 'PRO'
              ? 'Zodra u offertes verstuurt, verschijnen uw gesprekken hier'
              : 'Zodra vakmensen reageren op uw klussen, verschijnen uw gesprekken hier'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const isPro = userRole === 'PRO';
            const otherUser = isPro ? conv.bid.job.client?.user : conv.bid.pro.user;
            const otherName = isPro 
              ? (conv.bid.job.client?.user?.name || 'Opdrachtgever')
              : (conv.bid.pro.companyName || conv.bid.pro.user.name || 'Vakman');
            const lastMessage = conv.messages[0];
            const unreadCount = conv._count.messages;
            const jobImage = conv.bid.job.images?.[0]?.url;

            return (
              <Link key={conv.id} href={`/messages/${conv.id}`}>
                <Card hover className="group">
                  <div className="flex gap-4">
                    {/* Job image or avatar */}
                    {jobImage ? (
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100">
                        <img src={jobImage} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-surface-100">
                        <Briefcase className="h-6 w-6 text-surface-300" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-surface-900 truncate group-hover:text-brand-600 transition-colors">
                            {conv.bid.job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Avatar 
                              src={otherUser?.image} 
                              name={otherName} 
                              size="xs" 
                            />
                            <span className="text-sm text-surface-600 truncate">
                              {otherName}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {unreadCount > 0 && (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-medium text-white">
                              {unreadCount}
                            </span>
                          )}
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            BID_STATUS_COLORS[conv.bid.status] || 'bg-surface-100 text-surface-600'
                          )}>
                            {BID_STATUS_LABELS[conv.bid.status] || conv.bid.status}
                          </span>
                        </div>
                      </div>

                      {/* Last message preview */}
                      {lastMessage && (
                        <p className="mt-2 text-sm text-surface-500 line-clamp-1">
                          {lastMessage.sender.id === currentUserId ? 'U: ' : ''}
                          {lastMessage.content}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-surface-400">
                          {formatRelativeTime(conv.updatedAt)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-surface-400 group-hover:text-brand-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
