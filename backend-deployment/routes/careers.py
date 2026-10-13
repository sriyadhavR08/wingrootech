from flask import Blueprint, request, jsonify
from database import get_db_connection

careers_bp = Blueprint('careers', __name__)

@careers_bp.route('/api/careers/apply', methods=['POST'])
@careers_bp.route('/api/jobs/apply', methods=['POST'])
def apply_job():
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    experience_level = data.get('experience_level', 'Fresher').strip()
    technologies = data.get('technologies', [])
    if isinstance(technologies, list):
        technologies_str = ", ".join(technologies)
    else:
        technologies_str = str(technologies).strip()

    resume_url = data.get('resume_url', '').strip()
    portfolio_url = data.get('portfolio_url', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not phone:
        return jsonify({
            'success': False,
            'message': 'Please provide your Full Name, Email Address, and Phone Number.'
        }), 400

    if not resume_url:
        return jsonify({
            'success': False,
            'message': 'Please upload your Resume / CV to submit a job application.'
        }), 400

    if not technologies_str:
        return jsonify({
            'success': False,
            'message': 'Please select at least one technology or domain.'
        }), 400

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            sql = """
            INSERT INTO job_applications 
            (application_no, name, email, phone, experience_level, technologies, resume_url, portfolio_url, message, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, ("PENDING", name, email, phone, experience_level, technologies_str, resume_url, portfolio_url, message, 'Under Review'))
            new_id = cursor.lastrowid
            app_no = f"WINGROO-JOB-{new_id:04d}"
            cursor.execute("UPDATE job_applications SET application_no = %s WHERE id = %s", (app_no, new_id))
        else:
            sql = """
            INSERT INTO job_applications 
            (application_no, name, email, phone, experience_level, technologies, resume_url, portfolio_url, message, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(sql, ("PENDING", name, email, phone, experience_level, technologies_str, resume_url, portfolio_url, message, 'Under Review'))
            new_id = cursor.lastrowid
            app_no = f"WINGROO-JOB-{new_id:04d}"
            cursor.execute("UPDATE job_applications SET application_no = ? WHERE id = ?", (app_no, new_id))

        conn.commit()
        return jsonify({
            'success': True,
            'message': 'Your job application has been submitted successfully! Our talent acquisition team will review your profile.',
            'application_no': app_no,
            'application_id': new_id
        }), 201
    except Exception as e:
        print(f"[Error saving job application] {e}")
        return jsonify({
            'success': False,
            'message': f'Failed to submit job application: {str(e)}'
        }), 500
    finally:
        conn.close()

@careers_bp.route('/api/careers/applications', methods=['GET'])
def list_job_applications():
    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM job_applications ORDER BY id DESC")
        rows = cursor.fetchall()
        apps = [dict(r) for r in rows] if rows else []
        return jsonify({'success': True, 'applications': apps, 'total': len(apps)})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e), 'applications': []}), 500
    finally:
        conn.close()
