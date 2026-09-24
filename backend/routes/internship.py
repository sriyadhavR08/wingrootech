from flask import Blueprint, request, jsonify
from database import get_db_connection

internship_bp = Blueprint('internship', __name__)

@internship_bp.route('/api/internship', methods=['POST'])
def submit_internship():
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    college = data.get('college', '').strip()
    course = data.get('course', '').strip()
    year = data.get('year', '').strip()
    internship_type = data.get('internship_type', 'College Internship').strip()
    technology = data.get('technology', 'Full Stack Development').strip()
    message = data.get('message', '').strip()

    if not name or not email or not phone or not college:
        return jsonify({
            'success': False,
            'message': 'Please provide Name, Email, Phone, and College name.'
        }), 400

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            sql = """
            INSERT INTO internship_applications 
            (name, email, phone, college, course, year, internship_type, technology, message, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (name, email, phone, college, course, year, internship_type, technology, message, 'Under Review'))
            new_id = cursor.lastrowid
            app_no = f"WINGROO-INT-{new_id:04d}"
            cursor.execute("UPDATE internship_applications SET application_no = %s WHERE id = %s", (app_no, new_id))
        else:
            sql = """
            INSERT INTO internship_applications 
            (name, email, phone, college, course, year, internship_type, technology, message, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(sql, (name, email, phone, college, course, year, internship_type, technology, message, 'Under Review'))
            new_id = cursor.lastrowid
            app_no = f"WINGROO-INT-{new_id:04d}"
            cursor.execute("UPDATE internship_applications SET application_no = ? WHERE id = ?", (app_no, new_id))
            
        conn.commit()
        return jsonify({
            'success': True,
            'message': 'Your internship application has been submitted successfully!',
            'application_id': new_id,
            'application_no': app_no,
            'status': 'Under Review',
            'application': {
                'id': new_id,
                'application_no': app_no,
                'name': name,
                'email': email,
                'phone': phone,
                'college': college,
                'course': course,
                'year': year,
                'internship_type': internship_type,
                'technology': technology,
                'status': 'Under Review'
            }
        }), 201
    except Exception as e:
        print(f"[Error saving internship application] {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to save application: {str(e)}'
        }), 500
    finally:
        conn.close()

@internship_bp.route('/api/student/applications', methods=['GET', 'OPTIONS'])
def student_lookup():
    if request.method == 'OPTIONS':
        return '', 200

    query = request.args.get('search', '').strip() or request.args.get('query', '').strip() or request.args.get('email', '').strip()
    if not query:
        return jsonify({'success': False, 'message': 'Please provide an email, phone number, or application ID to search.', 'applications': []}), 400

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        search_pattern = f"%{query}%"
        if db_type == "mysql":
            sql = """
            SELECT id, application_no, name, email, phone, college, course, year, 
                   internship_type, technology, message, status, notes, created_at
            FROM internship_applications
            WHERE email = %s OR phone = %s OR application_no = %s OR application_no LIKE %s OR name LIKE %s
            ORDER BY id DESC
            """
            cursor.execute(sql, (query, query, query, search_pattern, search_pattern))
        else:
            sql = """
            SELECT id, application_no, name, email, phone, college, course, year, 
                   internship_type, technology, message, status, notes, created_at
            FROM internship_applications
            WHERE email = ? OR phone = ? OR application_no = ? OR application_no LIKE ? OR name LIKE ?
            ORDER BY id DESC
            """
            cursor.execute(sql, (query, query, query, search_pattern, search_pattern))

        rows = cursor.fetchall()
        applications = []
        if rows:
            for r in rows:
                item = dict(r)
                app_no = item.get('application_no') or f"WINGROO-INT-{item['id']:04d}"
                status = item.get('status') or 'Under Review'
                applications.append({
                    'id': item['id'],
                    'application_no': app_no,
                    'name': item['name'],
                    'email': item['email'],
                    'phone': item['phone'],
                    'college': item['college'],
                    'course': item['course'],
                    'year': item['year'],
                    'internship_type': item['internship_type'],
                    'technology': item['technology'],
                    'message': item.get('message') or '',
                    'status': status,
                    'notes': item.get('notes') or '',
                    'created_at': str(item.get('created_at', ''))
                })
        return jsonify({'success': True, 'applications': applications, 'count': len(applications)})
    except Exception as e:
        print(f"[Error in student_lookup] {e}")
        return jsonify({'success': False, 'message': str(e), 'applications': []}), 500
    finally:
        conn.close()

@internship_bp.route('/api/admin/internships/<int:app_id>/status', methods=['PUT', 'OPTIONS'])
def update_internship_status(app_id):
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    new_status = data.get('status', 'Under Review').strip()
    notes = data.get('notes', '').strip()

    valid_statuses = ['Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Completed', 'Rejected']
    if new_status not in valid_statuses:
        new_status = 'Under Review'

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            cursor.execute("UPDATE internship_applications SET status = %s, notes = %s WHERE id = %s", (new_status, notes, app_id))
        else:
            cursor.execute("UPDATE internship_applications SET status = ?, notes = ? WHERE id = ?", (new_status, notes, app_id))
        conn.commit()
        return jsonify({'success': True, 'message': f'Application #{app_id} status updated to {new_status}.', 'status': new_status})
    except Exception as e:
        print(f"[Error updating internship status] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()
