// api/health.js
// ─────────────────────────────────────────────────────────────
// GET /api/health
// Simple health-check endpoint to confirm the API is running.
// ─────────────────────────────────────────────────────────────

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    status:    'ok',
    service:   'Electryonz 2026 Registration API',
    timestamp: new Date().toISOString(),
  });
};
