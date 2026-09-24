from flask import Blueprint, request, jsonify
from database import get_db_connection

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/api/projects', methods=['GET'])
def get_projects():
    try:
        conn, db_type = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, title, heading, tag, tags, description, category, theme_color, image, video_url, media_type, project_url 
            FROM projects ORDER BY id ASC
        """)
        rows = cursor.fetchall()
        conn.close()

        projects = []
        if rows:
            for row in rows:
                item = dict(row)
                raw_tags = item.get("tags")
                if isinstance(raw_tags, str):
                    tags_list = [t.strip() for t in raw_tags.split(",") if t.strip()]
                elif isinstance(raw_tags, list):
                    tags_list = raw_tags
                else:
                    tags_list = ["Digital Innovation", "Modern Solution"]

                projects.append({
                    "id": item["id"],
                    "title": item["title"],
                    "heading": item.get("heading") or item["title"],
                    "tag": item.get("tag") or item.get("category") or "Featured Project",
                    "description": item["description"],
                    "category": item.get("category") or "Software Solution",
                    "tags": tags_list,
                    "themeColor": item.get("theme_color") or "#4f46e5",
                    "image": item.get("image") or "",
                    "videoUrl": item.get("video_url") or "",
                    "mediaType": item.get("media_type") or "image",
                    "demoUrl": item.get("project_url") or "https://wingrootechnologies.com/"
                })
        return jsonify({'success': True, 'projects': projects})
    except Exception as e:
        print(f"[Error fetching projects] {e}")
        return jsonify({'success': False, 'message': str(e), 'projects': []}), 500

@projects_bp.route('/api/projects', methods=['POST'])
def add_project():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    category = data.get('category', 'Web Application').strip()
    heading = data.get('heading', title).strip()
    tag = data.get('tag', 'Featured Project').strip()
    theme_color = data.get('themeColor', '#4f46e5').strip()
    project_url = data.get('demoUrl', 'https://wingrootechnologies.com/').strip()
    image = data.get('image', '').strip()
    video_url = data.get('videoUrl', '').strip()
    media_type = data.get('mediaType', 'image').strip()
    
    tags_val = data.get('tags', '')
    if isinstance(tags_val, list):
        tags_str = ", ".join(tags_val)
    else:
        tags_str = str(tags_val)

    if not title or not description:
        return jsonify({'success': False, 'message': 'Title and Description are required.'}), 400

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            sql = """
            INSERT INTO projects (title, heading, tag, tags, description, category, theme_color, project_url, image, video_url, media_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (title, heading, tag, tags_str, description, category, theme_color, project_url, image, video_url, media_type))
        else:
            sql = """
            INSERT INTO projects (title, heading, tag, tags, description, category, theme_color, project_url, image, video_url, media_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(sql, (title, heading, tag, tags_str, description, category, theme_color, project_url, image, video_url, media_type))
        
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({
            'success': True, 
            'message': 'Project posted successfully to Portfolio!',
            'project_id': new_id
        }), 201
    except Exception as e:
        print(f"[Error posting project] {e}")
        return jsonify({'success': False, 'message': f'Failed to post project: {str(e)}'}), 500
    finally:
        conn.close()

@projects_bp.route('/api/projects/<int:project_id>', methods=['DELETE', 'OPTIONS'])
def delete_project(project_id):
    if request.method == 'OPTIONS':
        return '', 200

    conn, db_type = get_db_connection()
    try:
        cursor = conn.cursor()
        if db_type == "mysql":
            cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
        else:
            cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        conn.commit()
        return jsonify({'success': True, 'message': f'Project #{project_id} deleted successfully.'})
    except Exception as e:
        print(f"[Error deleting project] {e}")
        return jsonify({'success': False, 'message': f'Failed to delete project: {str(e)}'}), 500
    finally:
        conn.close()
