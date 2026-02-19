// lib/supabase.js
// ─────────────────────────────────────────────────────────────
// Supabase client using the SERVICE ROLE key (server-side only).
// Never expose the service role key to the frontend.
// ─────────────────────────────────────────────────────────────

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl     = process.env.SUPABASE_URL;
const supabaseRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseRoleKey, {
  auth: { persistSession: false },
});

module.exports = supabase;
