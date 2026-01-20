// src/types/index.ts
import type {
  User,
  ClientProfile,
  ProProfile,
  Category,
  Job,
  JobImage,
  Bid,
  Conversation,
  Message,
  Review,
  Role,
  JobStatus,
  BidStatus,
  BudgetType,
  Timeline,
} from '@prisma/client';

// Re-export Prisma enums
export type { Role, JobStatus, BidStatus, BudgetType, Timeline };

// ============================================
// COMPOSITE TYPES
// ============================================

export type UserWithProfile = User & {
  clientProfile?: ClientProfile | null;
  proProfile?: (ProProfile & {
    categories: { category: Category }[];
  }) | null;
};

export type JobWithRelations = Job & {
  category: Category;
  client: ClientProfile & {
    user: Pick<User, 'name' | 'image'>;
  };
  images: JobImage[];
  bids: BidWithPro[];
  acceptedBid?: BidWithPro | null;
  review?: Review | null;
  _count?: {
    bids: number;
  };
};

export type JobListItem = Pick<Job, 
  | 'id' 
  | 'title' 
  | 'status' 
  | 'budgetMin' 
  | 'budgetMax'
  | 'budgetType'
  | 'locationCity'
  | 'timeline'
  | 'createdAt'
  | 'publishedAt'
> & {
  category: Pick<Category, 'id' | 'name' | 'slug' | 'icon'>;
  images: Pick<JobImage, 'id' | 'url'>[];
  _count: {
    bids: number;
  };
};

export type BidWithPro = Bid & {
  pro: ProProfile & {
    user: Pick<User, 'name' | 'image'>;
    categories: { category: Category }[];
  };
};

export type BidWithJob = Bid & {
  job: Job & {
    category: Category;
    client: ClientProfile & {
      user: Pick<User, 'name'>;
    };
  };
};

export type ProWithCategories = ProProfile & {
  user: Pick<User, 'name' | 'image' | 'email'>;
  categories: {
    category: Category;
    yearsExp: number | null;
  }[];
};

export type ConversationWithMessages = Conversation & {
  messages: (Message & {
    sender: Pick<User, 'id' | 'name' | 'image'>;
  })[];
  bid: Bid & {
    job: Pick<Job, 'id' | 'title'>;
    pro: ProProfile & {
      user: Pick<User, 'id' | 'name' | 'image'>;
    };
  };
};

export type ReviewWithJob = Review & {
  job: Pick<Job, 'id' | 'title'> & {
    client: {
      user: Pick<User, 'name' | 'image'>;
    };
  };
};

// ============================================
// API RESPONSE TYPES
// ============================================

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  details?: Record<string, string[]>;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
};

// ============================================
// FILTER & SORT TYPES
// ============================================

export type JobFilters = {
  categoryId?: string;
  status?: JobStatus;
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  timeline?: Timeline;
};

export type LeadFilters = {
  categoryId?: string;
  maxDistance?: number;
  minBudget?: number;
  maxBudget?: number;
  timeline?: Timeline;
};

export type SortOption = {
  field: string;
  direction: 'asc' | 'desc';
};

// ============================================
// MATCHING TYPES
// ============================================

export type MatchScore = {
  proId: string;
  score: number;
  breakdown: {
    categoryMatch: number;
    distanceScore: number;
    ratingScore: number;
    responseRateScore: number;
    availabilityPenalty: number;
  };
  distance: number;
};

// ============================================
// UI HELPER TYPES
// ============================================

export type JobStatusConfig = {
  label: string;
  color: 'neutral' | 'primary' | 'success' | 'warning' | 'error';
  description: string;
};

export type TimelineConfig = {
  label: string;
  description: string;
};

export type BudgetTypeConfig = {
  label: string;
  description: string;
};

// Status configurations
export const JOB_STATUS_CONFIG: Record<JobStatus, JobStatusConfig> = {
  DRAFT: { label: 'Concept', color: 'neutral', description: 'Nog niet gepubliceerd' },
  PUBLISHED: { label: 'Gepubliceerd', color: 'primary', description: 'Wacht op offertes' },
  IN_CONVERSATION: { label: 'In gesprek', color: 'warning', description: 'Je bent in gesprek met vakmensen' },
  ACCEPTED: { label: 'Geaccepteerd', color: 'success', description: 'Offerte geaccepteerd' },
  IN_PROGRESS: { label: 'In uitvoering', color: 'primary', description: 'Werk wordt uitgevoerd' },
  COMPLETED: { label: 'Afgerond', color: 'success', description: 'Klus is afgerond' },
  CANCELLED: { label: 'Geannuleerd', color: 'error', description: 'Klus is geannuleerd' },
  REVIEWED: { label: 'Beoordeeld', color: 'success', description: 'Review geplaatst' },
};

export const TIMELINE_CONFIG: Record<Timeline, TimelineConfig> = {
  URGENT: { label: 'Urgent', description: 'Binnen enkele dagen' },
  THIS_WEEK: { label: 'Deze week', description: 'Binnen 7 dagen' },
  THIS_MONTH: { label: 'Deze maand', description: 'Binnen 30 dagen' },
  NEXT_MONTH: { label: 'Volgende maand', description: 'Over 1-2 maanden' },
  FLEXIBLE: { label: 'Flexibel', description: 'Geen haast' },
};

export const BUDGET_TYPE_CONFIG: Record<BudgetType, BudgetTypeConfig> = {
  FIXED: { label: 'Vaste prijs', description: 'Totaalprijs voor de klus' },
  ESTIMATE: { label: 'Schatting', description: 'Geschatte prijs, kan variëren' },
  HOURLY: { label: 'Uurtarief', description: 'Prijs per uur' },
  TO_DISCUSS: { label: 'In overleg', description: 'Prijs in overleg bepalen' },
};
