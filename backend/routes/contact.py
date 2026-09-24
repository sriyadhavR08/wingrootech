from flask import Blueprint, request, jsonify
from database import get_db_connection

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    subject = data.get('subject', 'Project Inquiry').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({
            'success': False,
            'message': 'Please provide all required fields (Name, Email, and Message).'
        }), 400

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
            
        conn.commit()
        return jsonify({
            'success': True,
            'message': "Thanks for reaching out. We'll get back to you soon."
        }), 201
    except Exception as e:
        print(f"[Error saving contact message to wingroo_technologies_db] {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to save contact message. Please try again later.'
        }), 500
    finally:
        conn.close()
