// api/register.js
// ─────────────────────────────────────────────────────────────
// POST /api/register
//
// Flow:
//   1. Validate request body
//   2. Insert registration into Supabase
//   3. Send confirmation email to student
//   4. Send admin notification email
//   5. Return success JSON
// ─────────────────────────────────────────────────────────────

const supabase = require('../lib/supabase');
const { validateRegistration } = require('../lib/validate');
const { sendUserConfirmation, sendAdminNotification } = require('../lib/mailer');

// ── CORS helper ────────────────────────────────────────────
function setCors(res) {
  const origin = process.env.FRONTEND_URL || '*';
  res.setHeader('Access-Control-Allow-Origin',  origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ── Unique Registration ID generator ───────────────────────
// Format: ELZ-YYYYMMDD-XXXXX  (e.g. ELZ-20260301-A3F9K)
function generateRegId() {
  const date   = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `ELZ-${date}-${suffix}`;
}

// ─────────────────────────────────────────────────────────────
//  MAIN HANDLER
// ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  setCors(res);

  // ── Pre-flight ──────────────────────────────────────────
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Only POST allowed ───────────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // ── 1. Validate ────────────────────────────────────────
    const { ok, errors, computedFee } = validateRegistration(body);
    if (!ok) {
      return res.status(400).json({ message: errors.join(' | '), errors });
    }

    const { fullName, email, phone, college, dept, year, events } = body;
    const regId = generateRegId();

    // ── 2. Insert into Supabase ────────────────────────────
    const { error: dbError } = await supabase
      .from('registrations')
      .insert([{
        reg_id:    regId,
        full_name: fullName.trim(),
        email:     email.trim().toLowerCase(),
        phone:     phone.trim(),
        college:   college.trim(),
        department: dept.trim(),
        year:      String(year),
        events:    events,          // stored as JSONB array
        total_fee: computedFee,
        paid:      false,           // set to true after manual payment verification
        created_at: new Date().toISOString(),
      }]);

    if (dbError) {
      // Duplicate email check
      if (dbError.code === '23505') {
        return res.status(409).json({
          message: 'This email is already registered. Contact coordinators to modify.',
        });
      }
      console.error('[DB Error]', dbError);
      return res.status(500).json({ message: 'Database error. Please try again.' });
    }

    // ── 3 & 4. Send emails (parallel) ─────────────────────
    const mailData = { fullName, email, phone, college, dept, year, events, totalFee: computedFee, regId };

    await Promise.allSettled([
      sendUserConfirmation(mailData),
      sendAdminNotification(mailData),
    ]);
    // Using allSettled so a mail failure doesn't fail the registration

    // ── 5. Respond ─────────────────────────────────────────
    return res.status(200).json({
      message: 'Registration successful',
      regId,
      totalFee: computedFee,
    });

  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({ message: 'Internal server error. Please try again.' });
  }
};
