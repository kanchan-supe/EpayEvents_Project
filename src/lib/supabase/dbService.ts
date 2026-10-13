import { supabase, isSupabaseConfigured } from './client';
import { EventItem, EventCategory, Organization, TicketIssued } from '../types';
import { mockCategories, mockEvents } from '../data';

// =========================================================================
// Types for DB mapping
// =========================================================================
export interface DbEventRow {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  banner_url?: string;
  event_type: 'physical' | 'online' | 'hybrid';
  status: 'draft' | 'published' | 'cancelled' | 'ended';
  start_date: string;
  end_date: string;
  timezone: string;
  featured: boolean;
  category_id?: string;
  category_slug?: string;
  organization_id?: string;
  venue?: any;
  speakers?: any[];
  agenda?: any[];
  facilities?: any[];
  sponsors?: any[];
  exhibitors?: any[];
  faqs?: any[];
  registration_fields?: any[];
  coupons?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface DbOrderPayload {
  id: string;
  event_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  total: number;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  payment_method: string;
  tickets_count: number;
  approval_required: boolean;
}

export interface DbTicketPayload {
  id: string;
  order_id: string;
  event_id: string;
  event_title: string;
  ticket_type_id: string;
  ticket_name: string;
  category: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone?: string;
  price_paid: number;
  qr_payload: string;
  status: 'valid' | 'used' | 'cancelled' | 'transferred' | 'pending_approval' | 'refunded';
}

// Convert DB Event Row to EventItem domain model
export function mapDbEventToItem(row: any, categories: EventCategory[] = mockCategories): EventItem {
  const cat = categories.find(c => c.slug === row.category_slug || c.id === row.category_id) || {
    id: row.category_id || 'cat-gen',
    name: row.category_slug ? row.category_slug.replace('-', ' ') : 'General',
    slug: row.category_slug || 'general',
    icon: 'Cpu',
    description: '',
  };

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description || '',
    description: row.description || '',
    bannerUrl: row.banner_url || '/banners/default.jpg',
    eventType: row.event_type || 'physical',
    status: row.status || 'published',
    startDate: row.start_date,
    endDate: row.end_date,
    timezone: row.timezone || 'IST',
    featured: Boolean(row.featured),
    category: cat,
    organization: row.organization || {
      id: row.organization_id || 'org-1',
      name: 'ePayEvents Host',
      slug: 'epay-host',
      verified: true,
      contactEmail: 'contact@epayevents.com',
    },
    venue: row.venue || {
      name: 'Convention Center',
      address: '',
      city: 'Mumbai',
      country: 'India',
    },
    ticketTypes: row.ticket_types && row.ticket_types.length > 0 ? row.ticket_types : [
      {
        id: `tkt-${row.id}-1`,
        name: 'General Admission Pass',
        description: 'Access to main hall and keynotes',
        price: 999,
        quantity: 200,
        remainingQuantity: 180,
        minPerOrder: 1,
        maxPerOrder: 5,
        category: 'General',
      }
    ],
    speakers: row.speakers || [],
    agenda: row.agenda || [],
    facilities: row.facilities || [],
    sponsors: row.sponsors || [],
    exhibitors: row.exhibitors || [],
    faqs: row.faqs || [],
    registrationFields: row.registration_fields || [],
  };
}

// Convert EventItem to DB Payload
export function mapItemToDbPayload(item: Partial<EventItem>): Partial<DbEventRow> {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    short_description: item.shortDescription,
    description: item.description,
    banner_url: item.bannerUrl,
    event_type: item.eventType,
    status: item.status,
    start_date: item.startDate,
    end_date: item.endDate,
    timezone: item.timezone,
    featured: item.featured,
    category_id: item.category?.id,
    category_slug: item.category?.slug,
    organization_id: item.organization?.id,
    venue: item.venue,
    speakers: item.speakers,
    agenda: item.agenda,
    facilities: item.facilities,
    sponsors: item.sponsors,
    exhibitors: item.exhibitors,
    faqs: item.faqs,
    registration_fields: item.registrationFields,
  };
}

// =========================================================================
// API & Query Functions
// =========================================================================

/**
 * Fetch all events from Supabase with filters and mock fallback
 */
