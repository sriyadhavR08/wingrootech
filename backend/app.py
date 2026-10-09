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
from routes.careers import careers_bp
from routes.auth import auth_bp
from routes.student import student_bp
from routes.cert_admin import cert_admin_bp
from routes.public import public_bp
from models import db, User

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize SQLAlchemy database
    db.init_app(app)

    # Ensure uploads and media folders exist
    os.makedirs(app.config.get("MEDIA_FOLDER", "uploads"), exist_ok=True)
    os.makedirs(app.config.get("ASSETS_FOLDER", "assets"), exist_ok=True)

    # Enable CORS for frontend development and production
    cors_origins = app.config.get('CORS_ORIGINS', '*')
    if cors_origins != '*' and ',' in cors_origins:
        cors_origins = [o.strip() for o in cors_origins.split(',') if o.strip()]

    CORS(app, resources={
        r"/api/*": {"origins": cors_origins},
        r"/uploads/*": {"origins": cors_origins},
        r"/media/*": {"origins": cors_origins}
    }, methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])

    # Register Blueprints
    app.register_blueprint(contact_bp)
    app.register_blueprint(internship_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(events_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(careers_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(cert_admin_bp)
    app.register_blueprint(public_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Wingroo Technologies Backend API',
            'version': '1.0.0'
        })

    # Initialize tables and seed default admin
    with app.app_context():
        try:
            init_mysql_tables_if_needed()
        except Exception as e:
            print(f"[Database warning] init_mysql_tables_if_needed: {e}")
        try:
            db.create_all()
            with db.engine.connect() as conn:
                for col_def in ["active_session_id VARCHAR(100) DEFAULT NULL", "active_session_time DATETIME DEFAULT NULL"]:
                    try:
                        conn.execute(db.text(f"ALTER TABLE accounts_user ADD COLUMN {col_def}"))
                        conn.commit()
                    except Exception:
                        pass
            # Ensure default administrator exists
            admin_user = User.query.filter_by(role='ADMIN').first()
            if not admin_user:
                default_admin = User(
                    email='admin@wingroo.com',
                    full_name='Wingroo Administrator',
                    role='ADMIN',
                    is_staff=True,
                    is_superuser=True
                )
                default_admin.set_password('Admin@12345')
                db.session.add(default_admin)
                db.session.commit()
                print("Default admin initialized: admin@wingroo.com / Admin@12345")
        except Exception as e:
            print(f"[SQLAlchemy error] create_all/seed: {e}")

    return app

app = create_app()
application = app  # Standard WSGI entry point for AWS Elastic Beanstalk

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
