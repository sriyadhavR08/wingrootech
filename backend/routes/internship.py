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

        # Also lookup project inquiries / client requests matching query
        project_requests = []
        try:
            req_id_match = None
            if query.upper().startswith('WINGROO-PRJ-'):
                num_part = query.upper().replace('WINGROO-PRJ-', '').strip()
                if num_part.isdigit():
                    req_id_match = int(num_part)

            if db_type == "mysql":
                if req_id_match is not None:
                    prj_sql = """
                    SELECT id, name, email, phone, subject, message, 
                           COALESCE(status, 'Under Review') as status, 
                           COALESCE(notes, '') as notes, created_at
                    FROM contacts
                    WHERE id = %s OR email = %s OR phone = %s OR name LIKE %s OR subject LIKE %s
                    ORDER BY id DESC
                    """
                    cursor.execute(prj_sql, (req_id_match, query, query, search_pattern, search_pattern))
                else:
                    prj_sql = """
                    SELECT id, name, email, phone, subject, message, 
                           COALESCE(status, 'Under Review') as status, 
                           COALESCE(notes, '') as notes, created_at
                    FROM contacts
                    WHERE email = %s OR phone = %s OR name LIKE %s OR subject LIKE %s
                    ORDER BY id DESC
                    """
                    cursor.execute(prj_sql, (query, query, search_pattern, search_pattern))
            else:
                if req_id_match is not None:
                    prj_sql = """
                    SELECT id, name, email, phone, subject, message, 
                           COALESCE(status, 'Under Review') as status, 
                           COALESCE(notes, '') as notes, created_at
                    FROM contacts
                    WHERE id = ? OR email = ? OR phone = ? OR name LIKE ? OR subject LIKE ?
                    ORDER BY id DESC
                    """
                    cursor.execute(prj_sql, (req_id_match, query, query, search_pattern, search_pattern))
                else:
                    prj_sql = """
                    SELECT id, name, email, phone, subject, message, 
                           COALESCE(status, 'Under Review') as status, 
                           COALESCE(notes, '') as notes, created_at
                    FROM contacts
                    WHERE email = ? OR phone = ? OR name LIKE ? OR subject LIKE ?
                    ORDER BY id DESC
                    """
                    cursor.execute(prj_sql, (query, query, search_pattern, search_pattern))

            prj_rows = cursor.fetchall()
            if prj_rows:
                for pr in prj_rows:
                    item = dict(pr)
                    project_requests.append({
                        'id': item['id'],
                        'request_no': f"WINGROO-PRJ-{item['id']:04d}",
                        'name': item.get('name'),
                        'email': item.get('email'),
                        'phone': item.get('phone'),
                        'subject': item.get('subject') or 'Project Inquiry',
                        'message': item.get('message'),
                        'status': item.get('status') or 'Under Review',
                        'notes': item.get('notes') or '',
                        'created_at': str(item.get('created_at', ''))
                    })
        except Exception as prj_err:
            print(f"[Error querying project requests in student lookup] {prj_err}")

        total_records = len(applications) + len(event_registrations) + len(project_requests)
        return jsonify({
            'success': True,
            'applications': applications,
            'event_registrations': event_registrations,
            'project_requests': project_requests,
            'count': total_records
        })
    except Exception as e:
        print(f"[Error in student_lookup] {e}")
        return jsonify({'success': False, 'message': str(e), 'applications': [], 'event_registrations': [], 'project_requests': []}), 500
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


# ============================================================================
# College Internship Postings (Created & Managed by Admin)
# ============================================================================

