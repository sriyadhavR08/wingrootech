import re
import time
import random
import secrets
from flask import Blueprint, request, jsonify
from database import get_db_connection

contact_bp = Blueprint('contact', __name__)

# Temporary in-memory store for Contact Form email verification OTPs
# Format: { email: { 'otp': str, 'expires_at': float, 'verified': bool, 'token': str, 'name': str } }
contact_otp_store = {}


def validate_email_address(email):
    """Strictly validates email format and prevents common disposable domains"""
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    clean_email = email.strip().lower()
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(pattern, clean_email):
        return False, "Invalid email address format (e.g. name@gmail.com)."
    
    parts = clean_email.split('@')
    if len(parts) != 2:
        return False, "Invalid email address format."
    
    domain = parts[1]
    if '.' not in domain or len(domain.split('.')[-1]) < 2:
        return False, "Email domain is invalid."
        
    disposable_domains = {
        "tempmail.com", "throwawaymail.com", "mailinator.com", "guerrillamail.com",
        "10minutemail.com", "trashmail.com", "yopmail.com", "fakemailgenerator.com",
        "sharklasers.com", "getairmail.com", "dispostable.com"
    }
    if domain in disposable_domains:
        return False, "Temporary/disposable email addresses are not permitted."
        
    return True, clean_email


def validate_indian_phone(phone_raw):
    """
    Validates Indian 10-digit mobile numbers with strict anti-dummy checks:
    - Must be 10 digits
    - Must start with 6, 7, 8, or 9
    - Rejects identical digit sequences (9999999999, 0000000000)
    - Rejects sequential series (1234567890, 9876543210)
    - Requires at least 4 unique digits
    """
    if not phone_raw or not isinstance(phone_raw, str):
        return False, "Phone number is required."
        
    digits = "".join(filter(str.isdigit, phone_raw))
    
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
        
    if len(digits) != 10:
        return False, "Mobile number must be exactly 10 digits."
        
    if digits[0] not in "6789":
        return False, "Mobile number must start with 6, 7, 8, or 9."
        
    if len(set(digits)) == 1:
        return False, "Dummy mobile number detected: Repeated digits are not allowed."
        
    if len(set(digits)) < 4:
        return False, "Please provide a valid personal 10-digit mobile number."
        
    dummy_patterns = {
        "1234567890", "0123456789", "9876543210", "8765432109",
        "9898989898", "9090909090", "9191919191", "8989898989",
        "7878787878", "6767676767", "9876598765", "1122334455"
    }
    if digits in dummy_patterns:
        return False, "Dummy test number detected. Please enter your real mobile number."
        
    return True, digits


@contact_bp.route('/api/contact/send-otp', methods=['POST', 'OPTIONS'])
def send_contact_otp():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    raw_email = data.get('email', '')
    name = data.get('name', 'Valued Visitor').strip()

    valid, email_or_err = validate_email_address(raw_email)
    if not valid:
        return jsonify({'success': False, 'message': email_or_err}), 400

    email = email_or_err

    # Generate 6-digit OTP
    otp = f"{random.randint(100000, 999999)}"
    expires_at = time.time() + 600  # 10 minutes

    contact_otp_store[email] = {
        'otp': otp,
        'expires_at': expires_at,
        'verified': False,
        'token': None,
        'name': name
    }

    try:
        from services.email_service import send_contact_otp_email
        ok, msg = send_contact_otp_email(email, otp, name)
        if ok:
            return jsonify({
                'success': True,
                'message': f'Verification OTP sent to {email}. Please check your inbox or spam folder.'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': f'Failed to send OTP email: {msg}'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error dispatching verification code: {str(e)}'
        }), 500


