// src/app/(dashboard)/messages/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button, Avatar, Spinner, Input } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
};

type Conversation = {
  id: string;
  updatedAt: string;
  bid: {
    job: { id: string; title: string; status: string };
    pro: { user: { id: string; name: string | null; image: string | null } };
  };
  messages: Message[];
  _count: { messages: number };
};

type ConversationDetail = Conversation & {
  messages: Message[];
};

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.json())
      .then(data => {
        setConversations(data.conversations || []);
        setLoading(false);
        
        // Auto-select from URL param
        const bidId = searchParams.get('bid');
        if (bidId && data.conversations) {
          const conv = data.conversations.find((c: Conversation) => c.bid.job.id === bidId);
          if (conv) setSelectedId(conv.id);
        }
      })
      .catch(() => setLoading(false));

    // Get current user ID from session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => setCurrentUserId(data?.user?.id || null))
      .catch(() => {});
  }, [searchParams]);

  // Load selected conversation
  useEffect(() => {
    if (!selectedId) {
      setConversation(null);
      return;
    }

    fetch(`/api/messages?conversationId=${selectedId}`)
      .then(res => res.json())
      .then(data => {
        setConversation(data.conversation);
        scrollToBottom();
      });
  }, [selectedId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedId || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedId, content: newMessage }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.message],
        } : null);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Berichten</h1>

      <div className="grid gap-6 lg:grid-cols-3" style={{ height: 'calc(100vh - 250px)' }}>
        {/* Conversation list */}
        <div className={cn(
          'lg:col-span-1 overflow-hidden rounded-2xl border border-surface-200 bg-white',
          selectedId && 'hidden lg:block'
        )}>
          <div className="p-4 border-b border-surface-200">
            <h2 className="font-semibold text-surface-900">Gesprekken</h2>
          </div>
          
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-surface-300" />
              <p className="mt-3 text-sm text-surface-500">Geen gesprekken</p>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
              {conversations.map((conv) => {
                const otherUser = conv.bid.pro?.user;
                const lastMessage = conv.messages[0];
                const unread = conv._count.messages > 0;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      'w-full p-4 text-left border-b border-surface-100 hover:bg-surface-50 transition-colors',
                      selectedId === conv.id && 'bg-brand-50 hover:bg-brand-50'
                    )}
                  >
                    <div className="flex gap-3">
                      <Avatar src={otherUser?.image} name={otherUser?.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-surface-900 truncate">
                            {otherUser?.name || 'Onbekend'}
                          </span>
                          {unread && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                              {conv._count.messages}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-surface-600 truncate">
                          {conv.bid.job.title}
                        </p>
                        {lastMessage && (
                          <p className="text-xs text-surface-400 truncate mt-1">
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className={cn(
          'lg:col-span-2 flex flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white',
          !selectedId && 'hidden lg:flex'
        )}>
          {!selectedId || !conversation ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageSquare className="mx-auto h-12 w-12 text-surface-300" />
                <p className="mt-4 text-surface-500">Selecteer een gesprek om te beginnen</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-surface-200">
                <button
                  onClick={() => setSelectedId(null)}
                  className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar
                  src={conversation.bid.pro?.user?.image}
                  name={conversation.bid.pro?.user?.name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-surface-900">
                    {conversation.bid.pro?.user?.name || 'Onbekend'}
                  </p>
                  <p className="text-sm text-surface-500 truncate">
                    {conversation.bid.job.title}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversation.messages.map((msg) => {
                  const isOwn = msg.sender.id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex gap-2', isOwn && 'flex-row-reverse')}
                    >
                      <Avatar src={msg.sender.image} name={msg.sender.name} size="sm" />
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2',
                          isOwn
                            ? 'bg-brand-500 text-white rounded-br-md'
                            : 'bg-surface-100 text-surface-900 rounded-bl-md'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={cn(
                          'text-xs mt-1',
                          isOwn ? 'text-brand-200' : 'text-surface-400'
                        )}>
                          {formatRelativeTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-surface-200">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Typ een bericht..."
                    className="flex-1"
                  />
                  <Button type="submit" isLoading={sending} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
