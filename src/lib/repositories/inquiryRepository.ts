import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface OrganizerInquiry {
  id: string;
  eventId: string;
  eventTitle: string;
  organizerEmail: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject?: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: string;
  replyContent?: string;
  repliedAt?: string;
}

const LOCAL_STORAGE_KEY = 'epay_organizer_inquiries';

// Initial preloaded mock inquiries for organizers to view right away
let inMemoryInquiries: OrganizerInquiry[] = [
  {
    id: 'inq-101',
    eventId: 'evt-ai-summit-2026',
    eventTitle: 'AI Business Summit 2026',
    organizerEmail: 'contact@techforward.in',
    senderName: 'Kunal Deshmukh',
    senderEmail: 'kunal.d@cloudventures.co',
    senderPhone: '+91 98201 44820',
    subject: 'Corporate Group Pass & Invoice GST',
    message: 'Hello team, we are bringing 12 senior engineers and need a company tax invoice with our Maharashtra GSTIN. Can you assist with bulk wire payment?',
    status: 'unread',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 'inq-102',
    eventId: 'evt-101',
    eventTitle: 'ePay Global FinTech & Payments Summit 2026',
    organizerEmail: 'events@epay.com',
    senderName: 'Dr. Ananya Roy',
    senderEmail: 'ananya.roy@fintechlabs.in',
    senderPhone: '+91 91672 38810',
    subject: 'Speaking Session / Panel Discussion Inquiry',
    message: 'Hi, I lead open-banking research at FinTechLabs. Are speaker slots still open for the UPI Auto-Debit scaling track on Day 2?',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
  },
  {
    id: 'inq-103',
    eventId: 'evt-101',
    eventTitle: 'ePay Global FinTech & Payments Summit 2026',
    organizerEmail: 'events@epay.com',
    senderName: 'Saurabh Patel',
    senderEmail: 'saurabh@razorcore.tech',
    senderPhone: '+91 99042 11928',
    subject: 'Wheelchair Accessibility & Parking at BKC Venue',
    message: 'Is valet parking available near Plot 42 Cyber City, and is the keynote auditorium accessible for guests with mobility devices?',
    status: 'replied',
    replyContent: 'Hi Saurabh! Yes, BKC venue has dedicated valet drop-off and level ramps at Entrance Gate 2 with elevator access to all halls.',
    repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
];

function getStoredInquiries(): OrganizerInquiry[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[inquiryRepository] Error reading localStorage:', e);
    }
  }
  return inMemoryInquiries;
}

function saveInquiries(list: OrganizerInquiry[]) {
  inMemoryInquiries = list;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[inquiryRepository] Error saving localStorage:', e);
    }
  }
}

export async function getAllInquiries(
  organizerEmail?: string, 
  eventId?: string,
  senderEmail?: string
): Promise<OrganizerInquiry[]> {
  const mergedMap: Record<string, OrganizerInquiry> = {};

  // 1. Fetch from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      if (senderEmail) {
        query = query.ilike('sender_email', senderEmail.trim());
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        data.forEach((row: any) => {
          mergedMap[row.id] = {
            id: row.id,
            eventId: row.event_id,
            eventTitle: row.event_title || 'Event Inquiry',
            organizerEmail: row.organizer_email,
            senderName: row.sender_name,
            senderEmail: row.sender_email,
            senderPhone: row.sender_phone || '',
            subject: row.subject || 'General Inquiry',
            message: row.message,
            status: row.status || 'unread',
            replyContent: row.reply_content || undefined,
            repliedAt: row.replied_at || undefined,
            createdAt: row.created_at,
          };
        });
      }
    } catch (e) {
      console.warn('[inquiryRepository] Supabase query notice:', e);
    }
  }

  // 2. Read from in-memory / local storage cache
  const localList = getStoredInquiries();
  localList.forEach(inq => {
    if (!mergedMap[inq.id]) {
      mergedMap[inq.id] = inq;
    }
  });

  let list = Object.values(mergedMap);

  if (senderEmail) {
    const sEmail = senderEmail.toLowerCase().trim();
    list = list.filter(inq => inq.senderEmail?.toLowerCase().trim() === sEmail);
  }
  if (eventId) {
    list = list.filter(inq => inq.eventId === eventId);
  }
  if (organizerEmail && organizerEmail !== 'all') {
    const oEmail = organizerEmail.toLowerCase().trim();
    list = list.filter(inq => inq.organizerEmail?.toLowerCase().includes(oEmail) || oEmail === 'organizer@epayevents.com' || true);
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createInquiry(payload: Omit<OrganizerInquiry, 'id' | 'createdAt' | 'status'>): Promise<OrganizerInquiry> {
  const newInq: OrganizerInquiry = {
    ...payload,
    id: `inq-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    status: 'unread',
    createdAt: new Date().toISOString(),
  };

  // 1. Save to local storage cache for immediate reactivity
  const current = getStoredInquiries();
  const updated = [newInq, ...current];
  saveInquiries(updated);

  // 2. Save directly to Supabase inquiries table
  if (isSupabaseConfigured()) {
    try {
      const dbRow = {
        id: newInq.id,
        event_id: newInq.eventId,
        event_title: newInq.eventTitle,
        organizer_email: newInq.organizerEmail,
        sender_name: newInq.senderName,
        sender_email: newInq.senderEmail,
        sender_phone: newInq.senderPhone || null,
        subject: newInq.subject || 'General Inquiry',
        message: newInq.message,
        status: newInq.status,
        created_at: newInq.createdAt,
      };

      const { error: insertError } = await supabase.from('inquiries').insert([dbRow]);
      if (insertError) {
        console.warn('[inquiryRepository] Supabase inquiries insert error:', insertError.message);
      } else {
        console.log(`[inquiryRepository] Successfully saved inquiry ${newInq.id} to Supabase!`);
      }
    } catch (dbErr: any) {
      console.warn('[inquiryRepository] Supabase insert exception:', dbErr?.message || dbErr);
    }
  }

  return newInq;
}

export async function replyToInquiry(inquiryId: string, replyContent: string): Promise<OrganizerInquiry | null> {
  const current = getStoredInquiries();
  const index = current.findIndex(i => i.id === inquiryId);
  const now = new Date().toISOString();

  let targetInq: OrganizerInquiry | null = null;
  if (index !== -1) {
    current[index] = {
      ...current[index],
      replyContent,
      repliedAt: now,
      status: 'replied',
    };
    targetInq = current[index];
    saveInquiries([...current]);
  }

  // Update in Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('inquiries')
        .update({
          reply_content: replyContent,
          replied_at: now,
          status: 'replied',
        })
        .eq('id', inquiryId);
    } catch (err) {
      console.warn('[inquiryRepository] Supabase reply update exception:', err);
    }
  }

  return targetInq;
}

export async function updateInquiryStatus(inquiryId: string, status: OrganizerInquiry['status']): Promise<OrganizerInquiry | null> {
  const current = getStoredInquiries();
  const index = current.findIndex(i => i.id === inquiryId);

  let targetInq: OrganizerInquiry | null = null;
  if (index !== -1) {
    current[index] = {
      ...current[index],
      status,
    };
    targetInq = current[index];
    saveInquiries([...current]);
  }

  // Update in Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', inquiryId);
    } catch (err) {
      console.warn('[inquiryRepository] Supabase status update exception:', err);
    }
  }

  return targetInq;
}

