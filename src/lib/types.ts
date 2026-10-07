export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  verified?: boolean;
  contactEmail?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  count?: number;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  remainingQuantity: number;
  minPerOrder: number;
  maxPerOrder: number;
}

export interface EventVenue {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  onlineUrl?: string;
}

export interface EventSpeaker {
  name: string;
  role: string;
  company: string;
  avatar: string;
  bio?: string;
  linkedinUrl?: string;
}

export interface EventAgendaItem {
  time: string;
  title: string;
  description: string;
  speaker?: string;
}

export interface EventFacility {
  icon: string;
  title: string;
  description: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  bannerUrl: string;
  eventType: 'physical' | 'online' | 'hybrid';
  status: 'draft' | 'published' | 'cancelled' | 'ended';
  startDate: string;
  endDate: string;
  timezone: string;
  featured: boolean;
  category: EventCategory;
  organization: Organization;
  venue: EventVenue;
  ticketTypes: TicketType[];
  speakers?: EventSpeaker[];
  agenda?: EventAgendaItem[];
  facilities?: EventFacility[];
  faqs?: { question: string; answer: string }[];
}

export interface EventFilterParams {
  query?: string;
  category?: string;
  location?: string;
  eventType?: string;
  price?: 'all' | 'free' | 'paid';
  date?: 'all' | 'today' | 'this-week' | 'this-month';
}
