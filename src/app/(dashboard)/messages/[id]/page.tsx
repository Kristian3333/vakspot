// src/app/(dashboard)/messages/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Card, Button, Avatar, Spinner, Badge, StatusBadge } from '@/components/ui';
import { formatCurrency, formatRelativeTime, cn } from '@/lib/utils';
import {
  Send,
  ArrowLeft,
  MapPin,
  Euro,
  Clock,
  CheckCircle2,
  XCircle,
  Paperclip,
  X,
  Image as ImageIcon,
  FileText,
  Download,
  Star,
  Briefcase,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

type Attachment = {
  id: string;
  url: string;
  filename: string;
  fileType: string;
  fileSize: number;
};

type Message = {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
  attachments: Attachment[];
};

type ConversationDetail = {
  id: string;
  createdAt: string;
  updatedAt: string;
  bid: {
    id: string;
    amount: number;
    amountType: string;
    message: string;
    status: string;
    createdAt: string;
    job: {
      id: string;
      title: string;
      description: string;
      status: string;
      budgetMin: number | null;
      budgetMax: number | null;
      locationCity: string;
      locationPostcode: string;
      timeline: string;
      publishedAt: string;
      category: { name: string; icon: string | null };
      images: { url: string }[];
    };
    pro: {
      id: string;
      companyName: string;
      avgRating: number;
      totalReviews: number;
      verified: boolean;
      user: { id: string; name: string | null; image: string | null };
    };
  };
  messages: Message[];
};

const TIMELINE_LABELS: Record<string, string> = {
  URGENT: 'Urgent',
  THIS_WEEK: 'Deze week',
  THIS_MONTH: 'Deze maand',
  NEXT_MONTH: 'Volgende maand',
  FLEXIBLE: 'Flexibel',
};

const AMOUNT_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Vaste prijs',
  ESTIMATE: 'Schatting',
  HOURLY: 'Uurtarief',
  TO_DISCUSS: 'Nader te bepalen',
};

const BID_STATUS_COLORS: Record<string, 'neutral' | 'primary' | 'success' | 'warning' | 'error'> = {
  PENDING: 'warning',
  VIEWED: 'primary',
  ACCEPTED: 'success',
  REJECTED: 'error',
  WITHDRAWN: 'neutral',
};

