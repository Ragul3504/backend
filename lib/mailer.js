// lib/mailer.js
// ─────────────────────────────────────────────────────────────
// Nodemailer setup using Gmail SMTP with an App Password.
// Exports two functions:
//   sendUserConfirmation()  → email to the registered student
//   sendAdminNotification() → email to altranz2026@gmail.com
// ─────────────────────────────────────────────────────────────

const nodemailer = require('nodemailer');

// ── Create transporter once ───────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,   // altranz2026@gmail.com
    pass: process.env.SMTP_PASS,   // 16-char App Password (NOT Gmail password)
  },
});

// ── Verify connection (useful during local dev) ───────────────
transporter.verify((err) => {
  if (err) console.error('[Mailer] SMTP connection error:', err.message);
  else     console.log('[Mailer] SMTP ready');
});

// ─────────────────────────────────────────────────────────────
//  Helper: format event list as HTML rows
// ─────────────────────────────────────────────────────────────
function eventsTable(events, totalFee) {
  const rows = events
    .map(e => `<tr>
      <td style="padding:8px 14px;border-bottom:1px solid #2a2a2a;color:#e0e0e0;">${e}</td>
    </tr>`)
    .join('');
  return `
    <table width="100%" cellspacing="0" cellpadding="0"
           style="border-collapse:collapse;background:#1a1a1a;border-radius:4px;overflow:hidden;">
      <thead>
        <tr style="background:#111;">
          <th style="padding:10px 14px;text-align:left;color:#f5c518;
                     font-family:'Barlow Condensed',sans-serif;
                     letter-spacing:2px;font-size:13px;">EVENT</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr style="background:#111;">
          <td style="padding:10px 14px;color:#f5c518;font-weight:700;font-size:18px;">
            Total: ₹${totalFee}
          </td>
        </tr>
      </tfoot>
    </table>`;
}

// ─────────────────────────────────────────────────────────────
//  Shared HTML email shell
// ─────────────────────────────────────────────────────────────
function emailShell(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Barlow:wght@400;500&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Barlow',Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellspacing="0" cellpadding="0"
               style="max-width:600px;background:#111111;border:1.5px solid #2a2a2a;border-radius:8px;overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="background:#0a0a0a;padding:32px 36px;border-bottom:3px solid #f5c518;text-align:center;">
              <div style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:11px;
                          letter-spacing:6px;color:#f5c518;text-transform:uppercase;margin-bottom:6px;">
                Electryonz 2026
              </div>
              <div style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:42px;
                          font-weight:800;letter-spacing:10px;color:#ffffff;text-transform:uppercase;line-height:1;">
                ${title}
              </div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:32px 36px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 36px;border-top:1px solid #222;text-align:center;">
              <p style="font-size:11px;color:#444;margin:0;">
                Electryonz 2026 &nbsp;|&nbsp; altranz2026@gmail.com<br/>
                This is an automated message. Do not reply directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
//  1. Confirmation email → registered student
// ─────────────────────────────────────────────────────────────
async function sendUserConfirmation(data) {
  const { fullName, email, college, dept, year, events, totalFee, regId } = data;

  const body = `
    <p style="color:#aaa;font-size:15px;margin:0 0 20px;">
      Hey <strong style="color:#fff;">${fullName}</strong>, you're officially registered for
      <strong style="color:#f5c518;">Electryonz 2026</strong>! 🎉
    </p>

    <!-- Details card -->
    <table width="100%" cellspacing="0" cellpadding="0"
           style="background:#1a1a1a;border-radius:4px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 22px;">
          <p style="margin:0 0 8px;font-size:13px;color:#666;letter-spacing:2px;text-transform:uppercase;">
            Registration ID
          </p>
          <p style="margin:0 0 18px;font-size:22px;font-family:'Barlow Condensed',sans-serif;
                    font-weight:800;letter-spacing:3px;color:#f5c518;">${regId}</p>

          <table width="100%" cellspacing="0" cellpadding="0">
            ${row('College', college)}
            ${row('Department', dept)}
            ${row('Year', year + (year==='1'?'st':year==='2'?'nd':year==='3'?'rd':'th') + ' Year')}
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:#666;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">
      Events Registered
    </p>
    ${eventsTable(events, totalFee)}

    <div style="margin:28px 0 0;padding:16px 20px;background:rgba(245,197,24,0.06);
                border-left:3px solid #f5c518;border-radius:3px;">
      <p style="margin:0;font-size:13px;color:#aaa;line-height:1.7;">
        📌 <strong style="color:#fff;">Important:</strong> Please bring this email (printed or on your phone)
        along with your college ID card to the venue.<br/>
        Payment confirmation is subject to verification by our team.
      </p>
    </div>`;

  await transporter.sendMail({
    from:    `"Electryonz 2026" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: `✅ Registration Confirmed – Electryonz 2026 | ${regId}`,
    html:    emailShell('Confirmed!', body),
  });

  console.log(`[Mailer] Confirmation sent to ${email}`);
}

// ─────────────────────────────────────────────────────────────
//  2. Admin notification → altranz2026@gmail.com
// ─────────────────────────────────────────────────────────────
async function sendAdminNotification(data) {
  const { fullName, email, phone, college, dept, year, events, totalFee, regId } = data;

  const body = `
    <p style="color:#aaa;font-size:15px;margin:0 0 20px;">
      New registration received for <strong style="color:#f5c518;">Electryonz 2026</strong>.
    </p>

    <table width="100%" cellspacing="0" cellpadding="0"
           style="background:#1a1a1a;border-radius:4px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px 22px;">
          ${row('Reg ID',    regId)}
          ${row('Full Name', fullName)}
          ${row('Email',     email)}
          ${row('Phone',     phone)}
          ${row('College',   college)}
          ${row('Dept',      dept)}
          ${row('Year',      year + ' Year')}
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:#666;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">
      Events &amp; Fee
    </p>
    ${eventsTable(events, totalFee)}`;

  await transporter.sendMail({
    from:    `"Electryonz 2026 Bot" <${process.env.SMTP_USER}>`,
    to:      process.env.SMTP_USER,   // altranz2026@gmail.com
    subject: `🆕 New Registration: ${fullName} | ${regId} | ₹${totalFee}`,
    html:    emailShell('New Entry', body),
  });

  console.log(`[Mailer] Admin notification sent for ${regId}`);
}

// ─────────────────────────────────────────────────────────────
//  Shared helper: one detail row
// ─────────────────────────────────────────────────────────────
function row(label, value) {
  return `<tr>
    <td style="padding:5px 0;font-size:12px;color:#555;width:110px;vertical-align:top;">${label}</td>
    <td style="padding:5px 0;font-size:14px;color:#e0e0e0;">${value}</td>
  </tr>`;
}

module.exports = { sendUserConfirmation, sendAdminNotification };
