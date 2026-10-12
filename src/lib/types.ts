export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  verified?: boolean;
  contactEmail?: string;
  avatar?: string;
  bio?: string;
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
  originalPrice?: number;
  quantity: number;
  remainingQuantity: number;
  minPerOrder: number;
  maxPerOrder: number;
  features?: string[];
  isPopular?: boolean;
  category?: 'General' | 'VIP' | 'Workshop' | 'Virtual' | 'Student' | 'Corporate' | 'Speaker';
  isEarlyBird?: boolean;
  earlyBirdDeadline?: string;
  isDynamicPricing?: boolean;
  dynamicSurgePercent?: number;
  isGroupDiscount?: boolean;
  groupMinQty?: number;
  groupDiscountPercent?: number;
  isHidden?: boolean;
  accessPasscode?: string;
  isApprovalRequired?: boolean;
  isWaitlist?: boolean;
  isComplimentary?: boolean;
  isTransferrable?: boolean;
  isRefundable?: boolean;
  refundPolicyDays?: number;
}

export interface TicketIssued {
  ticketId: string; // Unique ticket ID, e.g. TKT-EPAY-849204-01
  orderId: string;
  eventId: string;
  eventTitle: string;
  ticketTypeId: string;
  ticketName: string;
  category: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  pricePaid: number;
  qrPayload: string;
  status: 'valid' | 'used' | 'cancelled' | 'transferred' | 'pending_approval' | 'refunded';
  issuedAt: string;
  checkedInAt?: string;
  transferredTo?: {
    name: string;
    email: string;
    transferredAt: string;
  };
  refundDetails?: {
    amount: number;
    reason: string;
    refundedAt: string;
    status: 'pending' | 'processed';
  };
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

export interface EventSponsor {
  name: string;
  logoUrl: string;
  tier: 'Title' | 'Platinum' | 'Gold' | 'Silver' | 'Community Partner';
  websiteUrl?: string;
}

export interface EventExhibitor {
  name: string;
  logoUrl: string;
  category: string;
  boothNumber: string;
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
  sponsors?: EventSponsor[];
  exhibitors?: EventExhibitor[];
  faqs?: { question: string; answer: string }[];
  termsAndPolicy?: string[];
  couponCodes?: { code: string; discountPercent: number; description: string }[];
}

export interface EventFilterParams {
  query?: string;
  category?: string;
  location?: string;
  eventType?: string;
  price?: 'all' | 'free' | 'paid';
  date?: 'all' | 'today' | 'this-week' | 'this-month';
}
