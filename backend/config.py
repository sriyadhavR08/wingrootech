import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "wingroo-technologies-secret-key-2026")
    
    # MySQL Database Configuration (XAMPP default settings)
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_DB = os.getenv("MYSQL_DB", "wingrootech_db")
    
    # SQLAlchemy database connection
    # Connect to MySQL wingrootech_db (supporting empty password on XAMPP)
    if os.getenv("DATABASE_URL"):
        SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    elif MYSQL_USER and MYSQL_DB:
        pw_part = f":{MYSQL_PASSWORD}" if MYSQL_PASSWORD else ""
        SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}{pw_part}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    else:
        instance_dir = BASE_DIR / "instance"
        instance_dir.mkdir(parents=True, exist_ok=True)
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{instance_dir / 'certificate.db'}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Media folder for uploads & generated certificate PDFs
    MEDIA_FOLDER = os.getenv("MEDIA_FOLDER") or str(BASE_DIR / "uploads")
    ASSETS_FOLDER = os.getenv("ASSETS_FOLDER") or str(BASE_DIR / "assets")

    FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
    JWT_EXPIRATION_HOURS = 24
    
    # Frontend Origin for CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
