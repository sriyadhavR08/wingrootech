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
            connect_timeout=10
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
    """Ensure 'wingrootech_db' and all required tables exist in MySQL (AWS RDS / Local)"""
    try:
        conn = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            connect_timeout=10
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
                resume_url VARCHAR(255) DEFAULT NULL,
                status VARCHAR(50) DEFAULT 'Under Review',
                application_no VARCHAR(50) DEFAULT NULL,
                notes TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            try:
                cursor.execute("ALTER TABLE internship_applications ADD COLUMN resume_url VARCHAR(255) DEFAULT NULL")
            except Exception:
                pass
            
            # 3. Projects Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                heading VARCHAR(255),
                tag VARCHAR(100) DEFAULT 'Featured Project',
                tags TEXT,
                description TEXT,
                category VARCHAR(100) NOT NULL,
                theme_color VARCHAR(50) DEFAULT '#4f46e5',
                image VARCHAR(255),
                video_url VARCHAR(255),
                media_type VARCHAR(50) DEFAULT 'image',
                project_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            for col_sql in [
                "ALTER TABLE projects ADD COLUMN description TEXT",
                "ALTER TABLE projects ADD COLUMN video_url VARCHAR(255)",
                "ALTER TABLE projects ADD COLUMN media_type VARCHAR(50) DEFAULT 'image'"
            ]:
                try:
                    cursor.execute(col_sql)
                except Exception:
                    pass
            
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
                poster_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # 5. Event Registrations Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS event_registrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                registration_no VARCHAR(50) NOT NULL,
                event_id INT DEFAULT NULL,
                event_title VARCHAR(150) NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(30) NOT NULL,
                college VARCHAR(150) NOT NULL,
                year VARCHAR(50) DEFAULT NULL,
                status VARCHAR(50) DEFAULT 'Confirmed',
                notes TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # 6. Job Applications Table (Careers / Join Our Team)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS job_applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                application_no VARCHAR(50) NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                phone VARCHAR(30) NOT NULL,
                experience_level VARCHAR(50) DEFAULT 'Fresher',
                technologies TEXT NOT NULL,
                resume_url VARCHAR(255) DEFAULT NULL,
                portfolio_url VARCHAR(255) DEFAULT NULL,
                message TEXT,
                status VARCHAR(50) DEFAULT 'Under Review',
                notes TEXT DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # Seed Projects (All 5 Featured & Candidates' Projects)
            cursor.execute("SELECT COUNT(*) FROM projects")
            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                INSERT INTO projects (title, heading, tag, tags, description, category, theme_color, project_url, image, video_url, media_type) VALUES 
                ('ZENTIME', 'Modern and user-focused digital solution.', 'Featured Project', 'React, Node.js, Web Platform', 'Zentime is one of the projects developed by Wingroo Technologies, showcasing our approach toward building modern and user-focused digital solutions. The project focuses on combining functionality with a clean and intuitive experience, demonstrating how technology can be structured around the needs of its users.', 'Web Application', '#4f46e5', 'https://wingrootechnologies.com/', '/zentime-preview.jpg', '', 'image'),
                ('IIE PLUS', 'Educational & career advancement ecosystem.', 'Featured Project', 'React, Flask, MySQL, Cloud', 'IIE Plus is another project associated with Wingroo Technologies, demonstrating our focus on developing digital platforms that bring information, users and opportunities together. The project represents our approach to creating technology that is accessible, practical and designed around a clear purpose.', 'Digital Platform', '#06b6d4', 'https://wingrootechnologies.com/', '/iie-plus-preview.jpg', '', 'image'),
                ('TOURISTS GUARD', 'Intelligent Tourist Safety & Travel Assistance Platform.', "Our Candidates' Work", 'Real-time GPS SOS, Safety Heatmaps, Multi-lingual Guide, Verified Hotspots, Cloud Alerts', 'Tourists Guard is a smart travel security and assistance platform developed by Wingroo Technologies. It provides real-time emergency alerts, geofenced tourist zone guidance, verified local services, multi-lingual SOS assistance, and live safety monitoring to ensure secure travel experiences worldwide.', 'Web & Mobile App', '#f59e0b', '', '/tourists-guard-preview.jpg', '', 'image'),
                ('SMART AI BOT', 'Next-Gen Conversational AI & Automated Enterprise Assistant.', "Our Candidates' Work", 'Conversational AI, Natural Language Processing, 24/7 Automation, Multi-Channel, Workflow Integration', 'Smart AI Bot is an intelligent conversational agent engineered by Wingroo Technologies. Built with advanced NLP and real-time knowledge retrieval, it automates multi-channel customer inquiries, streamlines internal enterprise workflows, and delivers personalized, context-aware user interactions 24/7.', 'AI Platform', '#8b5cf6', '', '/smart-ai-bot-preview.jpg', '', 'image'),
                ('VIRTUEHIRE', 'AI-Powered Talent Acquisition & Recruitment Pipeline.', "Our Candidates' Work", 'AI Candidate Screening, Resume Parsing, Automated Interviews, Talent Analytics, HR Pipeline', 'VirtueHire is an intelligent hiring and talent assessment platform developed by Wingroo Technologies. It transforms the recruitment lifecycle with AI-driven resume parsing, automated candidate screening, interactive interview scheduling, and skill-matching analytics to help organizations hire top talent efficiently.', 'HR Tech / SaaS', '#10b981', '', '/virtuehire-preview.jpg', '', 'image')
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

            # 7. College Internship Postings Table (Created by Admin)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS college_internships (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                domain VARCHAR(100) NOT NULL,
                internship_type VARCHAR(100) DEFAULT 'College Internship',
                duration VARCHAR(100) DEFAULT '15 – 20 Days',
                badge VARCHAR(100) DEFAULT 'Enrolling Now',
                mode VARCHAR(100) DEFAULT 'Hybrid (Coimbatore / Virtual)',
                stipend_or_scholarship VARCHAR(150) DEFAULT 'Up to 100% Fee Waiver',
                poster_url VARCHAR(255) DEFAULT '',
                description TEXT NOT NULL,
                highlights TEXT,
                schedule_info VARCHAR(255) DEFAULT 'Mon – Fri (09:30 AM – 04:30 PM)',
                status VARCHAR(50) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)

            # Seed College Internships if empty
            cursor.execute("SELECT COUNT(*) FROM college_internships")
            if cursor.fetchone()[0] == 0:
                cursor.execute("""
                INSERT INTO college_internships 
                (title, domain, internship_type, duration, badge, mode, stipend_or_scholarship, poster_url, description, highlights, schedule_info, status) 
                VALUES 
                ('Full Stack Web & Cloud Cohort (15–20 Days)', 'Full Stack Development', 'College Internship', '15 – 20 Days', 'Up to 100% Scholarship', 'Hybrid (Coimbatore / Virtual)', 'Up to 100% Fee Waiver', '/images/wingroo-internship-team.jpg', 'Master client-server architecture, modern React UI, RESTful backends, database models, and production cloud deployment with daily hands-on industry labs.', 'React 19 Component Architecture, RESTful Flask/Express APIs, MySQL Relational Database, Cloud Deployment on Render/Vercel, Verified Certificate & GitHub Proof', 'Mon – Fri (09:30 AM – 04:30 PM)', 'Active'),
                ('Applied AI & Machine Learning Fellowship', 'AI & Machine Learning', 'College Internship', '15 – 20 Days', 'Fast-Track Cohort', 'Hybrid (Coimbatore / Virtual)', 'Merit Grants + Capstone Project', '/smart-ai-bot-preview.jpg', 'Hands-on data preprocessing, exploratory analysis, supervised & unsupervised machine learning models, neural networks, and live API deployment.', 'NumPy & Pandas Data Wrangling, Scikit-Learn Classifiers & Regression, Deep Learning Intro, REST API Model Serving, Capstone Defense & Viva', 'Mon – Fri (09:30 AM – 04:30 PM)', 'Active'),
                ('Python Backend & Automation Systems', 'Python Development', 'College Internship', '15 – 20 Days', 'Enrolling Now', 'Hybrid (Coimbatore / Virtual)', 'Up to 100% Fee Waiver', '/tourists-guard-preview.jpg', 'Designed for backend engineering, REST microservices, database ORMs, automation tools, and production API architectures with Python.', 'Advanced Python 3 OOP, Flask Application Blueprints, Relational DB with MySQL, JWT Authentication & Security, WSGI & Production Tuning', 'Mon – Fri (09:30 AM – 04:30 PM)', 'Active')
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
        resume_url TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    try:
        cursor.execute("ALTER TABLE internship_applications ADD COLUMN resume_url TEXT DEFAULT NULL")
    except Exception:
        pass
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
        poster_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS event_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registration_no TEXT NOT NULL,
        event_id INTEGER,
        event_title TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        college TEXT NOT NULL,
        year TEXT,
        status TEXT DEFAULT 'Confirmed',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS job_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_no TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        experience_level TEXT DEFAULT 'Fresher',
        technologies TEXT NOT NULL,
        resume_url TEXT,
        portfolio_url TEXT,
        message TEXT,
        status TEXT DEFAULT 'Under Review',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS college_internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        domain TEXT NOT NULL,
        internship_type TEXT DEFAULT 'College Internship',
        duration TEXT DEFAULT '15 – 20 Days',
        badge TEXT DEFAULT 'Enrolling Now',
        mode TEXT DEFAULT 'Hybrid (Coimbatore / Virtual)',
        stipend_or_scholarship TEXT DEFAULT 'Up to 100% Fee Waiver',
        poster_url TEXT DEFAULT '',
        description TEXT NOT NULL,
        highlights TEXT,
        schedule_info TEXT DEFAULT 'Mon – Fri (09:30 AM – 04:30 PM)',
        status TEXT DEFAULT 'Active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("SELECT COUNT(*) FROM college_internships")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO college_internships 
        (title, domain, internship_type, duration, badge, mode, stipend_or_scholarship, poster_url, description, highlights, schedule_info, status) 
        VALUES 
        ('Full Stack Web & Cloud Cohort (15–20 Days)', 'Full Stack Development', 'College Internship', '15 – 20 Days', 'Up to 100% Scholarship', 'Hybrid (Coimbatore / Virtual)', 'Up to 100% Fee Waiver', '/images/wingroo-internship-team.jpg', 'Master client-server architecture, modern React UI, RESTful backends, database models, and production cloud deployment with daily hands-on industry labs.', 'React 19 Component Architecture, RESTful Flask/Express APIs, MySQL Relational Database, Cloud Deployment on Render/Vercel, Verified Certificate & GitHub Proof', 'Mon – Fri (09:30 AM – 04:30 PM)', 'Active'),
        ('Applied AI & Machine Learning Fellowship', 'AI & Machine Learning', 'College Internship', '15 – 20 Days', 'Fast-Track Cohort', 'Hybrid (Coimbatore / Virtual)', 'Merit Grants + Capstone Project', '/smart-ai-bot-preview.jpg', 'Hands-on data preprocessing, exploratory analysis, supervised & unsupervised machine learning models, neural networks, and live API deployment.', 'NumPy & Pandas Data Wrangling, Scikit-Learn Classifiers & Regression, Deep Learning Intro, REST API Model Serving, Capstone Defense & Viva', 'Mon – Fri (09:30 AM – 04:30 PM)', 'Active'),
        ('Python Backend & Automation Systems', 'Python Development', 'College Internship', '15 – 20 Days', 'Enrolling Now', 'Hybrid (Coimbatore / Virtual)', 'Up to 100% Fee Waiver', '/tourists-guard-preview.jpg', 'Designed for backend engineering, REST microservices, database ORMs, automation tools, and production API architectures with Python.', 'Advanced Python 3 OOP, Flask Application Blueprints, Relational DB with MySQL, JWT Authentication & Security, WSGI & Production Tuning', 'Mon – Fri (09:30 AM – 04:30 PM)', 'Active')
        """)

    conn.commit()
