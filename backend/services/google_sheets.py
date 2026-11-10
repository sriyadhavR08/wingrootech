import os
import json
import logging
import threading
import urllib.request
import urllib.error
from datetime import datetime

logger = logging.getLogger(__name__)

TARGET_SPREADSHEET_ID = "1mT0ksBaB_-pfVbf2SYVV-cki_HM46MKxUNtvanxc9Dg"
DEFAULT_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyLqzAEQ6gucAOcNEAAJxtRx5bSXTCKf4OfT6PxHKEmLyk3lTadrCdhmIYQJ_d0k-IB/exec"


def get_sheet_webhook_url():
    """Returns the Google Apps Script Webhook URL from env, config file, or fallback"""
    url = os.getenv("GOOGLE_SHEET_WEBHOOK_URL", "").strip()
    if url:
        return url
    config_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "instance", "google_sheet_url.txt")
    if os.path.exists(config_file):
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                saved_url = f.read().strip()
                if saved_url:
                    return saved_url
        except Exception:
            pass
    return DEFAULT_WEBHOOK_URL


def set_sheet_webhook_url(url):
    """Saves the Google Apps Script Webhook URL permanently"""
    url = (url or "").strip()
    config_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "instance")
    os.makedirs(config_dir, exist_ok=True)
    config_file = os.path.join(config_dir, "google_sheet_url.txt")
    with open(config_file, "w", encoding="utf-8") as f:
        f.write(url)
    os.environ["GOOGLE_SHEET_WEBHOOK_URL"] = url
    return True


def post_to_google_sheet(payload):
    """Direct synchronous HTTP POST to the Google Apps Script Webhook"""
    url = get_sheet_webhook_url()
    if not url:
        return False, "Google Sheet Webhook URL not configured yet"

    try:
        body = json.dumps(payload, default=str).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "WingrooTechnologies-Sync/1.0"
            }
        )
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read().decode("utf-8", errors="ignore")
            logger.info(f"[Google Sheet Sync Success] {payload.get('form_type')}: {data}")
            return True, data
    except Exception as e:
        logger.warning(f"[Google Sheet Sync Warning] {e}")
        return False, str(e)


def sync_to_google_sheet(form_type, data):
    """
    Asynchronously syncs a form submission or update to the Google Sheet,
    and dispatches an instant lead notification email to wingrootechnologies@gmail.com.
    Runs in background threads so user response times are completely instantaneous.
    """
    # 1. Asynchronously sync to Google Sheets Webhook
    payload = {
        "form_type": form_type,
        "spreadsheet_id": TARGET_SPREADSHEET_ID,
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "data": data,
        **data
    }
    thread = threading.Thread(target=post_to_google_sheet, args=(payload,), daemon=True)
    thread.start()

    # 2. Asynchronously dispatch instant email notification to wingrootechnologies@gmail.com
    try:
        from services.email_service import async_send_lead_notification
        async_send_lead_notification(form_type, data)
    except Exception as email_err:
        logger.warning(f"[Email Notification Dispatch Warning] {email_err}")
