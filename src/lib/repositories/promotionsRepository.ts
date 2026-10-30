import { createAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export interface PromoCode {
  id: string;
  code: string;
  eventId?: string; // If null/empty, valid platform-wide or for all organizer's events
  organizerEmail?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 20 for 20% or 500 for ₹500
  maxUses: number;
  currentUses: number;
  expiresAt?: string; // YYYY-MM-DD
  isActive: boolean;
  minOrderAmount?: number;
  applicableTierIds?: string[];
  createdAt: string;
}

export interface ReferralLink {
  id: string;
  code: string; // e.g. 'CAMPUS-RAHUL' or 'SPONSOR-GOOGLE'
  affiliateName: string;
  affiliateEmail: string;
  organizerEmail?: string;
  type: 'speaker' | 'sponsor' | 'campus_ambassador' | 'influencer';
  eventId: string;
  eventTitle: string;
  commissionPercent: number; // e.g. 10%
  discountPercent: number; // e.g. 10% discount for buyers who use this link
  clickCount: number;
  conversionsCount: number;
  totalRevenueGenerated: number;
  totalCommissionEarned: number;
  totalDiscountGiven: number; // monetary total of discounts received by buyers
  payoutStatus: 'unpaid' | 'paid';
  createdAt: string;
}

// In-memory persistent seed for local development and offline mock
let inMemoryPromoCodes: PromoCode[] = [
  {
    id: 'promo-1',
    code: 'EARLYBIRD20',
    discountType: 'percentage',
    discountValue: 20,
    maxUses: 50,
    currentUses: 14,
    expiresAt: '2026-11-30',
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'promo-2',
    code: 'EPAY20',
    discountType: 'percentage',
    discountValue: 20,
    maxUses: 100,
    currentUses: 37,
    expiresAt: '2026-12-31',
    isActive: true,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'promo-3',
    code: 'VIP500',
    discountType: 'fixed',
    discountValue: 500,
    maxUses: 30,
    currentUses: 9,
    expiresAt: '2026-11-15',
    isActive: true,
    createdAt: '2026-10-10T12:00:00Z',
  },
  {
    id: 'promo-4',
    code: 'FREEPASS',
    discountType: 'percentage',
    discountValue: 100,
    maxUses: 10,
    currentUses: 4,
    expiresAt: '2026-12-31',
    isActive: true,
    createdAt: '2026-10-05T08:00:00Z',
  },
];

let inMemoryReferralLinks: ReferralLink[] = [
  {
    id: 'ref-1',
    code: 'AMBASSADOR-ROHIT',
    affiliateName: 'Rohit Kulkarni',
    affiliateEmail: 'rohit.campus@engg.edu',
    type: 'campus_ambassador',
    eventId: 'evt_9f3k2',
    eventTitle: 'AI Business Summit 2026',
    commissionPercent: 10,
    discountPercent: 10,
    clickCount: 142,
    conversionsCount: 18,
    totalRevenueGenerated: 26982,
    totalCommissionEarned: 2698,
    totalDiscountGiven: 2998,
    payoutStatus: 'unpaid',
    createdAt: '2026-10-12T14:30:00Z',
  },
  {
    id: 'ref-2',
    code: 'SPEAKER-PRIYA',
    affiliateName: 'Priya Sharma (Keynote)',
    affiliateEmail: 'priya@cognitivelabs.com',
    type: 'speaker',
    eventId: 'evt_9f3k2',
    eventTitle: 'AI Business Summit 2026',
    commissionPercent: 15,
    discountPercent: 15,
    clickCount: 310,
    conversionsCount: 42,
    totalRevenueGenerated: 62958,
    totalCommissionEarned: 9443,
    totalDiscountGiven: 11110,
    payoutStatus: 'unpaid',
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'ref-3',
    code: 'SPONSOR-AWS',
    affiliateName: 'AWS Community Partner',
    affiliateEmail: 'partner@awsindia.com',
    type: 'sponsor',
    eventId: 'evt-101',
    eventTitle: 'ePay Global FinTech & Payments Summit 2026',
    commissionPercent: 12,
    discountPercent: 5,
    clickCount: 88,
    conversionsCount: 11,
    totalRevenueGenerated: 27489,
    totalCommissionEarned: 3298,
    totalDiscountGiven: 1446,
    payoutStatus: 'paid',
    createdAt: '2026-10-18T11:20:00Z',
  },
];

// Helper: Get all promo codes
export async function getPromoCodes(organizerEmail?: string, eventId?: string): Promise<PromoCode[]> {
  let list = [...inMemoryPromoCodes];
  if (organizerEmail) {
    const cleanEmail = organizerEmail.toLowerCase().trim();
    list = list.filter(p => !p.organizerEmail || p.organizerEmail.toLowerCase().trim() === cleanEmail);
  }
  if (eventId) {
    // Return codes that are platform-wide (!p.eventId) OR specifically for this event
    list = list.filter(p => !p.eventId || p.eventId === eventId);
  }
  return list;
}

// Helper: Validate a promo code during checkout
export async function validatePromoCode(
  code: string,
  eventId?: string,
  ticketTierId?: string,
  orderSubtotal: number = 0
): Promise<{
  valid: boolean;
  discountPercent?: number;
  fixedDiscount?: number;
  promoCode?: PromoCode;
  error?: string;
}> {
  const normalized = code.trim().toUpperCase();
  const list = await getPromoCodes();
  const match = list.find(p => p.code.toUpperCase() === normalized);

  if (!match) {
    // Fallback known static platform codes
    if (normalized === 'EPAY20') {
      return { valid: true, discountPercent: 20 };
    }
    if (normalized === 'EARLYBIRD' || normalized === 'EARLYDEV') {
      return { valid: true, discountPercent: 15 };
    }
    if (normalized === 'FREEPASS') {
      return { valid: true, discountPercent: 100 };
    }
    return { valid: false, error: 'Invalid promo code. Please check the spelling.' };
  }

  if (!match.isActive) {
    return { valid: false, error: `Promo code "${normalized}" is currently paused or inactive.` };
  }

  if (match.maxUses && match.currentUses >= match.maxUses) {
    return { valid: false, error: `Promo code "${normalized}" has reached its maximum usage limit (${match.maxUses} uses).` };
  }

  if (match.expiresAt) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (match.expiresAt < todayStr) {
      return { valid: false, error: `Promo code "${normalized}" expired on ${match.expiresAt}.` };
    }
  }

  if (match.eventId && eventId && match.eventId !== eventId) {
    return { valid: false, error: `This promo code is only applicable for specific event passes.` };
  }

  if (match.minOrderAmount && orderSubtotal < match.minOrderAmount) {
    return { valid: false, error: `Minimum order amount of ₹${match.minOrderAmount} required to apply this code.` };
  }

  if (match.discountType === 'fixed') {
    return {
      valid: true,
      fixedDiscount: match.discountValue,
      discountPercent: orderSubtotal > 0 ? Math.round((match.discountValue / orderSubtotal) * 100) : 0,
      promoCode: match,
    };
  }

  return {
    valid: true,
    discountPercent: match.discountValue,
    promoCode: match,
  };
}

