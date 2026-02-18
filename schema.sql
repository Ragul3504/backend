-- ============================================================
--  SYNERIX 2026 – Supabase SQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension (already available in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
--  TABLE: registrations
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registrations (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id   TEXT        UNIQUE NOT NULL,        -- e.g. SYN-ABCD1234
  name              TEXT        NOT NULL,
  email             TEXT        UNIQUE NOT NULL,
  phone             TEXT        NOT NULL,
  college           TEXT        NOT NULL,
  dept              TEXT        NOT NULL,
  year              TEXT,                               -- I / II / III / IV
  events            JSONB       NOT NULL DEFAULT '[]',  -- [{ title, mode }]
  event_ids         JSONB       NOT NULL DEFAULT '[]',  -- [{ eventId, mode }]
  amount            NUMERIC     NOT NULL DEFAULT 0,
  utr               TEXT        NOT NULL,               -- UPI transaction ref
  status            TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  registered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at       TIMESTAMPTZ
);

-- Index for fast email lookups (duplicate check)
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);

-- Index for admin queries by status
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);

-- ─────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY
--  The backend uses the service_role key which bypasses RLS.
--  These policies protect direct client access.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Deny all direct client access (backend service_role bypasses this)
CREATE POLICY "No public read" ON public.registrations
  FOR SELECT USING (false);

CREATE POLICY "No public insert" ON public.registrations
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No public update" ON public.registrations
  FOR UPDATE USING (false);

-- ─────────────────────────────────────────────────────────────
--  HELPER VIEW: admin_registrations
--  Flatten JSONB events for easier admin reading
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.admin_registrations AS
SELECT
  registration_id,
  name,
  email,
  phone,
  college,
  dept,
  year,
  (
    SELECT string_agg(e->>'title' || COALESCE(' [' || (e->>'mode') || ']', ''), ', ')
    FROM jsonb_array_elements(events) AS e
  ) AS events_summary,
  amount,
  utr,
  status,
  registered_at,
  verified_at
FROM public.registrations
ORDER BY registered_at DESC;

-- ─────────────────────────────────────────────────────────────
--  SAMPLE DATA (optional – remove in production)
-- ─────────────────────────────────────────────────────────────
-- INSERT INTO public.registrations (
--   registration_id, name, email, phone, college, dept, year,
--   events, event_ids, amount, utr, status
-- ) VALUES (
--   'SYN-TEST0001', 'Test User', 'test@example.com', '9876543210',
--   'Sample College', 'CSE', '3',
--   '[{"title":"Paper Presentation","mode":"Solo"}]',
--   '[{"eventId":"paper-presentation","mode":"Solo"}]',
--   300, 'UTR000000001', 'pending'
-- );
