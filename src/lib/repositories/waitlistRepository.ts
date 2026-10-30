import { isSupabaseConfigured } from '@/lib/supabase/client';
import { supabase } from '@/lib/supabase/client';

export interface WaitlistEntry {
  id: string;
  eventId: string;
  eventTitle: string;
  ticketTierId: string;
  ticketTierName: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  quantityRequested: number;
  status: 'waiting' | 'notified' | 'claimed' | 'expired';
  position: number;
  createdAt: string;
  notifiedAt?: string;
  expiresAt?: string;
}

export interface WaitlistNotification {
  id: string;
  waitlistId: string;
  eventId: string;
  eventTitle: string;
  ticketTierName: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  message: string;
  sentAt: string;
  status: 'delivered' | 'read' | 'claimed';
}

const LOCAL_STORAGE_WAITLIST_KEY = 'epay_waitlist_entries';
const LOCAL_STORAGE_WAITLIST_NOTICES_KEY = 'epay_waitlist_notifications';

// Memory cache for SSR/Node runtime
const globalStore = global as unknown as {
  __epay_waitlist_cache__?: WaitlistEntry[];
  __epay_waitlist_notices__?: WaitlistNotification[];
};

if (!globalStore.__epay_waitlist_cache__) {
  globalStore.__epay_waitlist_cache__ = [
    {
      id: 'WL-INIT-01',
      eventId: 'evt_9f3k2',
      eventTitle: 'Bengaluru Tech Innovation Summit 2026',
      ticketTierId: 't-3',
      ticketTierName: 'AI Workshop Lab (Waitlisted)',
      userName: 'Pooja Hegde',
      userEmail: 'pooja.hegde@techlabs.io',
      userPhone: '+91 98450 11223',
      quantityRequested: 1,
      status: 'waiting',
      position: 1,
      createdAt: '2026-10-20T10:00:00.000Z',
    },
    {
      id: 'WL-INIT-02',
      eventId: 'evt_9f3k2',
      eventTitle: 'Bengaluru Tech Innovation Summit 2026',
      ticketTierId: 't-3',
      ticketTierName: 'AI Workshop Lab (Waitlisted)',
      userName: 'Aditya Kulkarni',
      userEmail: 'aditya.kulkarni@cloudpulse.in',
      userPhone: '+91 97654 99887',
      quantityRequested: 2,
      status: 'waiting',
      position: 2,
      createdAt: '2026-10-21T14:30:00.000Z',
    }
  ];
}

if (!globalStore.__epay_waitlist_notices__) {
  globalStore.__epay_waitlist_notices__ = [];
}

/**
 * Retrieve all waitlist entries for a specific event / ticket tier
 */
export async function getWaitlistEntries(eventId?: string, ticketTierId?: string): Promise<WaitlistEntry[]> {
  let list = [...(globalStore.__epay_waitlist_cache__ || [])];

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_WAITLIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const map = new Map<string, WaitlistEntry>();
          list.forEach(item => map.set(item.id, item));
          parsed.forEach((item: WaitlistEntry) => map.set(item.id, item));
          list = Array.from(map.values());
        }
      }
    } catch (e) {
      console.warn('[waitlistRepository] Error reading local waitlist:', e);
    }
  }

  if (eventId) {
    list = list.filter(w => 
      w.eventId.toLowerCase() === eventId.toLowerCase() ||
      (w.eventTitle && w.eventTitle.toLowerCase().includes(eventId.toLowerCase()))
    );
  }

  if (ticketTierId && ticketTierId !== 'all') {
    list = list.filter(w => w.ticketTierId === ticketTierId || w.ticketTierName.toLowerCase() === ticketTierId.toLowerCase());
  }

  // Sort by creation time to maintain fair FIFO queue position
  list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Dynamically calculate waiting position
  let pos = 1;
  return list.map(item => {
    if (item.status === 'waiting') {
      return { ...item, position: pos++ };
    }
    return item;
  });
}

/**
 * Add attendee to the waitlist for a sold-out tier
 */
export async function addToWaitlist(data: {
  eventId: string;
  eventTitle: string;
  ticketTierId: string;
  ticketTierName: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  quantityRequested?: number;
}): Promise<{ success: boolean; entry: WaitlistEntry; position: number }> {
  const existing = await getWaitlistEntries(data.eventId, data.ticketTierId);
  
  // Check if this email is already on the active waitlist for this tier
  const alreadyWaiting = existing.find(
    e => e.userEmail.toLowerCase() === data.userEmail.toLowerCase() && e.status === 'waiting'
  );

  if (alreadyWaiting) {
    return {
      success: true,
      entry: alreadyWaiting,
      position: alreadyWaiting.position,
    };
  }

  const waitingCount = existing.filter(e => e.status === 'waiting').length;
  const newPosition = waitingCount + 1;
  const entryId = `WL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newEntry: WaitlistEntry = {
    id: entryId,
    eventId: data.eventId,
    eventTitle: data.eventTitle,
    ticketTierId: data.ticketTierId,
    ticketTierName: data.ticketTierName,
    userName: data.userName,
    userEmail: data.userEmail,
    userPhone: data.userPhone || '',
    quantityRequested: Math.max(1, data.quantityRequested || 1),
    status: 'waiting',
    position: newPosition,
    createdAt: new Date().toISOString(),
  };

  // 1. Update in-memory cache
  if (!globalStore.__epay_waitlist_cache__) globalStore.__epay_waitlist_cache__ = [];
  globalStore.__epay_waitlist_cache__.push(newEntry);

  // 2. Persist to browser localStorage if available
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_WAITLIST_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      parsed.push(newEntry);
      localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.warn('[waitlistRepository] Error writing local waitlist:', e);
    }
  }

  // 3. Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('waitlists').insert([{
        id: newEntry.id,
        event_id: newEntry.eventId,
        event_title: newEntry.eventTitle,
        tier_id: newEntry.ticketTierId,
        tier_name: newEntry.ticketTierName,
        user_name: newEntry.userName,
        user_email: newEntry.userEmail,
        user_phone: newEntry.userPhone,
        quantity: newEntry.quantityRequested,
        status: newEntry.status,
      }]);
    } catch (err) {
      console.warn('[waitlistRepository] Optional Supabase waitlists table insert notice:', err);
    }
  }

  console.log(`[waitlistRepository] Attendee ${data.userName} joined waitlist at position #${newPosition} for ${data.eventTitle}`);

  return {
    success: true,
    entry: newEntry,
    position: newPosition,
  };
}

