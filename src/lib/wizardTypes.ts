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
  quantity: number;
  minPerOrder: number;
  maxPerOrder: number;
}

export interface EventWizardData {
  // Step 1: Basic Info
  title: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  bannerUrl: string;
  organizerEmail: string;

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

  // Step 4: Tickets
  ticketTypes: TicketTypeForm[];

  // Step 5: Custom Registration Form
  registrationFields: RegistrationField[];

  // Step 6: Payment Settings
  taxPercentage: number;
  platformFeePercentage: number;

  // Step 7: Status
  status: 'draft' | 'published' | 'scheduled';
}
