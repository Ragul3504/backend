-- ─────────────────────────────────────────────────────────────
--  Electryonz 2026 – Supabase SQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────


-- ════════════════════════════════════════════════════════════
--  TABLE: registrations
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.registrations (
  id          BIGSERIAL PRIMARY KEY,
  reg_id      TEXT        NOT NULL UNIQUE,        -- ELZ-20260301-A3F9K
  full_name   TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,         -- one registration per email
  phone       TEXT        NOT NULL,
  college     TEXT        NOT NULL,
  department  TEXT        NOT NULL,
  year        TEXT        NOT NULL,                -- '1','2','3','4'
  events      JSONB       NOT NULL DEFAULT '[]',   -- ["Chess","IPL Auction"]
  total_fee   INTEGER     NOT NULL DEFAULT 0,      -- in INR
  paid        BOOLEAN     NOT NULL DEFAULT FALSE,  -- update to TRUE after payment verified
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes for faster queries ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_registrations_email     ON public.registrations (email);
CREATE INDEX IF NOT EXISTS idx_registrations_reg_id    ON public.registrations (reg_id);
CREATE INDEX IF NOT EXISTS idx_registrations_created   ON public.registrations (created_at DESC);

-- ── Row Level Security ────────────────────────────────────────
-- Deny all direct client access; only the service role key (backend) can read/write.
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically; no extra policy needed.
-- If you want to allow read-only access from the anon key:
-- CREATE POLICY "anon_read" ON public.registrations FOR SELECT USING (TRUE);


-- ════════════════════════════════════════════════════════════
--  VIEW: summary stats (useful for admin dashboard)
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW public.registration_stats AS
SELECT
  COUNT(*)                                          AS total_registrations,
  SUM(total_fee)                                    AS total_revenue,
  COUNT(*) FILTER (WHERE paid = TRUE)               AS paid_count,
  COUNT(*) FILTER (WHERE paid = FALSE)              AS unpaid_count,
  COUNT(DISTINCT college)                           AS unique_colleges
FROM public.registrations;


-- ════════════════════════════════════════════════════════════
--  FUNCTION: event_popularity()
--  Shows how many students registered for each event
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.event_popularity()
RETURNS TABLE (event_name TEXT, registrations BIGINT) AS $$
  SELECT
    event_name,
    COUNT(*) AS registrations
  FROM
    public.registrations,
    jsonb_array_elements_text(events) AS event_name
  GROUP BY event_name
  ORDER BY registrations DESC;
$$ LANGUAGE SQL STABLE;


-- ════════════════════════════════════════════════════════════
--  SAMPLE QUERIES (for reference)
-- ════════════════════════════════════════════════════════════

-- See all registrations (latest first):
-- SELECT * FROM registrations ORDER BY created_at DESC;

-- See summary stats:
-- SELECT * FROM registration_stats;

-- See event popularity:
-- SELECT * FROM event_popularity();

-- Mark a registration as paid:
-- UPDATE registrations SET paid = TRUE WHERE reg_id = 'ELZ-20260301-A3F9K';

-- Search by name or email:
-- SELECT * FROM registrations WHERE full_name ILIKE '%John%' OR email ILIKE '%john%';

-- Export all as CSV (from Supabase dashboard: Table Editor → Export):
-- Or run:  COPY registrations TO STDOUT WITH CSV HEADER;
