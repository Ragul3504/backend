/**
 * Generates the registration confirmation email HTML
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.college
 * @param {string} data.dept
 * @param {string} data.year
 * @param {string} data.phone
 * @param {Array}  data.events   - [{ title, mode }]
 * @param {number} data.amount
 * @param {string} data.utr
 * @param {string} data.registrationId
 */
function buildConfirmationEmail(data) {
  const eventRows = data.events
    .map(
      (e) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #1e2a3a;">${e.title}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e2a3a;text-align:center;">${e.mode || "—"}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Registration Confirmation – Electryonz 2026</title>
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:'Segoe UI',Arial,sans-serif;color:#e0e8ff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0d1526;border:1px solid #1a2a4a;border-radius:12px;overflow:hidden;max-width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#00f0ff22,#7b2fff22);padding:36px 40px;text-align:center;border-bottom:2px solid #00f0ff44;">
              <h1 style="margin:0;font-size:2rem;letter-spacing:4px;color:#00f0ff;text-transform:uppercase;">SYNERIX 2026</h1>
              <p style="margin:8px 0 0;color:#a0b4cc;font-size:0.9rem;letter-spacing:2px;">NATIONAL LEVEL SYMPOSIUM</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="color:#00f0ff;margin:0 0 6px;font-size:1.2rem;">Registration Confirmed ✅</h2>
              <p style="margin:0 0 24px;color:#a0b4cc;">Hi <strong style="color:#e0e8ff;">${data.name}</strong>, your registration is confirmed! Here's your summary:</p>

              <!-- Reg ID badge -->
              <div style="background:#0a0f1e;border:1px solid #00f0ff55;border-radius:8px;padding:14px 20px;margin-bottom:24px;text-align:center;">
                <span style="font-size:0.8rem;color:#a0b4cc;letter-spacing:2px;">REGISTRATION ID</span><br/>
                <span style="font-size:1.3rem;font-weight:bold;color:#00f0ff;letter-spacing:3px;">${data.registrationId}</span>
              </div>

              <!-- Participant details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:6px 0;color:#a0b4cc;width:40%;">College</td>
                  <td style="padding:6px 0;color:#e0e8ff;">${data.college}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#a0b4cc;">Department</td>
                  <td style="padding:6px 0;color:#e0e8ff;">${data.dept}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#a0b4cc;">Year</td>
                  <td style="padding:6px 0;color:#e0e8ff;">${data.year}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#a0b4cc;">Phone</td>
                  <td style="padding:6px 0;color:#e0e8ff;">${data.phone}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#a0b4cc;">Email</td>
                  <td style="padding:6px 0;color:#e0e8ff;">${data.email}</td>
                </tr>
              </table>

              <!-- Events table -->
              <h3 style="color:#7b2fff;margin:0 0 10px;font-size:1rem;letter-spacing:1px;text-transform:uppercase;">Registered Events</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;border:1px solid #1a2a4a;border-radius:8px;margin-bottom:24px;">
                <thead>
                  <tr style="background:#1a2a4a;">
                    <th style="padding:10px 12px;text-align:left;color:#a0b4cc;font-size:0.85rem;">Event</th>
                    <th style="padding:10px 12px;text-align:center;color:#a0b4cc;font-size:0.85rem;">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  ${eventRows}
                </tbody>
              </table>

              <!-- Payment info -->
              <div style="background:#0a0f1e;border:1px solid #7b2fff55;border-radius:8px;padding:14px 20px;margin-bottom:24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#a0b4cc;">Amount Paid</td>
                    <td style="text-align:right;color:#00f0ff;font-size:1.2rem;font-weight:bold;">₹${data.amount}</td>
                  </tr>
                  <tr>
                    <td style="color:#a0b4cc;padding-top:6px;">UTR / Transaction ID</td>
                    <td style="text-align:right;color:#e0e8ff;padding-top:6px;">${data.utr}</td>
                  </tr>
                </table>
              </div>

              <p style="color:#a0b4cc;font-size:0.88rem;margin:0;">
                Please carry this email (printed or digital) on the day of the event for verification.
                For queries, contact us at <a href="mailto:${process.env.MAIL_USER}" style="color:#00f0ff;">${process.env.MAIL_USER}</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0a0f1e;padding:20px 40px;text-align:center;border-top:1px solid #1a2a4a;">
              <p style="margin:0;color:#3a4a6a;font-size:0.8rem;">© 2026 Synerix – All rights reserved</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { buildConfirmationEmail };