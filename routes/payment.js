const router = require("express").Router();
const supabase = require("../lib/supabase");

/**
 * POST /api/payment/verify
 * Called after registration to mark payment as verified
 * (Can be triggered manually by admin or auto-verified via webhook)
 *
 * Body: { registrationId: string, utr: string }
 */
router.post("/payment/verify", async (req, res) => {
  const { registrationId, utr } = req.body;

  if (!registrationId || !utr) {
    return res.status(400).json({ message: "registrationId and utr are required" });
  }

  const { data, error } = await supabase
    .from("registrations")
    .update({ status: "verified", verified_at: new Date().toISOString() })
    .eq("registration_id", registrationId)
    .eq("utr", utr)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Supabase update error:", error);
    return res.status(500).json({ message: "Database error" });
  }

  if (!data) {
    return res.status(404).json({ message: "Registration not found or UTR mismatch" });
  }

  return res.status(200).json({ message: "Payment verified", registration: data });
});

/**
 * GET /api/payment/status/:registrationId
 * Check payment status for a given registration
 */
router.get("/payment/status/:registrationId", async (req, res) => {
  const { registrationId } = req.params;

  const { data, error } = await supabase
    .from("registrations")
    .select("registration_id, name, email, amount, status, verified_at")
    .eq("registration_id", registrationId)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).json({ message: "Registration not found" });
  }

  return res.status(200).json(data);
});

module.exports = router;