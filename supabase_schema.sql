-- =========================================================================
-- ePayEvents: Complete Production Database Schema for Supabase
-- Tables: categories, organizations, events, ticket_types, orders, tickets
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- TABLE: categories
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Cpu',
  description TEXT,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =========================================================================
-- TABLE: organizations
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  verified BOOLEAN DEFAULT true,
  contact_email TEXT,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =========================================================================
-- TABLE: events
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  banner_url TEXT,
  event_type TEXT NOT NULL DEFAULT 'physical' CHECK (event_type IN ('physical', 'online', 'hybrid')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled', 'ended')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'IST',
  featured BOOLEAN DEFAULT false,
  
  -- Foreign Key / Relationship References
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  category_slug TEXT,
  organization_id TEXT REFERENCES public.organizations(id) ON DELETE SET NULL,
  
  -- Rich JSON Structures for event metadata
  venue JSONB DEFAULT '{}'::jsonb,
  speakers JSONB DEFAULT '[]'::jsonb,
  agenda JSONB DEFAULT '[]'::jsonb,
  facilities JSONB DEFAULT '[]'::jsonb,
  sponsors JSONB DEFAULT '[]'::jsonb,
  exhibitors JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  registration_fields JSONB DEFAULT '[]'::jsonb,
  coupons JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =========================================================================
-- TABLE: ticket_types
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.ticket_types (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  original_price NUMERIC(10, 2),
  quantity INTEGER NOT NULL DEFAULT 100,
  remaining_quantity INTEGER NOT NULL DEFAULT 100,
  min_per_order INTEGER DEFAULT 1,
  max_per_order INTEGER DEFAULT 10,
  features JSONB DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'General',
  is_early_bird BOOLEAN DEFAULT false,
  early_bird_deadline TIMESTAMPTZ,
  is_dynamic_pricing BOOLEAN DEFAULT false,
  dynamic_surge_percent INTEGER DEFAULT 0,
  is_group_discount BOOLEAN DEFAULT false,
  group_min_qty INTEGER DEFAULT 4,
  group_discount_percent INTEGER DEFAULT 15,
  is_hidden BOOLEAN DEFAULT false,
  access_passcode TEXT,
  is_approval_required BOOLEAN DEFAULT false,
  is_waitlist BOOLEAN DEFAULT false,
  is_complimentary BOOLEAN DEFAULT false,
  is_transferrable BOOLEAN DEFAULT true,
  is_refundable BOOLEAN DEFAULT true,
  refund_policy_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =========================================================================
-- TABLE: orders
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(10, 2) DEFAULT 0.00,
  coupon_code TEXT,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded')),
  payment_method TEXT DEFAULT 'epay_upi',
  tickets_count INTEGER DEFAULT 1,
  approval_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =========================================================================
-- TABLE: tickets
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  event_id TEXT REFERENCES public.events(id) ON DELETE SET NULL,
  event_title TEXT NOT NULL,
  ticket_type_id TEXT,
  ticket_name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  price_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  qr_payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled', 'transferred', 'pending_approval', 'refunded')),
  issued_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  checked_in_at TIMESTAMPTZ,
  transferred_to JSONB,
  refund_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- =========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_category_slug ON public.events(category_slug);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event_id ON public.ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_event_id ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON public.tickets(event_id);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Categories: Read for all, insert for authenticated/anon
CREATE POLICY "Allow public select on categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert on categories" ON public.categories FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Organizations: Read for all, insert for authenticated/anon
CREATE POLICY "Allow public select on organizations" ON public.organizations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert on organizations" ON public.organizations FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Events: Public select for all, insert/update for anon & authenticated
CREATE POLICY "Allow public select on events" ON public.events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert on events" ON public.events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update on events" ON public.events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Ticket Types: Public read and insert
CREATE POLICY "Allow public select on ticket_types" ON public.ticket_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert on ticket_types" ON public.ticket_types FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Orders: Public read and insert
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Tickets: Public read and insert/update (for check-in / transfer)
CREATE POLICY "Allow public select on tickets" ON public.tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public insert on tickets" ON public.tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public update on tickets" ON public.tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================================
-- REALTIME REPLICATION (Supabase Realtime)
-- =========================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
