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
    resume_url = data.get('resume_url', '').strip()
    portfolio_url = data.get('portfolio_url', '').strip()

    if not name or not email or not phone or not college:
        return jsonify({
            'success': False,
            'message': 'Please provide Name, Email, Phone, and College name.'
        }), 400

    full_message = message
    if resume_url:
        full_message = f"{full_message}\n\n[📄 RESUME ATTACHED: {resume_url}]"
    if portfolio_url:
        full_message = f"{full_message}\n[🔗 PORTFOLIO / GITHUB: {portfolio_url}]"

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            try:
                sql = """
                INSERT INTO internship_applications 
                (name, email, phone, college, course, year, internship_type, technology, message, resume_url, status) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (name, email, phone, college, course, year, internship_type, technology, full_message, resume_url, 'Under Review'))
            except Exception:
                sql = """
                INSERT INTO internship_applications 
                (name, email, phone, college, course, year, internship_type, technology, message, status) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (name, email, phone, college, course, year, internship_type, technology, full_message, 'Under Review'))
            new_id = cursor.lastrowid
            app_no = f"WINGROO-INT-{new_id:04d}"
            cursor.execute("UPDATE internship_applications SET application_no = %s WHERE id = %s", (app_no, new_id))
        else:
            try:
                sql = """
                INSERT INTO internship_applications 
                (name, email, phone, college, course, year, internship_type, technology, message, resume_url, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """
                cursor.execute(sql, (name, email, phone, college, course, year, internship_type, technology, full_message, resume_url, 'Under Review'))
            except Exception:
                sql = """
                INSERT INTO internship_applications 
                (name, email, phone, college, course, year, internship_type, technology, message, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """
                cursor.execute(sql, (name, email, phone, college, course, year, internship_type, technology, full_message, 'Under Review'))
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
                'resume_url': resume_url,
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
            SELECT * FROM internship_applications
            WHERE email = %s OR phone = %s OR application_no = %s OR application_no LIKE %s OR name LIKE %s
            ORDER BY id DESC
            """
            cursor.execute(sql, (query, query, query, search_pattern, search_pattern))
        else:
            sql = """
            SELECT * FROM internship_applications
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
                    'name': item.get('name'),
                    'email': item.get('email'),
                    'phone': item.get('phone'),
                    'college': item.get('college'),
                    'course': item.get('course'),
                    'year': item.get('year'),
                    'internship_type': item.get('internship_type'),
                    'technology': item.get('technology'),
                    'message': item.get('message') or '',
                    'resume_url': item.get('resume_url'),
                    'status': status,
                    'notes': item.get('notes') or '',
                    'created_at': str(item.get('created_at', ''))
                })

        # Also lookup event registrations matching query
        event_registrations = []
        try:
            if db_type == "mysql":
                ev_sql = """
                SELECT id, registration_no, event_id, event_title, name, email, phone, 
                       college, year, status, notes, created_at
                FROM event_registrations
                WHERE email = %s OR phone = %s OR registration_no = %s OR registration_no LIKE %s OR name LIKE %s
                ORDER BY id DESC
                """
                cursor.execute(ev_sql, (query, query, query, search_pattern, search_pattern))
            else:
                ev_sql = """
                SELECT id, registration_no, event_id, event_title, name, email, phone, 
                       college, year, status, notes, created_at
                FROM event_registrations
                WHERE email = ? OR phone = ? OR registration_no = ? OR registration_no LIKE ? OR name LIKE ?
                ORDER BY id DESC
                """
                cursor.execute(ev_sql, (query, query, query, search_pattern, search_pattern))

            ev_rows = cursor.fetchall()
            if ev_rows:
                for er in ev_rows:
                    item = dict(er)
                    event_registrations.append({
                        'id': item['id'],
                        'registration_no': item.get('registration_no'),
                        'event_id': item.get('event_id'),
                        'event_title': item.get('event_title'),
                        'name': item.get('name'),
                        'email': item.get('email'),
                        'phone': item.get('phone'),
                        'college': item.get('college'),
                        'year': item.get('year'),
                        'status': item.get('status') or 'Confirmed',
                        'notes': item.get('notes') or '',
                        'created_at': str(item.get('created_at', ''))
                    })
        except Exception as ev_err:
            print(f"[Error querying event registrations in student lookup] {ev_err}")

        total_records = len(applications) + len(event_registrations)
        return jsonify({
            'success': True,
            'applications': applications,
            'event_registrations': event_registrations,
            'count': total_records
        })
    except Exception as e:
        print(f"[Error in student_lookup] {e}")
        return jsonify({'success': False, 'message': str(e), 'applications': [], 'event_registrations': []}), 500
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