/**
 * Automatically notify the next person in line when a ticket is cancelled or refunded
 */
export async function notifyNextInLine(params: {
  eventId: string;
  ticketTierId?: string;
  eventTitle?: string;
}): Promise<{
  notified: boolean;
  entry?: WaitlistEntry;
  notification?: WaitlistNotification;
  message: string;
}> {
  const { eventId, ticketTierId, eventTitle } = params;
  const entries = await getWaitlistEntries(eventId, ticketTierId);

  // Find the earliest attendee waiting in FIFO order
  const nextInLine = entries.find(e => e.status === 'waiting');

  if (!nextInLine) {
    return {
      notified: false,
      message: 'No attendees currently waiting in queue for this event.',
    };
  }

  const notifiedAt = new Date().toISOString();
  // Pass hold window: 2 hours to claim
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  nextInLine.status = 'notified';
  nextInLine.notifiedAt = notifiedAt;
  nextInLine.expiresAt = expiresAt;

  // Create official notification log
  const noticeId = `NOTIF-${Date.now()}`;
  const notification: WaitlistNotification = {
    id: noticeId,
    waitlistId: nextInLine.id,
    eventId: nextInLine.eventId,
    eventTitle: nextInLine.eventTitle || eventTitle || 'ePay Event',
    ticketTierName: nextInLine.ticketTierName,
    recipientName: nextInLine.userName,
    recipientEmail: nextInLine.userEmail,
    recipientPhone: nextInLine.userPhone,
    message: `🎉 Great news ${nextInLine.userName}! A pass has just freed up for "${nextInLine.eventTitle}" (${nextInLine.ticketTierName}). A spot is reserved for you for the next 2 hours. Claim your pass now before it goes to the next person in line.`,
    sentAt: notifiedAt,
    status: 'delivered',
  };

  if (!globalStore.__epay_waitlist_notices__) globalStore.__epay_waitlist_notices__ = [];
  globalStore.__epay_waitlist_notices__.unshift(notification);

  // Update memory store
  if (globalStore.__epay_waitlist_cache__) {
    globalStore.__epay_waitlist_cache__ = globalStore.__epay_waitlist_cache__.map(e => 
      e.id === nextInLine.id ? nextInLine : e
    );
  }

  // Update localStorage if in browser
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_WAITLIST_KEY);
      if (stored) {
        const parsed: WaitlistEntry[] = JSON.parse(stored);
        const updated = parsed.map(e => e.id === nextInLine.id ? nextInLine : e);
        localStorage.setItem(LOCAL_STORAGE_WAITLIST_KEY, JSON.stringify(updated));
      }

      const rawNotices = localStorage.getItem(LOCAL_STORAGE_WAITLIST_NOTICES_KEY);
      const parsedNotices = rawNotices ? JSON.parse(rawNotices) : [];
      parsedNotices.unshift(notification);
      localStorage.setItem(LOCAL_STORAGE_WAITLIST_NOTICES_KEY, JSON.stringify(parsedNotices));
    } catch (e) {
      console.warn('[waitlistRepository] Error updating localStorage during notification:', e);
    }
  }

  console.log(`[waitlistRepository] AUTO-NOTIFIED next person in line: ${nextInLine.userName} (${nextInLine.userEmail}) for event ${nextInLine.eventTitle}`);

  return {
    notified: true,
    entry: nextInLine,
    notification,
    message: `Spot opened! Automatically dispatched notification to next person in line: ${nextInLine.userName} (${nextInLine.userEmail}). Pass held for 2 hours.`,
  };
}

/**
 * Get all notifications dispatched to waitlisted users
 */
export async function getWaitlistNotifications(userEmail?: string): Promise<WaitlistNotification[]> {
  let notices = [...(globalStore.__epay_waitlist_notices__ || [])];

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_WAITLIST_NOTICES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const map = new Map<string, WaitlistNotification>();
          notices.forEach(n => map.set(n.id, n));
          parsed.forEach((n: WaitlistNotification) => map.set(n.id, n));
          notices = Array.from(map.values());
        }
      }
    } catch (e) {
      console.warn('[waitlistRepository] Error reading local notices:', e);
    }
  }

  if (userEmail) {
    notices = notices.filter(n => n.recipientEmail.toLowerCase() === userEmail.toLowerCase());
  }

  return notices.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

