import shutil, os, sys
sys.path.append(os.path.dirname(__file__))
from database import get_db_connection

img_tourist = 'C:/Users/sriya/.gemini/antigravity-ide/brain/55af9dd8-6c52-4cd5-b651-f92734263ad2/tourists_guard_ui_1790419753129.jpg'
img_bot = 'C:/Users/sriya/.gemini/antigravity-ide/brain/55af9dd8-6c52-4cd5-b651-f92734263ad2/smart_ai_bot_ui_1790419776014.jpg'
img_virtue = 'C:/Users/sriya/.gemini/antigravity-ide/brain/55af9dd8-6c52-4cd5-b651-f92734263ad2/virtuehire_ui_1790419797950.jpg'

pub_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public')
img_dir = os.path.join(pub_dir, 'images')
uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')

os.makedirs(img_dir, exist_ok=True)
os.makedirs(uploads_dir, exist_ok=True)

shutil.copy(img_tourist, os.path.join(pub_dir, 'tourists-guard-preview.jpg'))
shutil.copy(img_tourist, os.path.join(img_dir, 'tourists-guard-preview.jpg'))
shutil.copy(img_tourist, os.path.join(uploads_dir, 'tourists-guard-preview.jpg'))

shutil.copy(img_bot, os.path.join(pub_dir, 'smart-ai-bot-preview.jpg'))
shutil.copy(img_bot, os.path.join(img_dir, 'smart-ai-bot-preview.jpg'))
shutil.copy(img_bot, os.path.join(uploads_dir, 'smart-ai-bot-preview.jpg'))

shutil.copy(img_virtue, os.path.join(pub_dir, 'virtuehire-preview.jpg'))
shutil.copy(img_virtue, os.path.join(img_dir, 'virtuehire-preview.jpg'))
shutil.copy(img_virtue, os.path.join(uploads_dir, 'virtuehire-preview.jpg'))

print('Copied all 3 preview images successfully!')

conn, db_type = get_db_connection()
cursor = conn.cursor()

new_projects = [
    {
        'title': 'TOURISTS GUARD',
        'heading': 'Intelligent Tourist Safety & Travel Assistance Platform.',
        'tag': 'Safety & Travel Platform',
        'tags': 'Real-time GPS SOS, Safety Heatmaps, Multi-lingual Guide, Verified Hotspots, Cloud Alerts',
        'description': 'Tourists Guard is a smart travel security and assistance platform developed by Wingroo Technologies. It provides real-time emergency alerts, geofenced tourist zone guidance, verified local services, multi-lingual SOS assistance, and live safety monitoring to ensure secure travel experiences worldwide.',
        'category': 'Web & Mobile App',
        'theme_color': '#f59e0b',
        'project_url': '#contact',
        'image': '/tourists-guard-preview.jpg',
        'video_url': '',
        'media_type': 'image'
    },
    {
        'title': 'SMART AI BOT',
        'heading': 'Next-Gen Conversational AI & Automated Enterprise Assistant.',
        'tag': 'AI & Automation Platform',
        'tags': 'Conversational AI, Natural Language Processing, 24/7 Automation, Multi-Channel, Workflow Integration',
        'description': 'Smart AI Bot is an intelligent conversational agent engineered by Wingroo Technologies. Built with advanced NLP and real-time knowledge retrieval, it automates multi-channel customer inquiries, streamlines internal enterprise workflows, and delivers personalized, context-aware user interactions 24/7.',
        'category': 'AI Platform',
        'theme_color': '#8b5cf6',
        'project_url': '#contact',
        'image': '/smart-ai-bot-preview.jpg',
        'video_url': '',
        'media_type': 'image'
    },
    {
        'title': 'VIRTUEHIRE',
        'heading': 'AI-Powered Talent Acquisition & Recruitment Pipeline.',
        'tag': 'Talent & HR Tech',
        'tags': 'AI Candidate Screening, Resume Parsing, Automated Interviews, Talent Analytics, HR Pipeline',
        'description': 'VirtueHire is an intelligent hiring and talent assessment platform developed by Wingroo Technologies. It transforms the recruitment lifecycle with AI-driven resume parsing, automated candidate screening, interactive interview scheduling, and skill-matching analytics to help organizations hire top talent efficiently.',
        'category': 'HR Tech / SaaS',
        'theme_color': '#10b981',
        'project_url': '#contact',
        'image': '/virtuehire-preview.jpg',
        'video_url': '',
        'media_type': 'image'
    }
]

for p in new_projects:
    if db_type == 'mysql':
        cursor.execute("SELECT id FROM projects WHERE UPPER(title) = %s", (p['title'],))
        existing = cursor.fetchone()
        if not existing:
            cursor.execute("""
                INSERT INTO projects (title, heading, tag, tags, description, category, theme_color, project_url, image, video_url, media_type)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                p['title'], p['heading'], p['tag'], p['tags'], p['description'],
                p['category'], p['theme_color'], p['project_url'], p['image'], p['video_url'], p['media_type']
            ))
            print(f"Inserted in MySQL: {p['title']}")
        else:
            eid = existing['id'] if isinstance(existing, dict) else existing[0]
            cursor.execute("""
                UPDATE projects SET heading=%s, tag=%s, tags=%s, description=%s, category=%s, theme_color=%s, project_url=%s, image=%s
                WHERE id=%s
            """, (
                p['heading'], p['tag'], p['tags'], p['description'],
                p['category'], p['theme_color'], p['project_url'], p['image'], eid
            ))
            print(f"Updated in MySQL: {p['title']}")
    else:
        cursor.execute("SELECT id FROM projects WHERE UPPER(title) = ?", (p['title'],))
        existing = cursor.fetchone()
        if not existing:
            cursor.execute("""
                INSERT INTO projects (title, heading, tag, tags, description, category, theme_color, project_url, image, video_url, media_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p['title'], p['heading'], p['tag'], p['tags'], p['description'],
                p['category'], p['theme_color'], p['project_url'], p['image'], p['video_url'], p['media_type']
            ))
            print(f"Inserted in SQLite: {p['title']}")
        else:
            eid = existing['id'] if isinstance(existing, dict) else existing[0]
            cursor.execute("""
                UPDATE projects SET heading=?, tag=?, tags=?, description=?, category=?, theme_color=?, project_url=?, image=?
                WHERE id=?
            """, (
                p['heading'], p['tag'], p['tags'], p['description'],
                p['category'], p['theme_color'], p['project_url'], p['image'], eid
            ))
            print(f"Updated in SQLite: {p['title']}")

conn.commit()
print("All projects committed successfully!")
