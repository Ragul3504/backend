const router = require("express").Router();
const supabase = require("../lib/supabase");

/**
 * POST /api/check-email
 * Body: { email: string }
 * Returns 200 if email is free, 409 if already registered
 */
router.post("/check-email", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) {
    console.error("Supabase error (check-email):", error);
    return res.status(500).json({ message: "Database error" });
  }

  if (data) {
    return res.status(409).json({
      message: "This email is already registered. Each participant can register only once.",
    });
  }

  return res.status(200).json({ message: "Email available" });
});

module.exports = router;