export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface EventRow {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  banner_url?: string | null;
  event_type?: 'physical' | 'online' | 'hybrid' | string;
  status?: 'draft' | 'published' | 'cancelled' | 'ended' | string;
  start_date?: string;
  end_date?: string;
  timezone?: string;
  featured?: boolean;
  category_id?: string | null;
  category_slug?: string | null;
  organization_id?: string | null;
  venue?: Json | null;
  ticket_types?: Json | null;
  speakers?: Json | null;
  agenda?: Json | null;
  facilities?: Json | null;
  sponsors?: Json | null;
  exhibitors?: Json | null;
  faqs?: Json | null;
  registration_fields?: Json | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface ProfileRow {
  id: string;
  email: string;
  full_name?: string | null;
  role?: 'attendee' | 'organizer' | 'admin' | string;
  phone?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface OrderRow {
  id?: string;
  user_id?: string | null;
  order_id?: string;
  event_id?: string;
  event_slug?: string;
  event_title?: string;
  buyer_name?: string;
  buyer_email?: string;
  attendee_name?: string;
  attendee_email?: string;
  ticket_tier?: string;
  quantity?: number;
  total_amount?: number;
  total?: number;
  payment_status?: string;
  status?: string;
  created_at?: string;
  [key: string]: any;
}

export interface Database {
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: Partial<EventRow>;
        Update: Partial<EventRow>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
      };
      orders: {
        Row: OrderRow;
        Insert: Partial<OrderRow>;
        Update: Partial<OrderRow>;
      };
      tickets: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      ticket_types: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
      tickets_orders: {
        Row: OrderRow;
        Insert: Partial<OrderRow>;
        Update: Partial<OrderRow>;
      };
      epayevents_table: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
      };
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: Record<string, any>;
    Functions: Record<string, any>;
    Enums: Record<string, any>;
  };
  [key: string]: any;
}

// Convenient type aliases
export type Event = EventRow;
export type Profile = ProfileRow;
export type Order = OrderRow;
