import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import init_mysql_tables_if_needed

# Import Route Blueprints
from routes.contact import contact_bp
from routes.internship import internship_bp
from routes.projects import projects_bp
from routes.events import events_bp
from routes.admin import admin_bp
from routes.upload import upload_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend development and production
    CORS(app, resources={
        r"/api/*": {"origins": "*"},
        r"/uploads/*": {"origins": "*"}
    }, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

    # Register Blueprints
    app.register_blueprint(contact_bp)
    app.register_blueprint(internship_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(upload_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Wingroo Technologies Backend API',
            'version': '1.0.0'
        })

    # Initialize tables and print banner on startup once (in active worker)
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.config.get('DEBUG', True):
        with app.app_context():
            init_mysql_tables_if_needed()
        
        port = int(os.getenv("PORT", 5000))
        print(f"=====================================================")
        print(f" Wingroo Technologies Flask API Server Started")
        print(f" URL: http://localhost:{port}")
        print(f" Endpoints:")
        print(f"   - POST http://localhost:{port}/api/contact")
        print(f"   - POST http://localhost:{port}/api/internship")
        print(f"   - GET  http://localhost:{port}/api/projects")
        print(f"   - GET  http://localhost:{port}/api/events")
        print(f"   - GET  http://localhost:{port}/api/health")
        print(f"=====================================================")

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
