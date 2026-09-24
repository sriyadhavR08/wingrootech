import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'}
VIDEO_EXTENSIONS = {'mp4', 'webm', 'mov', 'mkv', 'avi'}
ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS.union(VIDEO_EXTENSIONS)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected for uploading'}), 400

    if file and allowed_file(file.filename):
        original_name = secure_filename(file.filename)
        extension = original_name.rsplit('.', 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex[:10]}_{int(os.path.getmtime(UPLOAD_FOLDER) if os.path.exists(UPLOAD_FOLDER) else 0)}.{extension}"
        
        file_path = os.path.join(UPLOAD_FOLDER, unique_name)
        file.save(file_path)

        media_type = 'video' if extension in VIDEO_EXTENSIONS else 'image'
        # Serve via host url or relative path
        host_url = request.host_url.rstrip('/')
        file_url = f"{host_url}/uploads/{unique_name}"

        return jsonify({
            'success': True,
            'url': file_url,
            'filename': unique_name,
            'media_type': media_type,
            'message': f'{media_type.capitalize()} uploaded successfully!'
        }), 201

    return jsonify({
        'success': False, 
        'message': f'Invalid file format. Allowed formats: {", ".join(sorted(ALLOWED_EXTENSIONS))}'
    }), 400

@upload_bp.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
