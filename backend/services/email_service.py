import os
import smtplib
import logging
import threading
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import Config

logger = logging.getLogger(__name__)

# Google Sheet direct viewing link for quick reference in emails
SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1mT0ksBaB_-pfVbf2SYVV-cki_HM46MKxUNtvanxc9Dg/edit"


def get_email_config():
    """Retrieve SMTP credentials from environment variables or Config"""
    return {
        "smtp_server": os.getenv("SMTP_SERVER") or getattr(Config, "SMTP_SERVER", "smtp.gmail.com"),
        "smtp_port": int(os.getenv("SMTP_PORT") or getattr(Config, "SMTP_PORT", 587)),
        "smtp_email": os.getenv("SMTP_EMAIL") or getattr(Config, "SMTP_EMAIL", "wingrootechnologies@gmail.com"),
        "smtp_password": (os.getenv("SMTP_PASSWORD") or getattr(Config, "SMTP_PASSWORD", "")).replace(" ", "").strip(),
        "receiver_email": os.getenv("NOTIFICATION_RECEIVER_EMAIL") or getattr(Config, "NOTIFICATION_RECEIVER_EMAIL", "wingrootechnologies@gmail.com"),
    }


def format_field_label(key):
    """Converts a snake_case or raw field key into a clean, human-readable label"""
    label_map = {
        "name": "Full Name",
        "full_name": "Full Name",
        "email": "Email Address",
        "phone": "Phone / Mobile",
        "mobile_number": "Phone / Mobile",
        "college": "College / University",
        "college_name": "College / University",
        "department": "Department",
        "course": "Course / Degree",
        "year": "Year of Study",
        "internship_type": "Internship Mode / Type",
        "technology": "Domain / Technology",
        "technologies": "Skills & Technologies",
        "experience_level": "Experience Level",
        "event_title": "Event Title",
        "registration_no": "Registration No",
        "application_no": "Application No",
        "request_no": "Request No",
        "register_number": "College Reg No",
        "candidate_type": "Candidate Type",
        "project_name": "Project / Course",
        "subject": "Enquiry Subject",
        "status": "Current Status",
        "message": "Message / Details",
        "notes": "Additional Notes",
        "resume_url": "Resume / CV Link",
        "portfolio_url": "Portfolio / GitHub Link",
        "created_at": "Submission Time",
        "timestamp": "Timestamp",
    }
    return label_map.get(key, key.replace("_", " ").title())


def build_lead_email_html(form_type, data):
    """Generates a clean, professional, mobile-friendly HTML email template"""
    lead_name = data.get("name") or data.get("full_name") or "New Visitor / Applicant"
    lead_email = data.get("email") or ""
    lead_phone = data.get("phone") or data.get("mobile_number") or ""
    current_time = datetime.now().strftime("%d %b %Y, %I:%M %p IST")

    # Filter out internal/database IDs and None values for the display table
    excluded_keys = {"id", "data", "spreadsheet_id", "timestamp", "form_type"}
    
    rows_html = ""
    for k, v in data.items():
        if k in excluded_keys or v is None or str(v).strip() == "":
            continue
        label = format_field_label(k)
        val_str = str(v).strip()

        # Handle clickable links for resume/portfolio
        if k in ("resume_url", "portfolio_url") and val_str.startswith("http"):
            val_display = f'<a href="{val_str}" target="_blank" style="color: #4F46E5; font-weight: 600; text-decoration: underline;">View Document ↗</a>'
        elif k == "email":
            val_display = f'<a href="mailto:{val_str}" style="color: #4F46E5; font-weight: 600; text-decoration: none;">{val_str}</a>'
        elif k in ("phone", "mobile_number"):
            clean_tel = "".join(ch for ch in val_str if ch.isdigit() or ch == "+")
            val_display = f'<a href="tel:{clean_tel}" style="color: #059669; font-weight: 600; text-decoration: none;">{val_str}</a>'
        elif k in ("message", "notes"):
            val_display = f'<div style="background: #F8FAFC; border-left: 3px solid #6366F1; padding: 8px 12px; border-radius: 4px; font-style: italic; color: #334155;">{val_str}</div>'
        else:
            val_display = f'<span style="color: #0F172A; font-weight: 500;">{val_str}</span>'

        rows_html += f"""
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 13px; font-weight: 600; width: 34%; text-transform: uppercase; letter-spacing: 0.5px;">{label}</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #E2E8F0; color: #0F172A; font-size: 14px; line-height: 1.5;">{val_display}</td>
        </tr>
        """

    # Action buttons
    reply_btn = ""
    if lead_email:
        reply_btn = f"""
        <a href="mailto:{lead_email}?subject=Regarding your enquiry at Wingroo Technologies" 
           style="display: inline-block; background: #4F46E5; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 10px 18px; border-radius: 6px; text-decoration: none; margin-right: 8px; margin-bottom: 8px;">
           ✉️ Reply to {lead_name.split()[0]}
        </a>
        """

    call_btn = ""
    if lead_phone:
        clean_tel = "".join(ch for ch in lead_phone if ch.isdigit() or ch == "+")
        call_btn = f"""
        <a href="tel:{clean_tel}" 
           style="display: inline-block; background: #059669; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 10px 18px; border-radius: 6px; text-decoration: none; margin-right: 8px; margin-bottom: 8px;">
           📞 Call Lead ({lead_phone})
        </a>
        """

    sheet_btn = f"""
    <a href="{SPREADSHEET_URL}" target="_blank"
       style="display: inline-block; background: #1E293B; color: #F1F5F9; font-weight: 600; font-size: 13px; padding: 10px 18px; border-radius: 6px; text-decoration: none; margin-bottom: 8px;">
       📊 Open Google Sheet
    </a>
    """

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Lead Notification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F1F5F9; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08); border: 1px solid #E2E8F0;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%); padding: 24px 28px; text-align: left;">
                  <table width="100%">
                    <tr>
                      <td>
                        <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">WINGROO TECHNOLOGIES</h1>
                        <p style="margin: 4px 0 0 0; color: #94A3B8; font-size: 12px; font-weight: 500;">Automated Lead & Registration Notification System</p>
                      </td>
                      <td align="right" valign="top">
                        <span style="display: inline-block; background: #F59E0B; color: #0F172A; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px;">
                          NEW ALERT
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Lead Title Banner -->
              <tr>
                <td style="background-color: #EEF2FF; border-bottom: 2px solid #C7D2FE; padding: 16px 28px;">
                  <table width="100%">
                    <tr>
                      <td>
                        <span style="color: #4338CA; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Form Category</span>
                        <h2 style="margin: 2px 0 0 0; color: #1E1B4B; font-size: 17px; font-weight: 700;">{form_type}</h2>
                      </td>
                      <td align="right" style="color: #64748B; font-size: 12px;">
                        📅 {current_time}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content Table -->
              <tr>
                <td style="padding: 20px 28px 10px 28px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                    {rows_html}
                  </table>
                </td>
              </tr>

              <!-- Quick Action Buttons -->
              <tr>
                <td style="padding: 16px 28px 24px 28px;">
                  <p style="margin: 0 0 10px 0; color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Quick Actions</p>
                  <div>
                    {reply_btn}
                    {call_btn}
                    {sheet_btn}
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px 28px; text-align: center;">
                  <p style="margin: 0; color: #94A3B8; font-size: 12px; line-height: 1.5;">
                    This email was sent automatically to <strong>{lead_email or 'wingrootechnologies@gmail.com'}</strong> by the Wingroo Technologies server upon form submission.<br>
                    Data is also securely archived in the official <a href="{SPREADSHEET_URL}" style="color: #4F46E5;">Google Spreadsheet</a>.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    return html


