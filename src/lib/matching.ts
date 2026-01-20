// src/lib/matching.ts
// Lead matching algorithm for connecting jobs with relevant professionals

import { calculateDistance } from './utils';

export type MatchInput = {
  job: {
    id: string;
    categoryId: string;
    locationLat: number | null;
    locationLng: number | null;
    budgetMin: number | null;
    budgetMax: number | null;
    timeline: string;
    createdAt: Date;
  };
  pro: {
    id: string;
    locationLat: number | null;
    locationLng: number | null;
    serviceRadius: number;
    avgRating: number;
    totalReviews: number;
    responseRate: number;
    responseTime: number | null;
    verified: boolean;
    categories: { categoryId: string; yearsExp: number | null }[];
  };
};

export type MatchScore = {
  total: number;
  breakdown: {
    category: number;
    distance: number;
    rating: number;
    responsiveness: number;
    experience: number;
    verification: number;
  };
};

// Weight factors for scoring (must sum to 1.0)
const WEIGHTS = {
  category: 0.25,      // Category match is essential
  distance: 0.25,      // Proximity matters for service work
  rating: 0.20,        // Quality track record
  responsiveness: 0.15, // Quick responses = better experience
  experience: 0.10,    // Years in the category
  verification: 0.05,  // Trust signal
};

/**
 * Calculate a match score between a job and a professional
 * Returns a score from 0-100 with detailed breakdown
 */
export function calculateMatchScore(input: MatchInput): MatchScore {
  const { job, pro } = input;
  const breakdown = {
    category: 0,
    distance: 0,
    rating: 0,
    responsiveness: 0,
    experience: 0,
    verification: 0,
  };

  // 1. Category match (0 or 100)
  const categoryMatch = pro.categories.find(c => c.categoryId === job.categoryId);
  if (!categoryMatch) {
    // No category match = no match at all
    return { total: 0, breakdown };
  }
  breakdown.category = 100;

  // 2. Distance score (100 at same location, 0 at edge of service radius, negative beyond)
  if (job.locationLat && job.locationLng && pro.locationLat && pro.locationLng) {
    const distance = calculateDistance(
      job.locationLat,
      job.locationLng,
      pro.locationLat,
      pro.locationLng
    );
    
    if (distance > pro.serviceRadius) {
      // Outside service radius - heavily penalized but not excluded
      breakdown.distance = Math.max(0, 100 - (distance / pro.serviceRadius) * 100);
    } else {
      // Within service radius - linear decay
      breakdown.distance = 100 - (distance / pro.serviceRadius) * 80;
    }
  } else {
    // Missing location data - neutral score
    breakdown.distance = 50;
  }

  // 3. Rating score (normalized to 0-100, with minimum reviews threshold)
  if (pro.totalReviews >= 3) {
    // Enough reviews to be meaningful
    breakdown.rating = (pro.avgRating / 5) * 100;
  } else if (pro.totalReviews > 0) {
    // Some reviews but not enough - discount the score
    breakdown.rating = (pro.avgRating / 5) * 50 + 25;
  } else {
    // No reviews - neutral score
    breakdown.rating = 50;
  }

  // 4. Responsiveness score (based on response rate and time)
  breakdown.responsiveness = pro.responseRate; // Already 0-100
  if (pro.responseTime) {
    // Penalize slow response times (ideal < 2 hours)
    if (pro.responseTime <= 2) {
      breakdown.responsiveness = Math.min(100, breakdown.responsiveness + 10);
    } else if (pro.responseTime > 24) {
      breakdown.responsiveness = Math.max(0, breakdown.responsiveness - 20);
    }
  }

  // 5. Experience in category
  const yearsExp = categoryMatch.yearsExp || 0;
  if (yearsExp >= 10) {
    breakdown.experience = 100;
  } else if (yearsExp >= 5) {
    breakdown.experience = 80;
  } else if (yearsExp >= 2) {
    breakdown.experience = 60;
  } else if (yearsExp >= 1) {
    breakdown.experience = 40;
  } else {
    breakdown.experience = 20; // New but in the category
  }

  // 6. Verification bonus
  breakdown.verification = pro.verified ? 100 : 0;

  // Calculate weighted total
  const total = Math.round(
    breakdown.category * WEIGHTS.category +
    breakdown.distance * WEIGHTS.distance +
    breakdown.rating * WEIGHTS.rating +
    breakdown.responsiveness * WEIGHTS.responsiveness +
    breakdown.experience * WEIGHTS.experience +
    breakdown.verification * WEIGHTS.verification
  );

  return { total, breakdown };
}

/**
 * Sort and filter professionals for a job
 * Returns pros sorted by match score, filtered by minimum threshold
 */
export function rankProfessionals(
  job: MatchInput['job'],
  pros: MatchInput['pro'][],
  options: { minScore?: number; limit?: number } = {}
): Array<{ pro: MatchInput['pro']; score: MatchScore }> {
  const { minScore = 30, limit = 50 } = options;

  const scored = pros
    .map(pro => ({
      pro,
      score: calculateMatchScore({ job, pro }),
    }))
    .filter(({ score }) => score.total >= minScore)
    .sort((a, b) => b.score.total - a.score.total);

  return limit ? scored.slice(0, limit) : scored;
}

/**
 * Get match quality label for UI display
 */
export function getMatchQualityLabel(score: number): {
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'gray';
} {
  if (score >= 80) {
    return { label: 'Uitstekende match', color: 'green' };
  } else if (score >= 60) {
    return { label: 'Goede match', color: 'green' };
  } else if (score >= 40) {
    return { label: 'Redelijke match', color: 'yellow' };
  } else if (score >= 20) {
    return { label: 'Matige match', color: 'orange' };
  } else {
    return { label: 'Lage match', color: 'gray' };
  }
}
