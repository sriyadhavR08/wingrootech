from flask import Blueprint, request, jsonify
from database import get_db_connection

events_bp = Blueprint('events', __name__)

@events_bp.route('/api/events', methods=['GET'])
def get_events():
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, tagline, badge, description, event_date, location, 
                   COALESCE(poster_url, image) AS poster_url
            FROM events ORDER BY id ASC
        """)
        rows = cursor.fetchall()
        conn.close()

        events = []
        if rows:
            for row in rows:
                item = dict(row)
                if not item.get("tagline"):
                    item["tagline"] = "Explore New Horizons"
                if not item.get("badge"):
                    item["badge"] = "Special Event"

                events.append({
                    "id": item["id"],
                    "title": item["title"],
                    "tagline": item["tagline"],
                    "badge": item["badge"],
                    "description": item["description"],
                    "event_date": item["event_date"],
                    "location": item["location"],
                    "poster_url": item.get("poster_url") or ""
                })
        return jsonify({'success': True, 'events': events})
    except Exception as e:
        print(f"[Error fetching events] {e}")
        return jsonify({'success': False, 'message': str(e), 'events': []}), 500

@events_bp.route('/api/events', methods=['POST'])
def add_event():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    tagline = data.get('tagline', '').strip() or 'Ideas Worth Talking About.'
    badge = data.get('badge', 'Special Event').strip()
    description = data.get('description', '').strip()
    event_date = data.get('event_date', 'Upcoming').strip()
    location = data.get('location', 'Wingroo Innovation Hub').strip()
    poster_url = data.get('poster_url', '').strip() or data.get('image', '').strip()

    if not title or not description:
        return jsonify({'success': False, 'message': 'Event title and description are required.'}), 400

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            sql = """
            INSERT INTO events (title, tagline, badge, description, event_date, location, poster_url, image)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (title, tagline, badge, description, event_date, location, poster_url, poster_url))
        else:
            sql = """
            INSERT INTO events (title, tagline, badge, description, event_date, location, poster_url, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(sql, (title, tagline, badge, description, event_date, location, poster_url, poster_url))

        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({
            'success': True,
            'message': 'New event published successfully!',
            'event_id': new_id
        }), 201
    except Exception as e:
        print(f"[Error posting event] {e}")
        return jsonify({'success': False, 'message': f'Failed to post event: {str(e)}'}), 500
    finally:
        conn.close()

@events_bp.route('/api/events/register', methods=['POST', 'OPTIONS'])
def register_event():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    college = data.get('college', '').strip()
    year = data.get('year', '').strip()
    event_id = data.get('event_id')
    event_title = data.get('event_title', 'Tech Talks').strip()
    notes = data.get('notes', '').strip()

    if not name or not email or not phone or not college:
        return jsonify({
            'success': False,
            'message': 'Please provide your Full Name, Email, Phone, and College / Organization.'
        }), 400

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        # Generate clean Registration No: WINGROO-EVT-XXXX
        import random
        from datetime import datetime
        rand_code = random.randint(1000, 9999)
        month_str = datetime.now().strftime('%m%y')
        reg_no = f"WINGROO-EVT-{month_str}-{rand_code}"

        if db_type == "mysql":
            sql = """
            INSERT INTO event_registrations 
            (registration_no, event_id, event_title, name, email, phone, college, year, status, notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (reg_no, event_id, event_title, name, email, phone, college, year, 'Confirmed', notes))
            new_id = cursor.lastrowid
        else:
            sql = """
            INSERT INTO event_registrations 
            (registration_no, event_id, event_title, name, email, phone, college, year, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(sql, (reg_no, event_id, event_title, name, email, phone, college, year, 'Confirmed', notes))
            new_id = cursor.lastrowid

        conn.commit()
        return jsonify({
            'success': True,
            'message': f'Registration confirmed for {event_title}!',
            'registration_no': reg_no,
            'registration_id': new_id,
            'event_title': event_title,
            'status': 'Confirmed',
            'details': {
                'id': new_id,
                'registration_no': reg_no,
                'name': name,
                'email': email,
                'phone': phone,
                'college': college,
                'year': year,
                'event_title': event_title,
                'status': 'Confirmed'
            }
        }), 201
    except Exception as e:
        print(f"[Error saving event registration] {e}")
        return jsonify({'success': False, 'message': f'Failed to register: {str(e)}'}), 500
    finally:
        conn.close()

@events_bp.route('/api/events/<int:event_id>', methods=['DELETE', 'OPTIONS'])
def delete_event(event_id):
    if request.method == 'OPTIONS':
        return '', 200

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            cursor.execute("DELETE FROM events WHERE id = %s", (event_id,))
        else:
            cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
        conn.commit()
        return jsonify({'success': True, 'message': f'Event #{event_id} deleted successfully.'})
    except Exception as e:
        print(f"[Error deleting event] {e}")
        return jsonify({'success': False, 'message': f'Failed to delete event: {str(e)}'}), 500
    finally:
        conn.close()