const BID_STATUS_LABELS: Record<string, string> = {
  PENDING: 'In afwachting',
  VIEWED: 'Bekeken',
  ACCEPTED: 'Geaccepteerd',
  REJECTED: 'Afgewezen',
  WITHDRAWN: 'Ingetrokken',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ConversationPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load conversation
  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      try {
        const [convRes, sessionRes] = await Promise.all([
          fetch(`/api/messages/${id}`),
          fetch('/api/auth/session'),
        ]);
        
        const sessionData = await sessionRes.json();
        setCurrentUserId(sessionData?.user?.id || null);
        setUserRole(sessionData?.user?.role || null);
        
        if (!convRes.ok) {
          const errorData = await convRes.json();
          setError(errorData.error || `Error: ${convRes.status}`);
          setLoading(false);
          return;
        }
        
        const convData = await convRes.json();
        if (convData.conversation) {
          setConversation(convData.conversation);
        } else {
          setError('Geen gesprek data ontvangen');
        }
        setLoading(false);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setError('Kon gesprek niet laden');
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (!conversation || !id) return;
    
    const interval = setInterval(() => {
      fetch(`/api/messages/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.conversation) {
            setConversation(data.conversation);
          }
        });
    }, 10000);

    return () => clearInterval(interval);
  }, [id, conversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Limit to 5 files, 10MB each
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024).slice(0, 5);
    setAttachments(prev => [...prev, ...validFiles].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || sending) return;

    setSending(true);
    try {
      // Upload attachments first
      let uploadedAttachments: { url: string; filename: string; fileType: string; fileSize: number }[] = [];
      
      if (attachments.length > 0) {
        setUploading(true);
        for (const file of attachments) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('context', 'messages'); // Allow more file types
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (uploadRes.ok) {
            const { url } = await uploadRes.json();
            uploadedAttachments.push({
              url,
              filename: file.name,
              fileType: file.type,
              fileSize: file.size,
            });
          }
        }
        setUploading(false);
      }

      // Send message
      const res = await fetch(`/api/messages/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: newMessage || (uploadedAttachments.length > 0 ? '📎 Bijlage verstuurd' : ''),
          attachments: uploadedAttachments,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.message],
        } : null);
        setNewMessage('');
        setAttachments([]);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    setSending(false);
  };

  const handleBidAction = async (action: 'accept' | 'reject') => {
    if (!conversation) return;
    setActionLoading(true);
    
    try {
      const res = await fetch(`/api/bids/${conversation.bid.id}/${action}`, {
        method: 'POST',
      });

      if (res.ok) {
        // Refresh conversation
        const convRes = await fetch(`/api/messages/${id}`);
        const data = await convRes.json();
        if (data.conversation) {
          setConversation(data.conversation);
        }
      }
    } catch (err) {
      console.error(`Failed to ${action} bid:`, err);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-error-400" />
          <h1 className="mt-4 text-xl font-bold text-surface-900">Gesprek niet gevonden</h1>
          <p className="mt-2 text-surface-600">{error || 'Het gesprek kon niet worden geladen.'}</p>
          <p className="mt-1 text-sm text-surface-400">Conversation ID: {id}</p>
          <Button onClick={() => router.push('/messages')} className="mt-6">
            Terug naar berichten
          </Button>
        </Card>
      </div>
    );
  }

  const { bid } = conversation;
  const { job, pro } = bid;
  const isClient = userRole === 'CLIENT';
  const canAcceptReject = isClient && (bid.status === 'PENDING' || bid.status === 'VIEWED');
  
  // Job detail link based on user role
  const jobDetailLink = isClient ? `/client/jobs/${job.id}` : `/pro/jobs/${job.id}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        href="/messages"
        className="inline-flex items-center gap-2 text-sm text-surface-600 hover:text-surface-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar berichten
      </Link>

      <div className="space-y-4">
        {/* Job Summary Card - Clickable for both clients and PROs */}
        <Link href={jobDetailLink}>
          <Card className="border-brand-100 bg-gradient-to-r from-brand-50/50 to-transparent hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group">
            <div className="flex gap-4">
              {job.images?.[0] ? (
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-100">
                  <img src={job.images[0].url} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-surface-100">
                  <Briefcase className="h-8 w-8 text-surface-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="neutral" size="sm" className="mb-1">
                      {job.category.name}
                    </Badge>
                    <h2 className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors">{job.title}</h2>
                  </div>
                  <StatusBadge variant={job.status === 'ACCEPTED' ? 'success' : 'primary'} size="sm">
                    {job.status === 'PUBLISHED' ? 'Gepubliceerd' : 
                     job.status === 'ACCEPTED' ? 'Geaccepteerd' :
                     job.status === 'IN_CONVERSATION' ? 'In gesprek' : job.status}
                  </StatusBadge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-surface-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.locationCity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {TIMELINE_LABELS[job.timeline] || job.timeline}
                  </span>
                  {(job.budgetMin || job.budgetMax) && (
                    <span className="flex items-center gap-1">
                      <Euro className="h-3.5 w-3.5" />
                      {job.budgetMin && job.budgetMax
                        ? `${formatCurrency(job.budgetMin)} - ${formatCurrency(job.budgetMax)}`
                        : job.budgetMax
                        ? `Tot ${formatCurrency(job.budgetMax)}`
                        : `Vanaf ${formatCurrency(job.budgetMin!)}`}
                    </span>
                  )}
                </div>
                {/* View details hint */}
                <span className="inline-flex items-center gap-1 mt-2 text-sm text-brand-600 group-hover:text-brand-700">
                  Bekijk volledige klus details
                  <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Card>
        </Link>

        {/* Bid Details Card */}
        <Card className={cn(
          bid.status === 'ACCEPTED' ? 'border-success-200 bg-success-50/50' :
          bid.status === 'REJECTED' ? 'border-error-200 bg-error-50/50' : ''
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Avatar src={pro.user.image} name={pro.user.name || pro.companyName} size="md" />
              <div>
                <h3 className="font-semibold text-surface-900">{pro.companyName}</h3>
                <p className="text-sm text-surface-500">{pro.user.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {pro.avgRating > 0 && (
                    <span className="flex items-center gap-1 text-sm text-surface-500">
                      <Star className="h-3.5 w-3.5 text-warning-500 fill-warning-500" />
                      {pro.avgRating.toFixed(1)} ({pro.totalReviews})
                    </span>
                  )}
                  {pro.verified && (
                    <Badge variant="success" size="sm">Geverifieerd</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              {bid.amount > 0 ? (
                <>
                  <p className="text-2xl font-bold text-surface-900">{formatCurrency(bid.amount)}</p>
                  <p className="text-sm text-surface-500">{AMOUNT_TYPE_LABELS[bid.amountType]}</p>
                </>
              ) : (
                <p className="text-sm text-surface-500">{AMOUNT_TYPE_LABELS[bid.amountType] || 'Prijs nader te bepalen'}</p>
              )}
              <StatusBadge variant={BID_STATUS_COLORS[bid.status]} size="sm" className="mt-1">
                {BID_STATUS_LABELS[bid.status]}
              </StatusBadge>
            </div>
          </div>

          {/* Bid message */}
          <div className="mt-4 pt-4 border-t border-surface-200">
            <p className="text-sm text-surface-600 whitespace-pre-wrap">{bid.message}</p>
            <p className="text-xs text-surface-400 mt-2">
              Interesse getoond {formatRelativeTime(bid.createdAt)}
            </p>
          </div>

          {/* Accept/Reject buttons for client */}
          {canAcceptReject && (
            <div className="mt-4 pt-4 border-t border-surface-200 flex gap-3">
              <Button
                onClick={() => handleBidAction('accept')}
                isLoading={actionLoading}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accepteren
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBidAction('reject')}
                isLoading={actionLoading}
                className="flex-1 border-error-200 text-error-600 hover:bg-error-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Afwijzen
              </Button>
            </div>
          )}

          {bid.status === 'ACCEPTED' && (
            <div className="mt-4 pt-4 border-t border-success-200 flex items-center gap-2 text-success-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Geaccepteerd - U kunt nu de klus plannen via berichten</span>
            </div>
          )}
        </Card>

        {/* Messages */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-surface-200 bg-surface-50">
            <h3 className="font-semibold text-surface-900">Berichten</h3>
            <p className="text-sm text-surface-500">
              Stel vragen, deel foto's en plan de klus
            </p>
          </div>

          {/* Messages list */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {conversation.messages.length === 0 ? (
              <div className="text-center py-8 text-surface-500">
                <p>Nog geen berichten</p>
                <p className="text-sm mt-1">Start het gesprek door een bericht te sturen</p>
              </div>
            ) : (
              conversation.messages.map((msg) => {
                const isOwn = msg.sender.id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={cn('flex gap-2', isOwn && 'flex-row-reverse')}
                  >
                    <Avatar src={msg.sender.image} name={msg.sender.name} size="sm" className="flex-shrink-0" />
                    <div className={cn('max-w-[75%]')}>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2',
                          isOwn
                            ? 'bg-brand-500 text-white rounded-br-md'
                            : 'bg-surface-100 text-surface-900 rounded-bl-md'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      
                      {/* Attachments */}
                      {msg.attachments?.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              {att.fileType.startsWith('image/') ? (
                                <img 
                                  src={att.url} 
                                  alt={att.filename} 
                                  className="max-h-48 rounded-lg border border-surface-200 hover:opacity-90 transition-opacity" 
                                />
                              ) : (
                                <div className={cn(
                                  'flex items-center gap-2 p-3 rounded-lg border',
                                  isOwn 
                                    ? 'bg-brand-400/20 border-brand-300 text-brand-100' 
                                    : 'bg-surface-50 border-surface-200 text-surface-700'
                                )}>
                                  <FileText className="h-5 w-5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{att.filename}</p>
                                    <p className={cn('text-xs', isOwn ? 'text-brand-200' : 'text-surface-500')}>
                                      {formatFileSize(att.fileSize)}
                                    </p>
                                  </div>
                                  <Download className="h-4 w-4 flex-shrink-0" />
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                      
                      <p className={cn(
                        'text-xs mt-1',
                        isOwn ? 'text-right text-surface-400' : 'text-surface-400'
                      )}>
                        {formatRelativeTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="px-4 py-2 border-t border-surface-200 bg-surface-50">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-surface-200">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4 text-surface-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-surface-400" />
                    )}
                    <span className="text-sm text-surface-600 max-w-[150px] truncate">{file.name}</span>
                    <span className="text-xs text-surface-400">{formatFileSize(file.size)}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="p-0.5 hover:bg-surface-100 rounded"
                    >
                      <X className="h-3.5 w-3.5 text-surface-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-surface-200">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= 5}
                title="Bijlage toevoegen"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Typ een bericht..."
                className="flex-1 rounded-lg border border-surface-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                isLoading={sending || uploading} 
                disabled={!newMessage.trim() && attachments.length === 0}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-surface-400 mt-2">
              Afbeeldingen, PDF en Word bestanden (max 5, 10MB per bestand)
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
