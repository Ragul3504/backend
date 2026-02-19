// lib/validate.js
// ─────────────────────────────────────────────────────────────
// Server-side validation for the registration payload.
// Mirrors the frontend checks so nothing slips through.
// ─────────────────────────────────────────────────────────────

const VALID_EVENTS = [
  'Paper Presentation',
  'Project Expo',
  'IPL Auction',
  'Treasure Hunt',
  'Snakes & Ladder',
  'Carrom',
  'Free Fire',
  'Chess',
  'AI & ML Workshop',
  'IoT Workshop',
];

const EVENT_FEES = {
  'Paper Presentation': 300,
  'Project Expo':       300,
  'IPL Auction':        200,
  'Treasure Hunt':      200,
  'Snakes & Ladder':    200,
  'Carrom':             150,
  'Free Fire':          200,
  'Chess':              100,
  'AI & ML Workshop':   250,
  'IoT Workshop':       250,
};

/**
 * Validates the incoming registration body.
 * @param {object} body - parsed JSON body
 * @returns {{ ok: boolean, errors: string[], computedFee: number }}
 */
function validateRegistration(body) {
  const errors = [];
  const { fullName, email, phone, college, dept, year, events, totalFee } = body;

  // ── Required string fields ───────────────────────────────
  if (!fullName  || fullName.trim().length < 2)  errors.push('Invalid fullName');
  if (!email     || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email');
  if (!phone     || !/^\d{10}$/.test(phone))     errors.push('Phone must be 10 digits');
  if (!college   || college.trim().length < 2)   errors.push('Invalid college name');
  if (!dept      || dept.trim().length < 2)       errors.push('Invalid department');
  if (!['1','2','3','4'].includes(String(year)))  errors.push('Invalid year');

  // ── Events ───────────────────────────────────────────────
  if (!Array.isArray(events) || events.length === 0)
    errors.push('Select at least one event');

  const unknownEvents = events.filter(e => !VALID_EVENTS.includes(e));
  if (unknownEvents.length) errors.push(`Unknown events: ${unknownEvents.join(', ')}`);

  // ── Fee verification ─────────────────────────────────────
  const computedFee = events.reduce((sum, e) => sum + (EVENT_FEES[e] || 0), 0);
  if (Number(totalFee) !== computedFee)
    errors.push(`Fee mismatch. Expected ₹${computedFee}, received ₹${totalFee}`);

  return { ok: errors.length === 0, errors, computedFee };
}

module.exports = { validateRegistration, EVENT_FEES };
