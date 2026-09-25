import pymysql

conn = pymysql.connect(host='localhost', port=3306, user='root', password='', database='wingrootech_db')
cur = conn.cursor()

cur.execute("""
UPDATE projects 
SET heading = 'Creating a Better Digital Experience.',
    tag = 'Featured Project',
    category = 'Mobile App',
    tags = 'Modern Interface, Practical Functionality, User Focused, Technology Driven',
    theme_color = '#4f46e5'
WHERE title = 'ZENTIME'
""")

cur.execute("""
UPDATE projects 
SET heading = 'Connecting Technology With Opportunity.',
    tag = 'Featured Project',
    category = 'Mobile App',
    tags = 'Digital Platform, User Experience, Modern Technology, Purpose Driven',
    theme_color = '#0ea5e9'
WHERE title = 'IIE PLUS'
""")

cur.execute("UPDATE events SET tagline = 'Ideas Worth Talking About.', badge = 'Interactive' WHERE title = 'Tech Talks'")
cur.execute("UPDATE events SET tagline = 'Don''t Just Watch. Build.', badge = 'Hands-On' WHERE title = 'Technical Workshops'")
cur.execute("UPDATE events SET tagline = 'Think Fast. Build Smart.', badge = 'Competition' WHERE title = 'Hackathons'")
cur.execute("UPDATE events SET tagline = 'Know What Comes After College.', badge = 'Career Growth' WHERE title LIKE '%Career%'")

cur.execute("""
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

conn.commit()
conn.close()
print("SCHEMA_UPDATE_COMPLETE_WITH_EVENT_REGS")

