"""
OTP generation, email delivery, and rate-limiting for KRISHX authentication.

Configure via environment variables for production:
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL

If SMTP_USER is not set, the service runs in DEV MODE:
  OTPs are printed to the Flask console instead of emailed.
"""
import os
import random
import string
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_HOST  = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
SMTP_PORT  = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USER  = os.environ.get('SMTP_USER', '')
SMTP_PASS  = os.environ.get('SMTP_PASS', '')
FROM_EMAIL = os.environ.get('FROM_EMAIL', SMTP_USER or 'noreply@krishx.com')

DEV_MODE = not bool(SMTP_USER)  # True when no SMTP credentials configured

OTP_LENGTH       = 6
OTP_EXPIRY_SEC   = 300   # 5 minutes
OTP_MAX_ATTEMPTS = 3     # Failed verifications before OTP is invalidated
OTP_MAX_RESEND   = 3     # Max resend requests per 30-minute window

# In-memory resend rate-limit store: {email: [timestamp, ...]}
_resend_log: dict = {}


def generate_otp() -> str:
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))


def check_resend_rate_limit(email: str) -> bool:
    """Return True if another OTP may be sent; False if rate limit exceeded."""
    now   = time.time()
    times = [t for t in _resend_log.get(email, []) if now - t < 1800]
    if len(times) >= OTP_MAX_RESEND:
        return False
    times.append(now)
    _resend_log[email] = times
    return True


def _build_html(otp_code: str, headline: str, body_msg: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0F172A;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 16px">
    <table width="480" cellpadding="0" cellspacing="0"
           style="background:#1E293B;border-radius:16px;overflow:hidden;border:1px solid #334155">

      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);
                     padding:28px 32px 22px;text-align:center">
        <div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:4px">KRISHX</div>
        <div style="font-size:12px;color:rgba(255,255,255,.75);margin-top:4px;letter-spacing:1px">
          Smart Agriculture AI
        </div>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:32px">
        <h2 style="color:#F1F5F9;font-size:20px;margin:0 0 8px;font-weight:700">{headline}</h2>
        <p style="color:#94A3B8;font-size:14px;margin:0 0 28px;line-height:1.65">{body_msg}</p>

        <!-- OTP Box -->
        <div style="background:#0F172A;border-radius:12px;padding:28px 16px;text-align:center;
                    margin-bottom:24px;border:1px solid #334155">
          <p style="color:#64748B;font-size:11px;margin:0 0 10px;
                    text-transform:uppercase;letter-spacing:1.5px">Verification Code</p>
          <div style="font-size:44px;font-weight:900;color:#8B5CF6;
                      letter-spacing:16px;font-family:monospace">{otp_code}</div>
          <p style="color:#475569;font-size:12px;margin:12px 0 0">
            Valid for <strong style="color:#F59E0B">5 minutes</strong>
          </p>
        </div>

        <!-- Warning -->
        <div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);
                    border-radius:8px;padding:12px 16px">
          <p style="color:#FCA5A5;font-size:12px;margin:0;line-height:1.5">
            &#128274; <strong>Never share this code.</strong>
            KRISHX will never ask for your OTP via phone or chat.
          </p>
        </div>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:14px 32px 20px;text-align:center;
                     border-top:1px solid #334155">
        <p style="color:#475569;font-size:11px;margin:0">
          KRISHX Smart Agriculture &bull; Automated message &bull; Do not reply
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>"""


def send_otp_email(to_email: str, otp_code: str, purpose: str = 'register') -> bool:
    """
    Send an OTP email.  Returns True on success (or in DEV_MODE).

    purpose: 'register'  — account verification
             'reset'     — password reset
    """
    if purpose == 'register':
        subject  = 'KRISHX — Email Verification Code'
        headline = 'Verify your email address'
        body_msg = ('Use the code below to complete your KRISHX account registration. '
                    'Do not share it with anyone.')
    else:
        subject  = 'KRISHX — Password Reset Code'
        headline = 'Reset your password'
        body_msg = ('You requested a password reset for your KRISHX account. '
                    'Use the code below. If you did not request this, ignore this email.')

    if DEV_MODE:
        separator = '=' * 52
        print(f'\n{separator}')
        print(f' [KRISHX OTP — DEV MODE]')
        print(f' To      : {to_email}')
        print(f' Purpose : {purpose}')
        print(f' OTP Code: {otp_code}')
        print(f' (Configure SMTP_USER env var to send real emails)')
        print(f'{separator}\n')
        return True

    html = _build_html(otp_code, headline, body_msg)
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From']    = f'KRISHX Agriculture <{FROM_EMAIL}>'
        msg['To']      = to_email
        msg.attach(MIMEText(html, 'html', 'utf-8'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as srv:
            srv.ehlo()
            srv.starttls()
            srv.ehlo()
            srv.login(SMTP_USER, SMTP_PASS)
            srv.send_message(msg)
        return True
    except Exception as exc:
        print(f'[EMAIL] Failed to send OTP to {to_email}: {exc}')
        return False
