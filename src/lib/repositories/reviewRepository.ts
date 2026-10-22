import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export interface ReviewItem {
  id: string;
  eventId: string;
  eventTitle: string;
  userId?: string;
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  rating: number; // 1 to 5
  title?: string;
  content: string;
  ticketTierName?: string;
  isVerifiedPassHolder: boolean;
  organizerReply?: {
    replyContent: string;
    repliedAt: string;
    repliedBy: string;
  };
  createdAt: string;
}

// Initial realistic baseline reviews for discoverability and social proof
const defaultReviews: ReviewItem[] = [
  {
    id: 'REV-BLR-01',
    eventId: 'tech-summit-2026',
    eventTitle: 'Bengaluru Tech Innovation Summit 2026',
    authorName: 'Aditya Kashyap',
    authorEmail: 'aditya.k@finpulse.io',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    title: 'Outstanding AI & FinTech Panels!',
    content: 'The keynote on Autonomous Financial Agents was world-class. Venue arrangements at KTPO were seamless and the QR gate badge scanner was remarkably swift. Definitely coming back for 2027!',
    ticketTierName: 'VIP Masterclass Pass',
    isVerifiedPassHolder: true,
    organizerReply: {
      replyContent: 'Thank you so much Aditya! Delighted you enjoyed the AI workshops. See you at our next winter edition!',
      repliedAt: '2026-10-08T11:20:00Z',
      repliedBy: 'TechVentures India Organizing Team'
    },
    createdAt: '2026-10-07T18:30:00Z'
  },
  {
    id: 'REV-BLR-02',
    eventId: 'tech-summit-2026',
    eventTitle: 'Bengaluru Tech Innovation Summit 2026',
    authorName: 'Snehal Deshpande',
    authorEmail: 'snehal.d@cloudcraft.io',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    title: 'Exceptional networking with Tier-1 founders',
    content: 'Connecting with over 30 seed-stage founders and investors in the VIP lounge made this worth 10x the pass cost. Fast check-in and great catering throughout.',
    ticketTierName: 'General Admission',
    isVerifiedPassHolder: true,
    createdAt: '2026-10-08T09:15:00Z'
  },
  {
    id: 'REV-BLR-03',
    eventId: 'tech-summit-2026',
    eventTitle: 'Bengaluru Tech Innovation Summit 2026',
    authorName: 'Karthik Raja',
    authorEmail: 'karthik@vectordb.in',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 4,
    title: 'Great content, parking was slightly busy',
    content: 'The stage presentations were top tier. Only suggestion for organizers is to open gate 3 earlier for valet parking. Overall 9/10 experience!',
    ticketTierName: 'Early Bird Pass',
    isVerifiedPassHolder: true,
    organizerReply: {
      replyContent: 'Noted Karthik! We have coordinated extra valet spaces for future summits. Appreciate the candid feedback!',
      repliedAt: '2026-10-09T14:00:00Z',
      repliedBy: 'TechVentures India'
    },
    createdAt: '2026-10-08T14:45:00Z'
  },
  {
    id: 'REV-MUM-01',
    eventId: 'mumbai-music-fest-2026',
    eventTitle: 'Mumbai Waves Music & Arts Festival',
    authorName: 'Rhea Sen',
    authorEmail: 'rhea.sen@gmail.com',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    title: 'Unbelievable sound engineering and vibe!',
    content: 'The acoustic setup at Mahalaxmi was incredible. The ePay digital pass meant zero lines at the gate. Best weekend festival in Mumbai this year!',
    ticketTierName: 'Weekend General Pass',
    isVerifiedPassHolder: true,
    createdAt: '2026-10-07T22:10:00Z'
  },
  {
    id: 'REV-DEL-01',
    eventId: 'delhi-startup-conclave-2026',
    eventTitle: 'Delhi Startup Conclave & Pitch Arena',
    authorName: 'Manish Chawla',
    authorEmail: 'manish@finloop.co',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    title: 'Closed 2 angel conversations right here!',
    content: 'Extremely high signal-to-noise ratio. The pitch arena schedule ran like clockwork. High recommendation for any early-stage builder.',
    ticketTierName: 'Founder & Investor Access',
    isVerifiedPassHolder: true,
    createdAt: '2026-10-06T19:00:00Z'
  }
];

// Global in-memory cache for SSR & Node runtimes
const globalReviewsStore = globalThis as unknown as {
  __epay_reviews_cache__?: ReviewItem[];
};

if (!globalReviewsStore.__epay_reviews_cache__) {
  globalReviewsStore.__epay_reviews_cache__ = [...defaultReviews];
}

const LOCAL_STORAGE_REVIEWS_KEY = 'epay_persisted_reviews';

/**
 * Retrieves all reviews with local storage and memory synchronization
 */
