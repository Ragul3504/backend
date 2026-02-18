const router = require("express").Router();
const QRCode = require("qrcode");

/**
 * GET /api/qr?amount=500
 * Returns a base64 PNG QR code for UPI payment
 */
router.get("/qr", async (req, res) => {
  const amount = parseFloat(req.query.amount) || 0;

  // UPI deep-link format
  const upiString = [
    `upi://pay`,
    `?pa=${encodeURIComponent(process.env.UPI_ID)}`,       // UPI ID
    `&pn=${encodeURIComponent(process.env.UPI_NAME)}`,     // Payee name
    `&am=${amount.toFixed(2)}`,                            // Amount
    `&cu=INR`,                                             // Currency
    `&tn=${encodeURIComponent("Synerix 2026 Registration")}`, // Note
  ].join("");

  try {
    const qrDataURL = await QRCode.toDataURL(upiString, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    // Strip "data:image/png;base64," prefix and send raw PNG
    const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    res.set("Content-Type", "image/png");
    res.set("Cache-Control", "no-store");
    res.send(imgBuffer);
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ message: "Failed to generate QR code" });
  }
});

/**
 * GET /api/qr/url?amount=500
 * Returns the UPI URL and QR as base64 JSON (useful for frontend img tags)
 */
router.get("/qr/url", async (req, res) => {
  const amount = parseFloat(req.query.amount) || 0;

  const upiString = [
    `upi://pay`,
    `?pa=${encodeURIComponent(process.env.UPI_ID)}`,
    `&pn=${encodeURIComponent(process.env.UPI_NAME)}`,
    `&am=${amount.toFixed(2)}`,
    `&cu=INR`,
    `&tn=${encodeURIComponent("Electryonz 2026 Registration")}`,
  ].join("");

  try {
    const qrDataURL = await QRCode.toDataURL(upiString, { width: 300, margin: 2 });
    res.json({ qr: qrDataURL, upiUrl: upiString, upiId: process.env.UPI_ID });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate QR code" });
  }
});

module.exports = router;