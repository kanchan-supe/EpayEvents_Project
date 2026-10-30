import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { EventItem, EventCategory, Organization, TicketType, EventVenue } from '@/lib/types';
import { getAllEvents, addPublishedEvent, recordEditedEvent, getEditedEvent, mockCategories } from '@/lib/data';

/**
 * Generate a clean, URL-friendly slug from an event title
 */
export function generateSlug(title: string): string {
  if (!title) return `event-${Date.now()}`;
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-alphanumeric chars (except spaces and dashes)
    .replace(/[\s_-]+/g, '-')       // Replace spaces, underscores and multiple dashes with single dash
    .replace(/^-+|-+$/g, '');       // Trim leading and trailing dashes
}

/**
 * Format a time string (e.g., '10:00' or '18:30') to '10:00 AM' or '06:30 PM'
 */
export function formatDisplayTime(timeStr?: string): string {
  if (!timeStr) return '10:00 AM';
  const trimmed = timeStr.trim();
  if (/(AM|PM)$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours.toString().padStart(2, '0')}:${displayMinutes} ${period}`;
    }
  }
  return trimmed;
}

/**
 * Returns event status based on event date + current date:
 * - 'live' → Event date is today
 * - 'upcoming' → Event date is in the future
 * - 'past' → Event date is in the past
 */
export function getEventStatus(eventDateStr?: string): 'live' | 'upcoming' | 'past' {
  if (!eventDateStr) return 'upcoming';

  // Normalize event date to YYYY-MM-DD
  let normalizedDate = '';
  const dMatch = String(eventDateStr).match(/^(\d{4}-\d{2}-\d{2})/);
  if (dMatch) {
    normalizedDate = dMatch[1];
  } else {
    try {
      const parsed = new Date(eventDateStr);
      if (!isNaN(parsed.getTime())) {
        normalizedDate = parsed.toISOString().split('T')[0];
      }
    } catch {
      return 'upcoming';
    }
  }

  if (!normalizedDate) return 'upcoming';

  // Get current date in IST / local time YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (normalizedDate === todayStr) {
    return 'live';
  } else if (normalizedDate > todayStr) {
    return 'upcoming';
  } else {
    return 'past';
  }
}

/**
 * Helper to parse time string like '10:00 AM' or '18:30' into minutes from midnight for accurate secondary sorting
 */
function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const trimmed = timeStr.trim().toUpperCase();
  const isPM = trimmed.includes('PM');
  const isAM = trimmed.includes('AM');
  const cleaned = trimmed.replace(/[^\d:]/g, '');
  const parts = cleaned.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  return 0;
}

/**
 * Sort events by date ascending (nearest date first), and by startTime if dates are equal
 */
export function sortEventsByDate<T extends { date?: string; startDate?: string; startTime?: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const rawDateA = (a.date || a.startDate || '').split('T')[0] || '9999-99-99';
    const rawDateB = (b.date || b.startDate || '').split('T')[0] || '9999-99-99';

    if (rawDateA !== rawDateB) {
      return rawDateA.localeCompare(rawDateB);
    }

    const timeA = parseTimeToMinutes(a.startTime);
    const timeB = parseTimeToMinutes(b.startTime);
    return timeA - timeB;
  });
}

/**
 * Map a raw Supabase database row to an application EventItem
 */
export function mapDbRowToEventItem(row: any): EventItem {
  const categoryName = row.category || 'Technology & AI';
  const categorySlug = row.category_slug || generateSlug(categoryName);
  const category: EventCategory = mockCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase() || c.slug === categorySlug) || {
    id: `cat-${categorySlug}`,
    name: categoryName,
    slug: categorySlug,
    icon: 'Cpu',
    description: '',
  };

  const organization: Organization = {
    id: row.organizer_id || 'org-epay',
    name: 'ePayEvents Organizer',
    slug: 'epay-organizer',
    verified: true,
    contactEmail: 'contact@epayevents.com',
  };

  const venueName = typeof row.venue === 'object' && row.venue !== null
    ? (row.venue.name || 'Main Venue')
    : (row.venue || (row.is_online ? 'Online Event' : 'Main Venue'));

  const venueCity = typeof row.venue === 'object' && row.venue !== null
    ? (row.venue.city || row.city || 'Mumbai')
    : (row.city || (row.is_online ? 'Virtual' : 'Mumbai'));

  const venueAddress = typeof row.venue === 'object' && row.venue !== null
    ? (row.venue.address || row.address || '')
    : (row.address || '');

  const venue: EventVenue = {
    name: venueName,
    address: venueAddress,
    city: venueCity,
    country: 'India',
  };

  // Clean date and time parsing without UTC offset shifts
  let dateStr = row.date || '';
  if (!dateStr && row.start_date) {
    const dMatch = String(row.start_date).match(/^(\d{4}-\d{2}-\d{2})/);
    if (dMatch) dateStr = dMatch[1];
  }
  if (!dateStr) dateStr = '2026-11-15';

  let endDateStr = '';
  if (row.end_date) {
    const dMatch = String(row.end_date).match(/^(\d{4}-\d{2}-\d{2})/);
    if (dMatch) endDateStr = dMatch[1];
  }
  if (!endDateStr) endDateStr = dateStr;

  const startTimeStr = row.start_time ? formatDisplayTime(row.start_time) : '10:00 AM';
  const endTimeStr = row.end_time ? formatDisplayTime(row.end_time) : '06:00 PM';

  const timeClean = row.start_time ? row.start_time.replace(/\s*(AM|PM)/i, '').trim() : '10:00';
  const endTimeClean = row.end_time ? row.end_time.replace(/\s*(AM|PM)/i, '').trim() : '18:00';

  // Construct ISO strings WITHOUT trailing 'Z' so local browser Date never shifts +5:30
  const startDate = `${dateStr}T${timeClean}:00`;
  const endDate = `${endDateStr}T${endTimeClean}:00`;

  let ticketTypes: TicketType[] = [];
  if (Array.isArray(row.ticket_types) && row.ticket_types.length > 0) {
    ticketTypes = row.ticket_types;
  } else if (Array.isArray(row.tickets) && row.tickets.length > 0) {
    ticketTypes = row.tickets;
  } else {
    ticketTypes = [
      {
        id: `tkt-${row.id}-1`,
        name: 'General Admission',
        description: 'Standard event pass',
        price: Number(row.starting_price) || 499,
        quantity: 200,
        remainingQuantity: 180,
        minPerOrder: 1,
        maxPerOrder: 5,
        category: 'General',
        features: ['Full Event Access', 'Instant QR Pass'],
      },
    ];
  }

  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description || (row.description ? row.description.slice(0, 160) : `${row.title} - Hosted on ePayEvents.`),
    description: row.description || `Welcome to ${row.title}. Register and book passes on ePayEvents.`,
    bannerUrl: row.cover_image || row.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    eventType: row.is_online ? 'online' : (row.event_type || 'physical'),
    status: row.status || 'published',
    startDate,
    endDate,
    startTime: startTimeStr,
    endTime: endTimeStr,
    date: dateStr,
    timezone: row.timezone || 'IST',
    featured: Boolean(row.featured ?? true),
    category,
    organization,
    venue,
    ticketTypes,
    speakers: Array.isArray(row.speakers) ? row.speakers : [],
    agenda: Array.isArray(row.agenda) ? row.agenda : [],
    facilities: Array.isArray(row.facilities) ? row.facilities : [],
    sponsors: Array.isArray(row.sponsors) ? row.sponsors : [],
    exhibitors: Array.isArray(row.exhibitors) ? row.exhibitors : [],
    faqs: Array.isArray(row.faqs) ? row.faqs : [],
    registrationFields: Array.isArray(row.registration_fields) ? row.registration_fields : [],
  };
}

/**
 * Map an EventItem or form payload to the Supabase events database row payload
 */
export function mapEventItemToDbRow(item: Partial<EventItem> | any): Record<string, any> {
  const minPrice = Array.isArray(item.ticketTypes) && item.ticketTypes.length > 0
    ? Math.min(...item.ticketTypes.map((t: any) => t.price))
    : Number(item.startingPrice) || 0;

  // Extract clean date without timezone offset
  let dateFormatted = item.date || '';
  if (!dateFormatted && item.startDate) {
    const dMatch = item.startDate.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dMatch) dateFormatted = dMatch[1];
  }
  if (!dateFormatted) dateFormatted = '2026-11-15';

  let endDateFormatted = '';
  if (item.endDate) {
    const dMatch = item.endDate.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dMatch) endDateFormatted = dMatch[1];
  }
  if (!endDateFormatted) endDateFormatted = dateFormatted;

  // Extract clean time without timezone offset (preserves exact 10:00)
  let startTimeFormatted = item.startTime || '';
  if (!startTimeFormatted && item.startDate) {
    const tMatch = item.startDate.match(/T(\d{2}:\d{2})/);
    if (tMatch && tMatch[1] !== '00:00') {
      startTimeFormatted = tMatch[1];
    }
  }
  if (!startTimeFormatted) startTimeFormatted = '10:00';
  const cleanStartTime = startTimeFormatted.replace(/\s*(AM|PM)/i, '').trim();

  let endTimeFormatted = item.endTime || '';
  if (!endTimeFormatted && item.endDate) {
    const tMatch = item.endDate.match(/T(\d{2}:\d{2})/);
    if (tMatch && tMatch[1] !== '00:00') {
      endTimeFormatted = tMatch[1];
    }
  }
  if (!endTimeFormatted) endTimeFormatted = '18:00';
  const cleanEndTime = endTimeFormatted.replace(/\s*(AM|PM)/i, '').trim();

  const categoryName = typeof item.category === 'object' 
    ? (item.category?.name || 'Technology & AI')
    : (item.category || item.categorySlug || 'Technology & AI');

  const venueName = typeof item.venue === 'object'
    ? (item.venue?.name || 'Main Convention Hall')
    : (item.venue || item.venueName || 'Main Convention Hall');

  const cityName = typeof item.venue === 'object'
    ? (item.venue?.city || 'Mumbai')
    : (item.city || 'Mumbai');

  const addressStr = typeof item.venue === 'object'
    ? (item.venue?.address || '')
    : (item.address || '');

  const row: Record<string, any> = {
    title: item.title,
    slug: item.slug,
    description: item.description || item.shortDescription || '',
    cover_image: item.bannerUrl || item.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    status: item.status || 'published',
    date: dateFormatted,
    start_time: cleanStartTime,
    end_time: cleanEndTime,
    category: categoryName,
    venue: venueName,
    city: cityName,
    address: addressStr,
    starting_price: minPrice,
    is_online: item.eventType === 'online' || item.isOnline === true,
  };

  return row;
}

/**
 * 1. Fetch only published events (status = 'published')
 */
export async function getPublishedEvents(): Promise<EventItem[]> {
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      let { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('date', { ascending: true });

      if (error) {
        console.warn('[eventRepository] Supabase order(date) notice:', error.message);
        const fallbackRes = await supabase
          .from('events')
          .select('*')
          .eq('status', 'published');
        if (!fallbackRes.error && fallbackRes.data) {
          data = fallbackRes.data;
          error = null;
        }
      }

      if (!error && data && data.length > 0) {
        const mapped = data.map(row => {
          const item = mapDbRowToEventItem(row);
          const edited = getEditedEvent(item.id) || getEditedEvent(item.slug);
          return edited ? { ...item, ...edited } : item;
        });

        // Merge any edited or newly added events not yet in Supabase
        getAllEvents().forEach(evt => {
          if (evt.status === 'published' && !mapped.some(m => m.id === evt.id || m.slug === evt.slug)) {
            mapped.unshift(evt);
          }
        });

        return sortEventsByDate(mapped);
      }
    }
  } catch (err) {
    console.warn('[eventRepository] Supabase query failed, falling back to local store:', err);
  }

  // Fallback to local store
  const all = getAllEvents();
  const published = all.filter(e => e.status === 'published');
  return sortEventsByDate(published);
}

/**
 * 2. Fetch a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  if (!slug) return null;

  const edited = getEditedEvent(slug);

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      
      // 1. Try finding by exact slug
      let { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      // 2. If not found, try finding by event id (in case registration passed event_id instead of slug)
      if (!data) {
        const idRes = await supabase
          .from('events')
          .select('*')
          .eq('id', slug)
          .maybeSingle();
        if (idRes.data) {
          data = idRes.data;
          error = null;
        }
      }

      // 3. If still not found and slug has dashes, try finding by title ILIKE
      if (!data) {
        const titleQuery = slug.replace(/-/g, ' ');
        const titleRes = await supabase
          .from('events')
          .select('*')
          .ilike('title', `%${titleQuery}%`)
          .limit(1);
        if (titleRes.data && titleRes.data.length > 0) {
          data = titleRes.data[0];
          error = null;
        }
      }

      if (!error && data) {
        const mapped = mapDbRowToEventItem(data);

        // Fetch organizer if organizer_id exists
        if (data.organizer_id) {
          try {
            const { data: orgData } = await supabase
              .from('organizers')
              .select('*')
              .eq('id', data.organizer_id)
              .maybeSingle();
            if (orgData) {
              mapped.organization = {
                id: orgData.id,
                name: orgData.name,
                slug: generateSlug(orgData.name),
                verified: true,
                contactEmail: orgData.email || '',
                avatar: orgData.logo || '/team/rahul.jpg',
              };
            }
          } catch (orgErr) {
            console.warn('[eventRepository] Could not fetch organizer details:', orgErr);
          }
        }

        // Fetch custom registration fields for this event
        try {
          const { data: rfData } = await supabase
            .from('registration_fields')
            .select('*')
            .eq('event_id', data.id);
          if (rfData && rfData.length > 0) {
            mapped.registrationFields = rfData.map(rf => ({
              id: rf.id,
              label: rf.label,
              fieldType: rf.type || 'text',
              required: Boolean(rf.required),
              options: rf.options,
            }));
          }
        } catch (rfErr) {
          console.warn('[eventRepository] Could not fetch registration fields:', rfErr);
        }

        // Fetch tickets from tickets table if available
        try {
          const { data: tktData } = await supabase
            .from('tickets')
            .select('*')
            .eq('event_id', data.id);
          if (tktData && tktData.length > 0) {
            mapped.ticketTypes = tktData.map(t => ({
              id: t.id,
              name: t.name,
              description: t.description || 'Standard pass',
              price: Number(t.price) || 0,
              quantity: 200,
              remainingQuantity: (t.remaining_quantity !== undefined && t.remaining_quantity !== null) ? Number(t.remaining_quantity) : 200,
              minPerOrder: 1,
              maxPerOrder: 5,
              category: 'General',
              features: ['Full Event Access', 'Instant QR Pass'],
            }));
          }
        } catch (tErr) {
          console.warn('[eventRepository] Could not fetch tickets table:', tErr);
        }

        // Merge with local static ticketTypes if available so waitlist/custom tiers from mock are preserved
        const localMatch = getAllEvents().find(e => e.slug === data.slug || e.id === data.id);
        if (localMatch && Array.isArray(localMatch.ticketTypes) && localMatch.ticketTypes.length > 0) {
          if (!mapped.ticketTypes || mapped.ticketTypes.length === 0) {
            mapped.ticketTypes = localMatch.ticketTypes;
          } else {
            // Include any rich tiers like waitlist workshops from local definition
            localMatch.ticketTypes.forEach(lt => {
              if (!mapped.ticketTypes.some(mt => mt.id === lt.id || mt.name === lt.name)) {
                mapped.ticketTypes.push(lt);
              }
            });
          }
        }

        const effectiveEdited = edited || (data?.id ? getEditedEvent(String(data.id)) : null);
        const finalItem = effectiveEdited ? { ...mapped, ...effectiveEdited } : mapped;
        addPublishedEvent(finalItem);
        return finalItem;
      }
    }
  } catch (err) {
    console.warn(`[eventRepository] Supabase query for slug "${slug}" failed:`, err);
  }

  if (edited) return edited;

  // Fallback to local store (search by slug or id or loose slug match or title)
  const all = getAllEvents();
  const normalizedSlug = slug.toLowerCase().trim();
  const match = all.find(e => 
    (e.slug && e.slug.toLowerCase() === normalizedSlug) || 
    (e.id && String(e.id).toLowerCase() === normalizedSlug) ||
    generateSlug(e.title) === normalizedSlug ||
    e.title.toLowerCase() === normalizedSlug ||
    e.title.toLowerCase().includes(normalizedSlug.replace(/-/g, ' '))
  );
  if (match) return match;

  // Also check if any persisted event in memory or localStorage has this title or slug
  const publishedMem = getEditedEvent(normalizedSlug);
  if (publishedMem) return publishedMem;

  return null;
}

/**
 * 3. Fetch a single event by ID
 */
export async function getEventById(id: string): Promise<EventItem | null> {
  if (!id) return null;
  const edited = getEditedEvent(id);

  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        const mapped = mapDbRowToEventItem(data);
        const effectiveEdited = edited || getEditedEvent(String(data.id)) || (mapped.slug ? getEditedEvent(mapped.slug) : null);
        const finalItem = effectiveEdited ? { ...mapped, ...effectiveEdited } : mapped;
        addPublishedEvent(finalItem);
        return finalItem;
      }
    }
  } catch (err) {
    console.warn(`[eventRepository] Supabase query for id "${id}" failed:`, err);
  }

  if (edited) return edited;

  // Fallback to local store
  const all = getAllEvents();
  return all.find(e => e.id === id) || null;
}

/**
 * 4. Create a new event and persist to Supabase events table
 */
export async function createEvent(data: Partial<EventItem> | any): Promise<EventItem> {
  if (!data.title || !data.title.trim()) {
    throw new Error('Event title is required.');
  }

  // Auto-generate slug from title if not given
  const title = data.title.trim();
  const slug = data.slug ? generateSlug(data.slug) : generateSlug(title);
  const id = data.id || `evt_${Math.random().toString(36).substring(2, 9)}`;

  // Default status to 'published' when publishing
  const status = data.status === 'draft' ? 'draft' : 'published';

  // Format all four date & time fields cleanly without UTC trailing 'Z'
  let rawStartDate = data.startDate || data.start_date || data.date || '';
  if (!rawStartDate) rawStartDate = '2026-11-15';
  const cleanStartDate = rawStartDate.includes('T') ? rawStartDate.split('T')[0] : rawStartDate;

  let rawEndDate = data.endDate || data.end_date || cleanStartDate;
  const cleanEndDate = rawEndDate.includes('T') ? rawEndDate.split('T')[0] : rawEndDate;

  const startTimeStr = formatDisplayTime(data.startTime || '10:00 AM');
  const endTimeStr = formatDisplayTime(data.endTime || '06:00 PM');

  const cleanStartTime = startTimeStr.replace(/\s*(AM|PM)/i, '').trim();
  const cleanEndTime = endTimeStr.replace(/\s*(AM|PM)/i, '').trim();

  const startDateIso = `${cleanStartDate}T${cleanStartTime}:00`;
  const endDateIso = `${cleanEndDate}T${cleanEndTime}:00`;

  const categorySlug = data.categorySlug || data.category?.slug || 'tech-ai';
  const category = mockCategories.find(c => c.slug === categorySlug) || mockCategories[0];

  const fullEventItem: EventItem = {
    id,
    title,
    slug,
    shortDescription: data.shortDescription || data.short_description || `${title} - Organized on ePayEvents.`,
    description: data.description || `Welcome to ${title}. Book your tickets now on ePayEvents!`,
    bannerUrl: data.bannerUrl || data.banner_url || data.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
    eventType: data.eventType || data.event_type || (data.isOnline ? 'online' : 'physical'),
    status,
    startDate: startDateIso,
    endDate: endDateIso,
    startTime: startTimeStr,
    endTime: endTimeStr,
    date: cleanStartDate,
    timezone: data.timezone || 'IST',
    featured: Boolean(data.featured ?? true),
    category,
    organization: {
      id: data.organizerId || data.organizer_id || data.userId || data.organization?.id || `org-${Date.now()}`,
      name: data.organizerName || data.organization?.name || 'ePayEvents Organizer',
      slug: generateSlug(data.organizerName || data.organization?.name || 'organizer'),
      verified: true,
      contactEmail: data.organizerEmail || data.organization?.contactEmail || 'organizer@epayevents.com',
      avatar: data.organizerAvatar || data.organization?.avatar || '/team/rahul.jpg',
      bio: data.organizerBio || data.organization?.bio || 'Event host on ePayEvents platform',
    },
    venue: {
      name: data.venueName || data.venue?.name || data.venue || (data.eventType === 'online' || data.isOnline ? 'Online Event' : 'Main Venue'),
      address: data.address || data.venue?.address || (data.eventType === 'online' || data.isOnline ? 'Virtual' : ''),
      city: data.city || data.venue?.city || (data.eventType === 'online' || data.isOnline ? 'Virtual' : 'Mumbai'),
      country: 'India',
      onlineUrl: data.onlineUrl || data.venue?.onlineUrl,
    },
    ticketTypes: Array.isArray(data.ticketTypes) && data.ticketTypes.length > 0 
      ? data.ticketTypes 
      : Array.isArray(data.tickets) && data.tickets.length > 0
      ? data.tickets
      : [
          {
            id: `tkt-${id}-1`,
            name: 'General Admission',
            description: 'Standard event pass',
            price: Number(data.startingPrice) || 499,
            quantity: 200,
            remainingQuantity: 200,
            minPerOrder: 1,
            maxPerOrder: 5,
            category: 'General',
            features: ['Full Event Access', 'Instant QR Ticket'],
            isPopular: true,
          },
        ],
    speakers: Array.isArray(data.speakers) ? data.speakers : [],
    agenda: Array.isArray(data.agenda) ? data.agenda : [],
    facilities: Array.isArray(data.facilities) ? data.facilities : [],
    sponsors: Array.isArray(data.sponsors) ? data.sponsors : [],
    exhibitors: Array.isArray(data.exhibitors) ? data.exhibitors : [],
    faqs: Array.isArray(data.faqs) ? data.faqs : [],
    registrationFields: Array.isArray(data.registrationFields) ? data.registrationFields : [],
  };

  // 1. Try to persist to Supabase events table
  try {
    if (isSupabaseConfigured()) {
      const { createAdminClient } = await import('@/lib/supabase/server');
      const supabase = createAdminClient();

      // Step A: Save organizer details to the organizers table
      let organizerId: string | null = data.organizerId || data.organizer_id || data.userId || null;
      if (!organizerId) {
        try {
          const orgName = data.organizerName || fullEventItem.organization?.name || 'ePay Organizer';
          const orgEmail = data.organizerEmail || fullEventItem.organization?.contactEmail || '';
          const orgPhone = data.organizerPhone || data.phone || '';
          const orgLogo = data.organizerAvatar || fullEventItem.organization?.avatar || '/team/rahul.jpg';

          const { data: orgData, error: orgError } = await supabase
            .from('organizers')
            .insert([{
              name: orgName,
              email: orgEmail,
              phone: orgPhone,
              logo: orgLogo,
            }])
            .select()
            .single();

          if (!orgError && orgData) {
            organizerId = orgData.id;
            console.log(`[eventRepository] Saved organizer "${orgName}" to organizers table (ID: ${orgData.id})`);
          } else if (orgError) {
            console.warn('[eventRepository] Organizers table notice:', orgError.message);
          }
        } catch (orgErr) {
          console.warn('[eventRepository] Error saving organizer:', orgErr);
        }
      }

      // Step B: Insert into events table
      const dbPayload = mapEventItemToDbRow(fullEventItem);
      // Only include organizer_id if it's a valid uuid, otherwise omit so foreign key doesn't fail
      const isUuid = (val: any) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      if (organizerId && isUuid(organizerId)) {
        dbPayload.organizer_id = organizerId;
      }

      console.log('[eventRepository] Attempting insert to Supabase events table:', dbPayload);
      
      // Try insert with full mapped row first
      let { data: inserted, error } = await supabase
        .from('events')
        .insert([dbPayload])
        .select()
        .single();

      // If full insert failed due to extra/unrecognized columns, fallback to standard core columns
      if (error) {
        console.warn(`[eventRepository] Full row insert notice: ${error.message}. Retrying with core columns...`);
        const corePayload = {
          title: fullEventItem.title,
          slug: fullEventItem.slug,
          date: cleanStartDate,
          category: typeof fullEventItem.category === 'object' ? fullEventItem.category.name : fullEventItem.category,
          status: 'published',
          description: fullEventItem.description || '',
          cover_image: fullEventItem.bannerUrl || '',
          venue: typeof fullEventItem.venue === 'object' ? fullEventItem.venue?.name : fullEventItem.venue,
          city: typeof fullEventItem.venue === 'object' ? fullEventItem.venue?.city : (fullEventItem as any).city,
          starting_price: Number(data.startingPrice) || (fullEventItem.ticketTypes?.[0]?.price ?? 499),
          is_online: fullEventItem.eventType === 'online',
        };

        const retryRes = await supabase
          .from('events')
          .insert([corePayload])
          .select()
          .single();

        inserted = retryRes.data;
        error = retryRes.error;
      }

      if (!error && inserted) {
        console.log(`[eventRepository] Successfully inserted event "${inserted.title}" to Supabase (id: ${inserted.id})`);
        fullEventItem.id = String(inserted.id);

        // Step C: Persist custom registration fields to registration_fields table
        if (Array.isArray(fullEventItem.registrationFields) && fullEventItem.registrationFields.length > 0) {
          try {
            const rfRows = fullEventItem.registrationFields.map((rf: any) => ({
              event_id: inserted.id,
              label: rf.label || 'Custom Field',
              type: rf.fieldType || rf.type || 'text',
              required: Boolean(rf.required),
              options: Array.isArray(rf.options) ? rf.options.join(',') : (rf.options || null),
            }));
            const { error: rfError } = await supabase.from('registration_fields').insert(rfRows);
            if (!rfError) {
              console.log(`[eventRepository] Saved ${rfRows.length} registration fields to Supabase registration_fields table`);
            } else {
              console.warn('[eventRepository] Registration fields table notice:', rfError.message);
            }
          } catch (rfErr) {
            console.warn('[eventRepository] Error saving registration fields:', rfErr);
          }
        }

        // Step D: Also persist ticket types to tickets table if configured
        if (Array.isArray(fullEventItem.ticketTypes) && fullEventItem.ticketTypes.length > 0) {
          try {
            const ticketRows = fullEventItem.ticketTypes.map(t => ({
              event_id: inserted.id,
              name: t.name,
              price: t.price,
              description: t.description || 'Standard pass',
            }));
            const { error: tktError } = await supabase.from('tickets').insert(ticketRows);
            if (!tktError) {
              console.log(`[eventRepository] Saved ${ticketRows.length} ticket tiers to Supabase tickets table`);
            }
          } catch (tErr) {
            console.warn('[eventRepository] Optional tickets table insert warning:', tErr);
          }
        }
      } else if (error) {
        console.error(`[eventRepository] Supabase insert failed (${error.code}):`, error.message);
        if (error.code === '42501') {
          console.error('[eventRepository] RLS NOTICE: Supabase Row Level Security policy is blocking inserts. Add an INSERT policy for anon role or add SUPABASE_SERVICE_ROLE_KEY to .env.local.');
        }
      }
    } else {
      console.warn('[eventRepository] Supabase is not configured. Saving only to local store.');
    }
  } catch (err) {
    console.warn(`[eventRepository] Failed to insert to Supabase:`, err);
  }

  // 2. Always persist to in-memory store for instant visibility across pages
  addPublishedEvent(fullEventItem);
  console.log(`[eventRepository] Event saved in repository: "${fullEventItem.title}" (${fullEventItem.slug})`);

  return fullEventItem;
}

/**
 * 5. Update an existing event by ID or Slug
 */
export async function updateEvent(idOrSlug: string, data: Partial<EventItem> | any): Promise<EventItem | null> {
  const existing = (await getEventById(idOrSlug)) || (await getEventBySlug(idOrSlug));
  if (!existing) {
    return null;
  }

  const id = existing.id;
  const slug = data.slug ? generateSlug(data.slug) : existing.slug;
  const title = data.title ? data.title.trim() : existing.title;

  // Format all four date & time fields cleanly without UTC trailing 'Z'
  let rawStartDate = data.startDate || data.start_date || data.date || existing.date || existing.startDate || '';
  const cleanStartDate = rawStartDate.includes('T') ? rawStartDate.split('T')[0] : rawStartDate;

  let rawEndDate = data.endDate || data.end_date || existing.endDate || cleanStartDate;
  const cleanEndDate = rawEndDate.includes('T') ? rawEndDate.split('T')[0] : rawEndDate;

  const startTimeStr = formatDisplayTime(data.startTime || existing.startTime || '10:00 AM');
  const endTimeStr = formatDisplayTime(data.endTime || existing.endTime || '06:00 PM');
  const cleanStartTime = startTimeStr.replace(/\s*(AM|PM)/i, '').trim();
  const cleanEndTime = endTimeStr.replace(/\s*(AM|PM)/i, '').trim();

  const startDateIso = `${cleanStartDate}T${cleanStartTime}:00`;
  const endDateIso = `${cleanEndDate}T${cleanEndTime}:00`;

  const categorySlug = data.categorySlug || data.category?.slug || existing.category?.slug || 'tech-ai';
  const category = mockCategories.find(c => c.slug === categorySlug) || existing.category || mockCategories[0];

  const updated: EventItem = {
    ...existing,
    id,
    title,
    slug,
    shortDescription: data.shortDescription || data.short_description || existing.shortDescription,
    description: data.description || existing.description,
    bannerUrl: data.bannerUrl || data.banner_url || data.coverImage || existing.bannerUrl,
    eventType: data.eventType || data.event_type || existing.eventType,
    status: data.status || existing.status || 'published',
    featured: data.featured !== undefined ? Boolean(data.featured) : existing.featured,
    startDate: startDateIso,
    endDate: endDateIso,
    startTime: startTimeStr,
    endTime: endTimeStr,
    date: cleanStartDate,
    timezone: data.timezone || existing.timezone || 'IST',
    category,
    organization: {
      ...existing.organization,
      name: data.organizerName || data.organization?.name || existing.organization?.name || 'ePayEvents Organizer',
      contactEmail: data.organizerEmail || data.organization?.contactEmail || existing.organization?.contactEmail || 'organizer@epayevents.com',
      avatar: data.organizerAvatar || data.organization?.avatar || existing.organization?.avatar || '/team/rahul.jpg',
      bio: data.organizerBio || data.organization?.bio || existing.organization?.bio || 'Event host on ePayEvents platform',
    },
    venue: {
      ...existing.venue,
      name: data.venueName || data.venue?.name || existing.venue?.name || 'Main Venue',
      address: data.address || data.venue?.address || existing.venue?.address || '',
      city: data.city || data.venue?.city || existing.venue?.city || 'Mumbai',
      onlineUrl: data.onlineUrl || data.venue?.onlineUrl || existing.venue?.onlineUrl,
    },
    ticketTypes: Array.isArray(data.ticketTypes) && data.ticketTypes.length > 0 
      ? data.ticketTypes 
      : Array.isArray(data.tickets) && data.tickets.length > 0
      ? data.tickets
      : existing.ticketTypes,
    speakers: Array.isArray(data.speakers) ? data.speakers : existing.speakers,
    agenda: Array.isArray(data.agenda) ? data.agenda : existing.agenda,
    facilities: Array.isArray(data.facilities) ? data.facilities : existing.facilities,
    sponsors: Array.isArray(data.sponsors) ? data.sponsors : existing.sponsors,
    exhibitors: Array.isArray(data.exhibitors) ? data.exhibitors : existing.exhibitors,
    faqs: Array.isArray(data.faqs) ? data.faqs : existing.faqs,
    registrationFields: Array.isArray(data.registrationFields) ? data.registrationFields : existing.registrationFields,
  };

  try {
    if (isSupabaseConfigured()) {
      const { createAdminClient } = await import('@/lib/supabase/server');
      const supabase = createAdminClient();
      const dbPayload = mapEventItemToDbRow(updated);

      let { error } = await supabase
        .from('events')
        .update(dbPayload)
        .eq('id', id);

      if (error) {
        // Fallback update by slug if ID was a mock string
        const fallbackRes = await supabase.from('events').update(dbPayload).eq('slug', existing.slug);
        error = fallbackRes.error;
      }

      if (error) {
        console.warn(`[eventRepository] Failed to update event in Supabase:`, error.message);
      } else {
        console.log(`[eventRepository] Successfully updated event "${updated.title}" in Supabase!`);
      }
    }
  } catch (err: any) {
    console.warn(`[eventRepository] Error updating event ${id}:`, err?.message || err);
  }

  recordEditedEvent(updated);
  return updated;
}

/**
 * 6. Delete an event by ID
 */
export async function deleteEvent(id: string): Promise<boolean> {
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn(`[eventRepository] Failed to delete event ${id} in Supabase:`, error.message);
      }
    }
  } catch (err) {
    console.warn(`[eventRepository] Error deleting event ${id}:`, err);
  }

  // Also remove from local in-memory store
  const all = getAllEvents();
  const idx = all.findIndex(e => e.id === id);
  if (idx >= 0) {
    all.splice(idx, 1);
  }

  return true;
}

