import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "wingroo-technologies-secret-key-2026")
    
    # MySQL Database Configuration (XAMPP default settings)
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
    
    # Standalone root database for this project (shows at root level in phpMyAdmin like django_react_db, foodexpress_db)
    MYSQL_DB = os.getenv("MYSQL_DB", "wingrootech_db")
    
    # Frontend Origin for CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
