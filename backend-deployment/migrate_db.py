import pymysql
import sqlite3
import os

def migrate():
    # Connect to MySQL
    mysql_conn = pymysql.connect(host='localhost', user='root', password='', autocommit=True)
    
    with mysql_conn.cursor() as cur:
        # Check source and target
        cur.execute("SHOW DATABASES LIKE 'internship_certificate_db';")
        if not cur.fetchone():
            print("Error: internship_certificate_db not found in MySQL!")
            return

        cur.execute("SHOW DATABASES LIKE 'wingrootech_db';")
        if not cur.fetchone():
            cur.execute("CREATE DATABASE wingrootech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print("Created database wingrootech_db")

        # Disable foreign key checks
        cur.execute("SET FOREIGN_KEY_CHECKS = 0;")

        # Get all tables from internship_certificate_db
        cur.execute("SHOW TABLES FROM internship_certificate_db;")
        source_tables = [row[0] for row in cur.fetchall()]
        print(f"Found {len(source_tables)} tables in internship_certificate_db: {source_tables}")

        for tbl in source_tables:
            print(f"\n--- Migrating {tbl} ---")
            # Drop in target if exists to get clean copy
            cur.execute(f"DROP TABLE IF EXISTS wingrootech_db.`{tbl}`;")
            # Create table like source
            cur.execute(f"CREATE TABLE wingrootech_db.`{tbl}` LIKE internship_certificate_db.`{tbl}`;")
            # Copy data
            cur.execute(f"INSERT INTO wingrootech_db.`{tbl}` SELECT * FROM internship_certificate_db.`{tbl}`;")
            
            # Count rows
            cur.execute(f"SELECT COUNT(*) FROM wingrootech_db.`{tbl}`;")
            count = cur.fetchone()[0]
            print(f"Copied {count} rows into wingrootech_db.`{tbl}`")

        # Ensure active_session_id and active_session_time columns exist in accounts_user
        cur.execute("USE wingrootech_db;")
        cur.execute("DESCRIBE accounts_user;")
        user_cols = [row[0] for row in cur.fetchall()]
        
        if "active_session_id" not in user_cols:
            cur.execute("ALTER TABLE accounts_user ADD COLUMN active_session_id VARCHAR(100) NULL;")
            print("Added active_session_id to accounts_user")
            
        if "active_session_time" not in user_cols:
            cur.execute("ALTER TABLE accounts_user ADD COLUMN active_session_time DATETIME NULL;")
            print("Added active_session_time to accounts_user")

        # Re-enable foreign key checks
        cur.execute("SET FOREIGN_KEY_CHECKS = 1;")

    # Now check if SQLite has any extra users not present in MySQL
    sqlite_path = 'backend/instance/certificate.db'
    if os.path.exists(sqlite_path):
        print("\n--- Checking SQLite for any additional users ---")
        sq_conn = sqlite3.connect(sqlite_path)
        sq_cur = sq_conn.cursor()
        sq_cur.execute("SELECT id, email, password, full_name, role, is_active, is_staff, is_superuser, last_login, date_joined, created_at, updated_at FROM accounts_user")
        sq_users = sq_cur.fetchall()
        
        with mysql_conn.cursor() as cur:
            cur.execute("USE wingrootech_db;")
            cur.execute("SELECT email FROM accounts_user;")
            existing_emails = {r[0].lower() for r in cur.fetchall()}
            
            for u in sq_users:
                email = u[1]
                if email and email.lower() not in existing_emails:
                    print(f"Found new user in SQLite to insert: {email}")
                    cur.execute("""
                        INSERT INTO accounts_user 
                        (password, last_login, is_superuser, is_staff, is_active, date_joined, email, full_name, role, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (u[2], u[8], u[7], u[6], u[5], u[9], u[1], u[3], u[4], u[10], u[11]))
                    new_user_id = cur.lastrowid
                    existing_emails.add(email.lower())
                    
                    # Copy profile if any
                    sq_cur.execute("SELECT candidate_type, gender, mobile_number, college_name, department, course, register_number, college_id_card, selfie_photo FROM accounts_studentprofile WHERE user_id=?", (u[0],))
                    prof = sq_cur.fetchone()
                    if prof:
                        cur.execute("""
                            INSERT INTO accounts_studentprofile
                            (user_id, candidate_type, gender, mobile_number, college_name, department, course, register_number, college_id_card, selfie_photo, created_at, updated_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                        """, (new_user_id, *prof))
                        print(f"Copied student profile for {email}")

    print("\n=== MIGRATION COMPLETE! ===")
    with mysql_conn.cursor() as cur:
        cur.execute("USE wingrootech_db;")
        cur.execute("SHOW TABLES;")
        all_tables = [r[0] for r in cur.fetchall()]
        print(f"Total tables in wingrootech_db: {len(all_tables)}")
        for t in sorted(all_tables):
            cur.execute(f"SELECT COUNT(*) FROM `{t}`;")
            print(f"  {t}: {cur.fetchone()[0]} rows")

if __name__ == '__main__':
    migrate()