@contact_bp.route('/api/contact/verify-otp', methods=['POST', 'OPTIONS'])
def verify_contact_otp():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    raw_email = data.get('email', '')
    entered_otp = str(data.get('otp', '')).strip()

    valid, email_or_err = validate_email_address(raw_email)
    if not valid:
        return jsonify({'success': False, 'message': email_or_err}), 400

    email = email_or_err
    record = contact_otp_store.get(email)

    if not record:
        return jsonify({
            'success': False,
            'message': 'No verification code was requested for this email. Please click "Send OTP".'
        }), 400

    if time.time() > record.get('expires_at', 0):
        contact_otp_store.pop(email, None)
        return jsonify({
            'success': False,
            'message': 'Verification code has expired. Please request a new OTP.'
        }), 400

    if record.get('otp') != entered_otp:
        return jsonify({
            'success': False,
            'message': 'Invalid OTP code. Please check the 6-digit code sent to your email.'
        }), 400

    # Verification successful
    v_token = secrets.token_hex(16)
    record['verified'] = True
    record['token'] = v_token
    record['verified_at'] = time.time()

    return jsonify({
        'success': True,
        'verification_token': v_token,
        'message': 'Email verified successfully!'
    }), 200


@contact_bp.route('/api/contact', methods=['POST'])
@contact_bp.route('/api/contact/', methods=['POST'])
def submit_contact():
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    email_raw = data.get('email', '').strip()
    phone_raw = data.get('phone', '').strip()
    subject = data.get('subject', 'Project Inquiry').strip()
    message = data.get('message', '').strip()
    verification_token = data.get('verification_token', '').strip()

    if not name or not email_raw or not message:
        return jsonify({
            'success': False,
            'message': 'Please provide all required fields (Name, Email, and Message).'
        }), 400

    # 1. Email validation & OTP Verification Check
    email_valid, email_or_err = validate_email_address(email_raw)
    if not email_valid:
        return jsonify({'success': False, 'message': email_or_err}), 400
    email = email_or_err

    otp_record = contact_otp_store.get(email)
    is_verified = (
        otp_record 
        and otp_record.get('verified') is True 
        and (verification_token == otp_record.get('token') or (time.time() - otp_record.get('verified_at', 0)) < 1800)
    )

    if not is_verified:
        return jsonify({
            'success': False,
            'message': 'Email verification required. Please click "Verify Email" to receive an OTP code before submitting.'
        }), 400

    # 2. Strict Phone Number Validation
    phone_valid, phone_or_err = validate_indian_phone(phone_raw)
    if not phone_valid:
        return jsonify({'success': False, 'message': phone_or_err}), 400
    phone = f"+91 {phone_or_err}"

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            sql = """
            INSERT INTO contacts (name, email, phone, subject, message) 
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (name, email, phone, subject, message))
        else:
            sql = """
            INSERT INTO contacts (name, email, phone, subject, message) 
            VALUES (?, ?, ?, ?, ?)
            """
            cursor.execute(sql, (name, email, phone, subject, message))
            
        new_id = cursor.lastrowid
        conn.commit()

        # Clean up verified OTP record after successful submission
        contact_otp_store.pop(email, None)

        # Asynchronously sync contact lead to Google Spreadsheet and dispatch email alert
        try:
            from services.google_sheets import sync_to_google_sheet
            sync_to_google_sheet('Contact Enquiry', {
                'id': new_id,
                'request_no': f"WINGROO-PRJ-{new_id:04d}" if new_id else None,
                'name': name,
                'email': email,
                'phone': phone,
                'subject': subject,
                'message': message,
                'status': 'Under Review'
            })
        except Exception as sheet_err:
            print(f"[Google Sheet Hook Notice] {sheet_err}")

        return jsonify({
            'success': True,
            'message': "Thanks for reaching out! Your message has been received.",
            'request_id': new_id,
            'request_no': f"WINGROO-PRJ-{new_id:04d}" if new_id else None
        }), 201
    except Exception as e:
        print(f"[Error saving contact message to wingroo_technologies_db] {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to save contact message. Please try again later.'
        }), 500
    finally:
        conn.close()
