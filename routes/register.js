const router = require("express").Router();
const supabase = require("../lib/supabase");
const transporter = require("../lib/mailer");
const { buildConfirmationEmail } = require("../lib/emailTemplate");
const { nanoid } = require("nanoid");

/**
 * POST /api/register
 * Body: {
 *   name, email, phone, college, dept, year,
 *   selectedEvents: [{ eventId, mode }],
 *   eventsDetail: [{ title, mode }],
 *   amount: number,
 *   utr: string
 * }
 */
router.post("/register", async (req, res) => {
  const {
    name, email, phone, college, dept, year,
    selectedEvents, eventsDetail,
    amount, utr,
  } = req.body;

  // ── Basic validation ──────────────────────────────────────────
  if (!name || !email || !phone || !college || !dept || !utr || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!selectedEvents || selectedEvents.length === 0) {
    return res.status(400).json({ message: "At least one event must be selected" });
  }

  const cleanEmail = email.toLowerCase().trim();

  // ── Double-check email uniqueness (race-condition safety) ─────
  const { data: existing } = await supabase
    .from("registrations")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existing) {
    return res.status(409).json({
      message: "This email is already registered.",
    });
  }

  // ── Generate registration ID ──────────────────────────────────
  const registrationId = `SYN-${nanoid(8).toUpperCase()}`;

  // ── Insert into Supabase ──────────────────────────────────────
  const { error: insertError } = await supabase.from("registrations").insert([
    {
      registration_id: registrationId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      college: college.trim(),
      dept: dept.trim(),
      year: year || null,
      events: eventsDetail,            // JSONB column
      event_ids: selectedEvents,       // JSONB column (raw ids + modes)
      amount: Number(amount),
      utr: utr.trim(),
      status: "pending",               // pending → verified by admin
      registered_at: new Date().toISOString(),
    },
  ]);

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    return res.status(500).json({ message: "Failed to save registration. Please contact support." });
  }

  // ── Send confirmation email ───────────────────────────────────
  try {
    const html = buildConfirmationEmail({
      name, email: cleanEmail, phone, college, dept, year,
      events: eventsDetail,
      amount, utr, registrationId,
    });

    await transporter.sendMail({
      from: `"Electryonz 2026" <${process.env.MAIL_USER}>`,
      to: cleanEmail,
      subject: `✅ Registration Confirmed – Electryonz 2026 [${registrationId}]`,
      html,
    });
  } catch (mailErr) {
    // Don't fail the request if mail fails — registration is already saved
    console.error("Mail send error:", mailErr.message);
  }

  return res.status(201).json({
    message: "Registration successful!",
    registrationId,
  });
});

module.exports = router;