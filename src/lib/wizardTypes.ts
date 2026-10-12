export interface RegistrationField {
  id: string;
  label: string;
  fieldType: 'text' | 'email' | 'phone' | 'select' | 'checkbox';
  required: boolean;
  options?: string[]; // For select dropdowns
}

export interface TicketTypeForm {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  minPerOrder: number;
  maxPerOrder: number;
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

export interface SpeakerForm {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  bio?: string;
  linkedinUrl?: string;
}

export interface AgendaForm {
  id: string;
  time: string;
  title: string;
  description: string;
  speaker?: string;
}

export interface SponsorForm {
  id: string;
  name: string;
  logoUrl: string;
  tier: 'Title' | 'Platinum' | 'Gold' | 'Silver' | 'Community Partner';
  websiteUrl?: string;
}

export interface ExhibitorForm {
  id: string;
  name: string;
  logoUrl: string;
  category: string;
  boothNumber: string;
  description: string;
}

export interface FaqForm {
  id: string;
  question: string;
  answer: string;
}

export interface CouponForm {
  id: string;
  code: string;
  discountPercent: number;
  description: string;
}

export interface EventWizardData {
  // Step 1: Basic Info
  title: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  bannerUrl: string;
  
  // Organizer Info
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  organizerAvatar: string;
  organizerBio: string;

  // Step 2: Date & Time
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;

  // Step 3: Venue
  eventType: 'physical' | 'online' | 'hybrid';
  venueName: string;
  address: string;
  city: string;
  onlineUrl: string;

  // Step 4: Speakers & Agenda
  speakers: SpeakerForm[];
  agenda: AgendaForm[];

  // Step 5: Sponsors & Exhibitors
  sponsors: SponsorForm[];
  exhibitors: ExhibitorForm[];

  // Step 6: Tickets & Offers
  ticketTypes: TicketTypeForm[];
  couponCodes: CouponForm[];

  // Step 7: FAQs, Terms & Policies
  faqs: FaqForm[];
  termsAndPolicy: string;

  // Step 8: Custom Registration Form
  registrationFields: RegistrationField[];

  // Step 9: Payment Settings
  taxPercentage: number;
  platformFeePercentage: number;

  // Status
  status: 'draft' | 'published' | 'scheduled';
}
