// api/registrations.js
// ─────────────────────────────────────────────────────────────
// GET /api/registrations?secret=YOUR_ADMIN_SECRET
//
// Returns all registrations from Supabase.
// Protected by a simple secret query param.
// Add ADMIN_SECRET to your environment variables.
// ─────────────────────────────────────────────────────────────

const supabase = require('../lib/supabase');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin',  process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Simple secret protection ───────────────────────────
  const { secret, limit = 100, offset = 0 } = req.query;
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { data, error, count } = await supabase
      .from('registrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    return res.status(200).json({ total: count, registrations: data });
  } catch (err) {
    console.error('[Registrations Error]', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