export async function getAllReviews(eventId?: string): Promise<ReviewItem[]> {
  let list: ReviewItem[] = [...(globalReviewsStore.__epay_reviews_cache__ || defaultReviews)];

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Merge items preserving custom additions
          const ids = new Set(parsed.map(r => r.id));
          list = [...parsed, ...list.filter(r => !ids.has(r.id))];
          globalReviewsStore.__epay_reviews_cache__ = list;
        }
      }
    } catch (e) {
      console.warn('[ReviewRepo] Storage read error:', e);
    }
  }

  // Supabase fallback if configured
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: ReviewItem[] = data.map((d: any) => ({
          id: d.id,
          eventId: d.event_id,
          eventTitle: d.event_title || 'ePay Event',
          userId: d.user_id,
          authorName: d.user_name || d.author_name || 'Verified Attendee',
          authorEmail: d.user_email || d.author_email || '',
          authorAvatar: d.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${d.user_name || d.author_name || 'user'}`,
          rating: Number(d.rating) || 5,
          title: d.title || 'Attendee Review',
          content: d.comment || d.content || '',
          ticketTierName: d.ticket_tier_name || 'General Admission',
          isVerifiedPassHolder: d.is_verified_pass_holder !== undefined ? Boolean(d.is_verified_pass_holder) : true,
          organizerReply: d.organizer_reply,
          createdAt: d.created_at,
        }));
        return mapped;
      }
    } catch (err) {
      console.warn('[ReviewRepo] Supabase query notice:', err);
    }
  }

  if (eventId) {
    const slugOrId = eventId.toLowerCase();
    return list.filter(r => r.eventId.toLowerCase() === slugOrId || r.eventTitle.toLowerCase().includes(slugOrId));
  }

  return list;
}

/**
 * Adds a new review submitted by an attendee
 */
export async function addReview(payload: Omit<ReviewItem, 'id' | 'createdAt'>): Promise<ReviewItem> {
  const newReview: ReviewItem = {
    ...payload,
    id: `REV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
    createdAt: new Date().toISOString(),
  };

  // 1. Update in-memory cache
  if (!globalReviewsStore.__epay_reviews_cache__) {
    globalReviewsStore.__epay_reviews_cache__ = [];
  }
  globalReviewsStore.__epay_reviews_cache__.unshift(newReview);

  // 2. Persist to localStorage for client sessions
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      const updated = [newReview, ...existing];
      localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('epay_review_created', { detail: newReview }));
    } catch (e) {
      console.warn('[ReviewRepo] Failed persisting to localStorage:', e);
    }
  }

  // 3. Persist to Supabase if available
  if (isSupabaseConfigured()) {
    try {
      // Build row supporting both schemas (user_name/user_email/comment AND author_name/author_email/content)
      const reviewRow: Record<string, any> = {
        id: newReview.id,
        event_id: newReview.eventId,
        rating: newReview.rating,
        user_name: newReview.authorName,
        user_email: newReview.authorEmail,
        comment: newReview.content,
        created_at: newReview.createdAt,
      };

      if (newReview.userId) {
        reviewRow.user_id = newReview.userId;
      }

      const { error: insertError } = await supabase.from('reviews').insert([reviewRow]);
      if (insertError) {
        console.warn('[ReviewRepo] Supabase insert notice:', insertError.message);
      } else {
        console.log(`[ReviewRepo] Successfully saved review ${newReview.id} to Supabase!`);
      }
    } catch (err: any) {
      console.warn('[ReviewRepo] Supabase insert exception:', err?.message || err);
    }
  }

  return newReview;
}

/**
 * Adds an organizer reply to an existing review
 */
export async function replyToReview(
  reviewId: string, 
  replyContent: string, 
  repliedBy: string
): Promise<ReviewItem | null> {
  let target = globalReviewsStore.__epay_reviews_cache__?.find(r => r.id === reviewId);
  const replyObj = {
    replyContent,
    repliedAt: new Date().toISOString(),
    repliedBy,
  };

  if (target) {
    target.organizerReply = replyObj;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
      const existing: ReviewItem[] = stored ? JSON.parse(stored) : [];
      const updated = existing.map(r => r.id === reviewId ? { ...r, organizerReply: replyObj } : r);
      localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('epay_review_replied', { detail: { reviewId, replyObj } }));
    } catch (e) {
      console.warn('[ReviewRepo] Failed saving reply to localStorage:', e);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('reviews').update({
        organizer_reply: replyObj,
      }).eq('id', reviewId);
    } catch (err) {
      console.warn('[ReviewRepo] Supabase reply update notice:', err);
    }
  }

  return target || null;
}

/**
 * Calculates aggregate rating metrics for an event
 */
export async function getEventRatingStats(eventId: string) {
  const reviews = await getAllReviews(eventId);
  if (reviews.length === 0) {
    return {
      averageRating: 4.9, // Default benchmark for summits
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = Number((sum / reviews.length).toFixed(1));
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[star] = (distribution[star] || 0) + 1;
  });

  return {
    averageRating,
    totalReviews: reviews.length,
    distribution,
  };
}

