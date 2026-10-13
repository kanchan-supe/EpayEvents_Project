-- ==========================================================
-- Table: epayevents_table
-- Columns: id, created_at
-- ==========================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.epayevents_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.epayevents_table ENABLE ROW LEVEL SECURITY;

-- 3. Access Policies (Public read and insert)
CREATE POLICY "Allow public select on epayevents_table"
  ON public.epayevents_table
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on epayevents_table"
  ON public.epayevents_table
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4. Enable Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.epayevents_table;
