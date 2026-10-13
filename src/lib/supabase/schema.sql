-- ==========================================================
-- ePayEvents: Supabase Realtime Database Schema & Setup
-- Execute this script inside your Supabase project SQL Editor
-- ==========================================================

-- 1. Create Profiles table linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'attendee' CHECK (role IN ('attendee', 'organizer', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 4. Automatically create profile on new user signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, phone, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'attendee'),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable Supabase Realtime for the profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ==========================================================
-- Optional: Events & Registrations Realtime Tables
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.tickets_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id TEXT NOT NULL UNIQUE,
  event_slug TEXT NOT NULL,
  event_title TEXT NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  ticket_tier TEXT NOT NULL,
  quantity INT DEFAULT 1,
  total_amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tickets_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
  ON public.tickets_orders FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets_orders;

-- ==========================================================
-- ePayEvents Table Setup
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.epayevents_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.epayevents_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on epayevents_table"
  ON public.epayevents_table FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on epayevents_table"
  ON public.epayevents_table FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.epayevents_table;
