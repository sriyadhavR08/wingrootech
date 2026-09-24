import pymysql
import sqlite3
import os
from config import Config

def get_db_connection():
    """
    Connect to the dedicated standalone MySQL database: 'wingrootech_db'.
    Falls back to SQLite if MySQL is unreachable.
    """
    try:
        connection = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB,
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=2
        )
        return connection, "mysql"
    except Exception as e:
        print(f"[Database Warning] MySQL connection to '{Config.MYSQL_DB}' failed ({e}). Using local SQLite fallback.")
        db_path = os.path.join(os.path.dirname(__file__), "fallback_wingrootech.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        init_sqlite_tables(conn)
        return conn, "sqlite"

def init_mysql_tables_if_needed():
    """Ensure 'wingrootech_db' and all required tables exist in MySQL"""
    try:
        conn = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            connect_timeout=2
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{Config.MYSQL_DB}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            cursor.execute(f"USE `{Config.MYSQL_DB}`;")
            
            # 1. Contacts Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(30),
                subject VARCHAR(100) DEFAULT 'General Inquiry',
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            # 2. Internship Applications Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS internship_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(30) NOT NULL,
                college VARCHAR(150) NOT NULL,
                course VARCHAR(100) NOT NULL,
                year VARCHAR(50) NOT NULL,
                internship_type VARCHAR(100) NOT NULL,
                technology VARCHAR(100) NOT NULL,
                message TEXT,
                status VARCHAR(50) DEFAULT 'Under Review',
                application_no VARCHAR(50) DEFAULT NULL,
                notes TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            # 3. Projects Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                heading VARCHAR(255),
                tag VARCHAR(100) DEFAULT 'Featured Project',
                tags TEXT,
                category VARCHAR(100) NOT NULL,
                theme_color VARCHAR(50) DEFAULT '#4f46e5',
                image VARCHAR(255),
                project_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            
            # 4. Events Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                tagline VARCHAR(255),
                badge VARCHAR(100) DEFAULT 'Interactive',
                description TEXT NOT NULL,
                event_date VARCHAR(100) NOT NULL,
                location VARCHAR(150) NOT NULL,
                image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # Seed Projects
            cursor.execute("SELECT COUNT(*) FROM projects")
            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                INSERT INTO projects (title, description, category, project_url) VALUES 
                ('ZENTIME', 'Zentime is one of the projects developed by Wingroo Technologies, showcasing our approach toward building modern and user-focused digital solutions. The project focuses on combining functionality with a clean and intuitive experience, demonstrating how technology can be structured around the needs of its users.', 'Web Application', 'https://wingrootechnologies.com/'),
                ('IIE PLUS', 'IIE Plus is another project associated with Wingroo Technologies, demonstrating our focus on developing digital platforms that bring information, users and opportunities together. The project represents our approach to creating technology that is accessible, practical and designed around a clear purpose.', 'Digital Platform', 'https://wingrootechnologies.com/')
                """)

            # Seed Events
            cursor.execute("SELECT COUNT(*) FROM events")
            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                INSERT INTO events (title, description, event_date, location) VALUES
                ('Tech Talks', 'Interactive sessions covering emerging technologies, development trends, career opportunities and insights from the technology industry.', 'Monthly Series', 'Wingroo Innovation Hub & Online'),
                ('Technical Workshops', 'Hands-on learning sessions where participants can explore technologies, work with tools and understand concepts by actually applying them.', 'Bi-Weekly', 'Hybrid Mode (Coimbatore / Virtual)'),
                ('Hackathons', 'Collaborative challenges that encourage participants to turn ideas into working solutions while solving practical problems.', 'Quarterly Event', 'Partner University Campuses'),
                ('Career & Industry Sessions', 'Sessions designed to help students understand industry expectations, career paths, technical skills and the transition from student life to professional life.', 'Upcoming Session', 'Live Webinar & Campus Audits')
                """)

            conn.commit()
            print(f"[Database] Standalone project database '{Config.MYSQL_DB}' initialized successfully.")
        conn.close()
    except Exception as e:
        print(f"[Database Notice] MySQL setup skipped: {e}")

def init_sqlite_tables(conn):
    """Fallback local SQLite table provisioning"""
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS internship_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        college TEXT NOT NULL,
        course TEXT NOT NULL,
        year TEXT NOT NULL,
        internship_type TEXT NOT NULL,
        technology TEXT NOT NULL,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        image TEXT,
        project_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        event_date TEXT NOT NULL,
        location TEXT NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