// Helper: Create promo code
export async function createPromoCode(data: Omit<PromoCode, 'id' | 'currentUses' | 'createdAt'>): Promise<PromoCode> {
  const newPromo: PromoCode = {
    ...data,
    id: `promo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    code: data.code.trim().toUpperCase(),
    currentUses: 0,
    createdAt: new Date().toISOString(),
  };

  inMemoryPromoCodes.unshift(newPromo);
  return newPromo;
}

// Helper: Toggle promo active
export async function togglePromoCodeStatus(id: string): Promise<PromoCode | null> {
  const item = inMemoryPromoCodes.find(p => p.id === id);
  if (item) {
    item.isActive = !item.isActive;
    return item;
  }
  return null;
}

// Helper: Delete promo
export async function deletePromoCode(id: string): Promise<boolean> {
  const idx = inMemoryPromoCodes.findIndex(p => p.id === id);
  if (idx >= 0) {
    inMemoryPromoCodes.splice(idx, 1);
    return true;
  }
  return false;
}

// Helper: Map Supabase database row to ReferralLink interface
function mapReferralRow(row: any): ReferralLink {
  return {
    id: row.id,
    code: row.code,
    affiliateName: row.affiliate_name,
    affiliateEmail: row.affiliate_email || '',
    organizerEmail: row.organizer_email || undefined,
    type: row.type || 'campus_ambassador',
    eventId: row.event_id,
    eventTitle: row.event_title || '',
    commissionPercent: Number(row.commission_percent) || 0,
    discountPercent: Number(row.discount_percent) || 0,
    clickCount: Number(row.click_count) || 0,
    conversionsCount: Number(row.conversions_count) || 0,
    totalRevenueGenerated: Number(row.total_revenue_generated) || 0,
    totalCommissionEarned: Number(row.total_commission_earned) || 0,
    totalDiscountGiven: Number(row.total_discount_given) || 0,
    payoutStatus: row.payout_status || 'unpaid',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// Helper: Get all referral links
export async function getReferralLinks(organizerEmail?: string, eventId?: string): Promise<ReferralLink[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      let query = supabase.from('referral_links').select('*').order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      if (organizerEmail) {
        query = query.eq('organizer_email', organizerEmail.toLowerCase().trim());
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(mapReferralRow);
      }
    } catch (err) {
      console.warn('[PromotionsRepository] Supabase referral_links lookup failed, falling back to local:', err);
    }
  }

  let list = [...inMemoryReferralLinks];
  if (eventId) {
    list = list.filter(r => r.eventId === eventId);
  }
  if (organizerEmail) {
    const clean = organizerEmail.toLowerCase().trim();
    list = list.filter(r => !r.organizerEmail || r.organizerEmail.toLowerCase().trim() === clean);
  }
  return list;
}

// Helper: Get single referral link by code
export async function getReferralByCode(code: string): Promise<ReferralLink | null> {
  const clean = code.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('referral_links')
        .select('*')
        .ilike('code', clean)
        .maybeSingle();

      if (!error && data) {
        return mapReferralRow(data);
      }
    } catch (err) {
      console.warn('[PromotionsRepository] Supabase referral by code failed, falling back to local:', err);
    }
  }

  const match = inMemoryReferralLinks.find(r => r.code === clean);
  return match || null;
}

// Helper: Update referral discount percent
export async function updateReferralDiscount(id: string, discountPercent: number): Promise<ReferralLink | null> {
  const cleanDiscount = Math.max(0, Math.min(100, Math.round(discountPercent)));

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('referral_links')
        .update({ discount_percent: cleanDiscount })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (!error && data) {
        return mapReferralRow(data);
      }
    } catch (err) {
      console.warn('[PromotionsRepository] Supabase updateReferralDiscount failed, falling back to local:', err);
    }
  }

  const match = inMemoryReferralLinks.find(r => r.id === id);
  if (match) {
    match.discountPercent = cleanDiscount;
    return match;
  }
  return null;
}

// Helper: Create referral link
export async function createReferralLink(data: Omit<ReferralLink, 'id' | 'clickCount' | 'conversionsCount' | 'totalRevenueGenerated' | 'totalCommissionEarned' | 'totalDiscountGiven' | 'payoutStatus' | 'createdAt'>): Promise<ReferralLink> {
  const cleanCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const newRef: ReferralLink = {
    ...data,
    id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    code: cleanCode,
    discountPercent: Number(data.discountPercent) || 0,
    clickCount: 0,
    conversionsCount: 0,
    totalRevenueGenerated: 0,
    totalCommissionEarned: 0,
    totalDiscountGiven: 0,
    payoutStatus: 'unpaid',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: inserted, error } = await supabase
        .from('referral_links')
        .insert({
          id: newRef.id,
          code: newRef.code,
          affiliate_name: newRef.affiliateName,
          affiliate_email: newRef.affiliateEmail,
          organizer_email: newRef.organizerEmail?.toLowerCase().trim(),
          type: newRef.type,
          event_id: newRef.eventId,
          event_title: newRef.eventTitle,
          commission_percent: newRef.commissionPercent,
          discount_percent: newRef.discountPercent,
          click_count: 0,
          conversions_count: 0,
          total_revenue_generated: 0,
          total_commission_earned: 0,
          total_discount_given: 0,
          payout_status: 'unpaid',
          created_at: newRef.createdAt,
        })
        .select()
        .maybeSingle();

      if (!error && inserted) {
        return mapReferralRow(inserted);
      } else if (error) {
        console.warn('[PromotionsRepository] Supabase referral link insertion error:', error.message);
      }
    } catch (err) {
      console.warn('[PromotionsRepository] Supabase createReferralLink failed, falling back to local:', err);
    }
  }

  inMemoryReferralLinks.unshift(newRef);
  return newRef;
}

// Helper: Record referral click
export async function recordReferralClick(code: string): Promise<ReferralLink | null> {
  const clean = code.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: existing } = await supabase
        .from('referral_links')
        .select('id, click_count')
        .ilike('code', clean)
        .maybeSingle();

      if (existing) {
        const { data: updated, error } = await supabase
          .from('referral_links')
          .update({ click_count: (Number(existing.click_count) || 0) + 1 })
          .eq('id', existing.id)
          .select()
          .maybeSingle();

        if (!error && updated) {
          return mapReferralRow(updated);
        }
      }
    } catch (err) {
      console.warn('[PromotionsRepository] Supabase recordReferralClick failed, falling back to local:', err);
    }
  }

  const match = inMemoryReferralLinks.find(r => r.code === clean);
  if (match) {
    match.clickCount += 1;
    return match;
  }
  return null;
}

// Helper: Record referral conversion upon successful checkout
export async function recordReferralConversion(code: string, orderTotal: number, discountGiven: number = 0): Promise<ReferralLink | null> {
  const clean = code.trim().toUpperCase();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminClient();
      const { data: existing } = await supabase
        .from('referral_links')
        .select('*')
        .ilike('code', clean)
        .maybeSingle();

      if (existing) {
        const commissionPercent = Number(existing.commission_percent) || 0;
        const earned = Math.round((orderTotal * commissionPercent) / 100);

        const { data: updated, error } = await supabase
          .from('referral_links')
          .update({
            conversions_count: (Number(existing.conversions_count) || 0) + 1,
            total_revenue_generated: (Number(existing.total_revenue_generated) || 0) + orderTotal,
            total_discount_given: (Number(existing.total_discount_given) || 0) + Math.round(discountGiven),
            total_commission_earned: (Number(existing.total_commission_earned) || 0) + earned,
          })
          .eq('id', existing.id)
          .select()
          .maybeSingle();

        if (!error && updated) {
          return mapReferralRow(updated);
        }
      }
    } catch (err) {
      console.warn('[PromotionsRepository] Supabase recordReferralConversion failed, falling back to local:', err);
    }
  }

  const match = inMemoryReferralLinks.find(r => r.code === clean);
  if (match) {
    match.conversionsCount += 1;
    match.totalRevenueGenerated += orderTotal;
    match.totalDiscountGiven += Math.round(discountGiven);
    const commission = Math.round((orderTotal * match.commissionPercent) / 100);
    match.totalCommissionEarned += commission;
    return match;
  }
  return null;
}

