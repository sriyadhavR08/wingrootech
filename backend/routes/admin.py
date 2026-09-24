from flask import Blueprint, request, jsonify
from database import get_db_connection
import datetime

admin_bp = Blueprint('admin', __name__)

ADMIN_SECRET_KEY = "admin123"

def format_row(row):
    """Convert datetime objects to string for JSON serialization"""
    item = dict(row)
    for k, v in item.items():
        if isinstance(v, (datetime.date, datetime.datetime)):
            item[k] = v.strftime("%Y-%m-%d %H:%M:%S")
    return item

@admin_bp.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json() or {}
    passcode = data.get('passcode', '').strip()
    
    # Allow 'admin' or 'admin123' or 'wingroo' for convenience
    if passcode in ["admin", "admin123", "wingroo", "wingroo2026"]:
        return jsonify({
            'success': True,
            'message': 'Admin authenticated successfully',
            'token': 'wingroo-admin-session-token'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid admin passcode. Please enter the correct admin key.'
        }), 401

@admin_bp.route('/api/admin/overview', methods=['GET'])
def get_admin_overview():
    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Contacts count
        cursor.execute("SELECT COUNT(*) AS total FROM contacts")
        contact_res = cursor.fetchone()
        total_contacts = contact_res['total'] if isinstance(contact_res, dict) else contact_res[0]
        
        # Internships count
        cursor.execute("SELECT COUNT(*) AS total FROM internship_applications")
        intern_res = cursor.fetchone()
        total_internships = intern_res['total'] if isinstance(intern_res, dict) else intern_res[0]
        
        # Projects count
        cursor.execute("SELECT COUNT(*) AS total FROM projects")
        proj_res = cursor.fetchone()
        total_projects = proj_res['total'] if isinstance(proj_res, dict) else proj_res[0]

        # Events count
        cursor.execute("SELECT COUNT(*) AS total FROM events")
        ev_res = cursor.fetchone()
        total_events = ev_res['total'] if isinstance(ev_res, dict) else ev_res[0]
        
        # Recent contacts (latest 5)
        cursor.execute("SELECT * FROM contacts ORDER BY id DESC LIMIT 5")
        recent_contacts_raw = cursor.fetchall()
        recent_contacts = [format_row(r) for r in recent_contacts_raw]
        
        # Recent internships (latest 5)
        cursor.execute("SELECT * FROM internship_applications ORDER BY id DESC LIMIT 5")
        recent_interns_raw = cursor.fetchall()
        recent_internships = [format_row(r) for r in recent_interns_raw]
        
        return jsonify({
            'success': True,
            'stats': {
                'total_contacts': total_contacts,
                'total_internships': total_internships,
                'total_projects': total_projects,
                'total_events': total_events,
                'total_submissions': total_contacts + total_internships
            },
            'recent_contacts': recent_contacts,
            'recent_internships': recent_internships
        })
    except Exception as e:
        print(f"[Admin Overview Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/api/admin/contacts', methods=['GET'])
def get_all_contacts():
    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM contacts ORDER BY id DESC")
        rows = cursor.fetchall()
        contacts = [format_row(r) for r in rows]
        return jsonify({
            'success': True,
            'contacts': contacts,
            'count': len(contacts)
        })
    except Exception as e:
        print(f"[Admin Get Contacts Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/api/admin/contacts/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            cursor.execute("DELETE FROM contacts WHERE id = %s", (contact_id,))
        else:
            cursor.execute("DELETE FROM contacts WHERE id = ?", (contact_id,))
        conn.commit()
        return jsonify({'success': True, 'message': f'Contact inquiry #{contact_id} deleted successfully.'})
    except Exception as e:
        print(f"[Admin Delete Contact Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/api/admin/internships', methods=['GET'])
def get_all_internships():
    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM internship_applications ORDER BY id DESC")
        rows = cursor.fetchall()
        internships = [format_row(r) for r in rows]
        return jsonify({
            'success': True,
            'internships': internships,
            'count': len(internships)
        })
    except Exception as e:
        print(f"[Admin Get Internships Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

@admin_bp.route('/api/admin/internships/<int:intern_id>', methods=['DELETE'])
def delete_internship(intern_id):
    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            cursor.execute("DELETE FROM internship_applications WHERE id = %s", (intern_id,))
        else:
            cursor.execute("DELETE FROM internship_applications WHERE id = ?", (intern_id,))
        conn.commit()
        return jsonify({'success': True, 'message': f'Internship application #{intern_id} deleted successfully.'})
    except Exception as e:
        print(f"[Admin Delete Internship Error] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()