export async function getEventsFromSupabase(filters?: {
  query?: string;
  category?: string;
  location?: string;
  eventType?: string;
  price?: string;
}): Promise<EventItem[]> {
  if (isSupabaseConfigured()) {
    try {
      let queryBuilder = supabase
        .from('events')
        .select('*, ticket_types(*)')
        .order('start_date', { ascending: true });

      if (filters?.query) {
        queryBuilder = queryBuilder.ilike('title', `%${filters.query}%`);
      }
      if (filters?.eventType && filters.eventType !== 'all') {
        queryBuilder = queryBuilder.eq('event_type', filters.eventType);
      }
      if (filters?.category && filters.category !== 'all') {
        queryBuilder = queryBuilder.eq('category_slug', filters.category);
      }

      const { data, error } = await queryBuilder;
      if (!error && data && data.length > 0) {
        let mapped = data.map(row => mapDbEventToItem(row));
        
        if (filters?.location && filters.location !== 'all') {
          const loc = filters.location.toLowerCase();
          mapped = mapped.filter(e => e.venue.city.toLowerCase() === loc);
        }
        if (filters?.price) {
          if (filters.price === 'free') {
            mapped = mapped.filter(e => e.ticketTypes.some(t => t.price === 0));
          } else if (filters.price === 'paid') {
            mapped = mapped.filter(e => e.ticketTypes.some(t => t.price > 0));
          }
        }
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase getEvents query failed, falling back to mock data:', err);
    }
  }

  // Fallback to local mock data
  let list = [...mockEvents];
  if (filters?.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(e => e.title.toLowerCase().includes(q) || e.shortDescription.toLowerCase().includes(q) || e.venue.city.toLowerCase().includes(q));
  }
  if (filters?.category && filters.category !== 'all') {
    list = list.filter(e => e.category.slug === filters.category);
  }
  if (filters?.location && filters.location !== 'all') {
    const loc = filters.location.toLowerCase();
    list = list.filter(e => e.venue.city.toLowerCase() === loc);
  }
  if (filters?.eventType && filters.eventType !== 'all') {
    list = list.filter(e => e.eventType === filters.eventType);
  }
  if (filters?.price) {
    if (filters.price === 'free') {
      list = list.filter(e => e.ticketTypes.some(t => t.price === 0));
    } else if (filters.price === 'paid') {
      list = list.filter(e => e.ticketTypes.some(t => t.price > 0));
    }
  }
  return list;
}

/**
 * Fetch a single event by slug
 */
export async function getEventBySlugFromSupabase(slug: string): Promise<EventItem | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*, ticket_types(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return mapDbEventToItem(data);
      }
    } catch (err) {
      console.warn('Supabase getEventBySlug error:', err);
    }
  }

  // Fallback to mockEvents
  return mockEvents.find(e => e.slug === slug) || mockEvents[0] || null;
}

/**
 * Save new event to Supabase
 */
export async function insertEventToSupabase(eventItem: EventItem) {
  if (!isSupabaseConfigured()) {
    return { data: eventItem, error: null, isMock: true };
  }

  try {
    const dbPayload = mapItemToDbPayload(eventItem);
    const { data, error } = await supabase
      .from('events')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;

    // Insert associated ticket types
    if (eventItem.ticketTypes && eventItem.ticketTypes.length > 0) {
      const ticketRows = eventItem.ticketTypes.map(t => ({
        id: t.id,
        event_id: eventItem.id,
        name: t.name,
        description: t.description || '',
        price: t.price,
        original_price: t.originalPrice || null,
        quantity: t.quantity,
        remaining_quantity: t.remainingQuantity || t.quantity,
        min_per_order: t.minPerOrder || 1,
        max_per_order: t.maxPerOrder || 10,
        features: t.features || [],
        is_popular: Boolean(t.isPopular),
        category: t.category || 'General',
        is_early_bird: Boolean(t.isEarlyBird),
        is_dynamic_pricing: Boolean(t.isDynamicPricing),
        is_group_discount: Boolean(t.isGroupDiscount),
        is_hidden: Boolean(t.isHidden),
        access_passcode: t.accessPasscode || null,
        is_approval_required: Boolean(t.isApprovalRequired),
        is_waitlist: Boolean(t.isWaitlist),
        is_complimentary: Boolean(t.isComplimentary),
        is_transferrable: t.isTransferrable ?? true,
        is_refundable: t.isRefundable ?? true,
      }));

      await supabase.from('ticket_types').insert(ticketRows);
    }

    return { data, error: null, isMock: false };
  } catch (err: any) {
    console.error('Error saving event to Supabase:', err);
    return { data: null, error: err, isMock: false };
  }
}

/**
 * Create order and issued ticket in Supabase
 */
export async function createOrderInSupabase(
  order: DbOrderPayload,
  ticket: DbTicketPayload
) {
  if (!isSupabaseConfigured()) {
    return { order, ticket, isMock: true, error: null };
  }

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (orderError) throw orderError;

    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .insert([ticket])
      .select()
      .single();

    if (ticketError) throw ticketError;

    return { order: orderData, ticket: ticketData, error: null, isMock: false };
  } catch (err: any) {
    console.error('Error inserting order to Supabase:', err);
    return { order: null, ticket: null, error: err, isMock: false };
  }
}

/**
 * Realtime subscription for live ticket / checkin updates
 */
export function subscribeToTicketUpdates(onUpdate: (payload: any) => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('tickets_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tickets' },
      payload => onUpdate(payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