@internship_bp.route('/api/college-internships', methods=['GET'])
def get_college_internships():
    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, domain, internship_type, duration, badge, mode, 
                   stipend_or_scholarship, poster_url, description, highlights, 
                   schedule_info, status, created_at 
            FROM college_internships 
            ORDER BY id DESC
        """)
        rows = cursor.fetchall()
        internships = []
        if rows:
            for r in rows:
                item = dict(r)
                internships.append({
                    'id': item['id'],
                    'title': item['title'],
                    'domain': item.get('domain') or 'Full Stack Development',
                    'internship_type': item.get('internship_type') or 'College Internship',
                    'duration': item.get('duration') or '15 – 20 Days',
                    'badge': item.get('badge') or 'Enrolling Now',
                    'mode': item.get('mode') or 'Hybrid (Coimbatore / Virtual)',
                    'stipend_or_scholarship': item.get('stipend_or_scholarship') or 'Up to 100% Fee Waiver',
                    'poster_url': item.get('poster_url') or '',
                    'description': item.get('description') or '',
                    'highlights': item.get('highlights') or '',
                    'schedule_info': item.get('schedule_info') or 'Mon – Fri (09:30 AM – 04:30 PM)',
                    'status': item.get('status') or 'Active',
                    'created_at': str(item.get('created_at', ''))
                })
        return jsonify({'success': True, 'internships': internships, 'count': len(internships)})
    except Exception as e:
        print(f"[Error fetching college internships] {e}")
        return jsonify({'success': False, 'message': str(e), 'internships': []}), 500
    finally:
        conn.close()


@internship_bp.route('/api/college-internships', methods=['POST', 'OPTIONS'])
def add_college_internship():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    domain = data.get('domain', 'Full Stack Development').strip()
    internship_type = data.get('internship_type', 'College Internship').strip()
    duration = data.get('duration', '15 – 20 Days').strip()
    badge = data.get('badge', 'Enrolling Now').strip()
    mode = data.get('mode', 'Hybrid (Coimbatore / Virtual)').strip()
    stipend_or_scholarship = data.get('stipend_or_scholarship', 'Up to 100% Fee Waiver').strip()
    poster_url = data.get('poster_url', '').strip()
    description = data.get('description', '').strip()
    highlights = data.get('highlights', '').strip()
    schedule_info = data.get('schedule_info', 'Mon – Fri (09:30 AM – 04:30 PM)').strip()
    status = data.get('status', 'Active').strip()

    if not title or not description:
        return jsonify({'success': False, 'message': 'Please provide an Internship Title and Description.'}), 400

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            sql = """
            INSERT INTO college_internships 
            (title, domain, internship_type, duration, badge, mode, stipend_or_scholarship, poster_url, description, highlights, schedule_info, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (title, domain, internship_type, duration, badge, mode, stipend_or_scholarship, poster_url, description, highlights, schedule_info, status))
        else:
            sql = """
            INSERT INTO college_internships 
            (title, domain, internship_type, duration, badge, mode, stipend_or_scholarship, poster_url, description, highlights, schedule_info, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(sql, (title, domain, internship_type, duration, badge, mode, stipend_or_scholarship, poster_url, description, highlights, schedule_info, status))
        
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({
            'success': True,
            'message': 'College internship cohort posted successfully!',
            'internship_id': new_id,
            'internship': {
                'id': new_id,
                'title': title,
                'domain': domain,
                'internship_type': internship_type,
                'duration': duration,
                'badge': badge,
                'mode': mode,
                'stipend_or_scholarship': stipend_or_scholarship,
                'poster_url': poster_url,
                'description': description,
                'highlights': highlights,
                'schedule_info': schedule_info,
                'status': status
            }
        }), 201
    except Exception as e:
        print(f"[Error posting college internship] {e}")
        return jsonify({'success': False, 'message': f'Failed to post college internship: {str(e)}'}), 500
    finally:
        conn.close()


@internship_bp.route('/api/college-internships/<int:item_id>', methods=['DELETE', 'OPTIONS'])
def delete_college_internship(item_id):
    if request.method == 'OPTIONS':
        return '', 200

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            cursor.execute("DELETE FROM college_internships WHERE id = %s", (item_id,))
        else:
            cursor.execute("DELETE FROM college_internships WHERE id = ?", (item_id,))
        conn.commit()
        return jsonify({'success': True, 'message': f'College internship cohort #{item_id} deleted successfully.'})
    except Exception as e:
        print(f"[Error deleting college internship] {e}")
        return jsonify({'success': False, 'message': f'Failed to delete college internship: {str(e)}'}), 500
    finally:
        conn.close()


@internship_bp.route('/api/college-internships/<int:item_id>/status', methods=['PUT', 'OPTIONS'])
def toggle_college_internship_status(item_id):
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    new_status = data.get('status', 'Active').strip()

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            cursor.execute("UPDATE college_internships SET status = %s WHERE id = %s", (new_status, item_id))
        else:
            cursor.execute("UPDATE college_internships SET status = ? WHERE id = ?", (new_status, item_id))
        conn.commit()
        return jsonify({'success': True, 'message': f'College internship cohort #{item_id} status updated to {new_status}.', 'status': new_status})
    except Exception as e:
        print(f"[Error updating college internship status] {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        conn.close()