def build_lead_email_plain(form_type, data):
    """Fallback plain text representation of the lead details"""
    lines = [
        f"==================================================",
        f"WINGROO TECHNOLOGIES - NEW LEAD ALERT",
        f"Form Type: {form_type}",
        f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')}",
        f"==================================================",
        "",
    ]
    excluded_keys = {"id", "data", "spreadsheet_id", "timestamp", "form_type"}
    for k, v in data.items():
        if k in excluded_keys or v is None or str(v).strip() == "":
            continue
        label = format_field_label(k)
        lines.append(f"{label}: {v}")

    lines.append("")
    lines.append(f"Google Spreadsheet: {SPREADSHEET_URL}")
    lines.append(f"==================================================")
    return "\n".join(lines)


def send_lead_email(form_type, data):
    """
    Synchronously dispatches an HTML email to wingrootechnologies@gmail.com via Gmail SMTP.
    Returns (success: bool, message: str)
    """
    cfg = get_email_config()
    sender_email = cfg["smtp_email"]
    sender_password = cfg["smtp_password"]
    receiver_email = cfg["receiver_email"]

    if not sender_email or not sender_password:
        logger.warning("[Email Service] SMTP credentials not configured. Skipping email.")
        return False, "SMTP credentials missing"

    lead_name = data.get("name") or data.get("full_name") or "New Lead"
    lead_email = data.get("email") or ""

    subject = f"🚨 New Lead: [{form_type}] - {lead_name}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Wingroo Technologies <{sender_email}>"
    msg["To"] = receiver_email
    
    # If student/client provided an email, set Reply-To so clicking reply responds to them directly
    if lead_email and "@" in lead_email:
        msg["Reply-To"] = lead_email

    # Plain text and HTML parts
    plain_text = build_lead_email_plain(form_type, data)
    html_content = build_lead_email_html(form_type, data)

    msg.attach(MIMEText(plain_text, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        server = smtplib.SMTP(cfg["smtp_server"], cfg["smtp_port"], timeout=15)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, [receiver_email], msg.as_string())
        server.quit()
        logger.info(f"[Email Service Success] Sent lead notification for '{form_type}' ({lead_name}) to {receiver_email}")
        return True, "Email sent successfully"
    except Exception as e:
        logger.error(f"[Email Service Error] Failed sending lead notification: {e}")
        return False, str(e)


def async_send_lead_notification(form_type, data):
    """
    Fires the email notification in a background daemon thread so frontend requests
    return instantaneously without waiting for SMTP network handshake.
    """
    thread = threading.Thread(
        target=send_lead_email,
        args=(form_type, dict(data)),
        daemon=True,
        name=f"LeadNotify-{form_type}"
    )
    thread.start()
    return thread
