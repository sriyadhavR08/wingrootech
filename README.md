# Wingroo Technologies — Official Web Application

A modern, premium, and professional single-page web application for **Wingroo Technologies**, engineered with **React.js**, **Python Flask**, and **MySQL (XAMPP)**.

Inspired by the visual design quality, typography hierarchy, and smooth interactions of modern SaaS standards (e.g., HelloBot), while presenting a unique, authentic brand identity for Wingroo Technologies.

---

## 🌟 Key Features

1. **Single-Page Architecture & Smooth Scroll**:
   - All sections reside on one long-form landing page.
   - Sticky navbar with glassmorphism (`backdrop-filter: blur(16px)`), live section spy indicator, and auto-closing mobile menu.
   - Offset scrolling (`scroll-margin-top`) prevents headings from hiding behind the sticky navbar.

2. **Hero & Highlight Strip**:
   - Headline: *"Turning Ideas Into Digital Impact."*
   - Subline: *"Technology. Creativity. Opportunity. — All under one roof."*
   - Abstract tech visual stage featuring floating UI cards, real-time code snippet preview, and metrics.
   - 4-pillar highlight strip: Innovation, Technology, Experience, Growth.

3. **About Section**:
   - Modern two-column layout with narrative and interactive ecosystem matrix.
   - 4-part guiding philosophy: *Think Different*, *Build Better*, *Learn Continuously*, *Grow Together*.
   - Leadership highlight quote: *“We don't just build technology. We build possibilities around it.”*

4. **Services Showcase**:
   - 6 modern service cards with icons, tags, and micro-hover states:
     - 01 Web Development
     - 02 Mobile App Development
     - 03 E-Commerce Solutions
     - 04 AI & Intelligent Solutions
     - 05 Custom Software Solutions
     - 06 UI/UX Design
   - Interactive CTA: *Build My Solution →*.

5. **Internship Programs**:
   - Dedicated cards for **College Internship** and **Live Project Internship**.
   - Interactive **Technology Domains** grid (Web, Full Stack, Python, Java, AI & ML).
   - Visual learning pipeline: `LEARN` → `BUILD` → `SOLVE` → `EXPERIENCE` → `GROW`.
   - **Interactive Internship Application Modal** connected to Flask API & MySQL.

6. **Events & Community**:
   - 4 Event Cards: Tech Talks, Technical Workshops, Hackathons, Career & Industry Sessions.
   - Interactive registration interest modal.
   - Dynamic API integration (`GET /api/events`) with static fallback.

7. **Portfolio Showcase**:
   - Large featured project cards for **ZENTIME** (*"Creating a Better Digital Experience"*) and **IIE PLUS** (*"Connecting Technology With Opportunity"*).
   - Realistic mockups, metrics, tags, and interactive project detail modals.

8. **Why Wingroo & Large CTA**:
   - 6 value blocks: Practical Thinking, Innovation, Quality, Learning Culture, Real Experience, Growth.
   - Vibrant high-impact CTA section with gradient backlights.

9. **Contact & Footer**:
   - Direct message contact form connected to Flask API & MySQL with instant feedback.
   - Company location (Coimbatore, Tamil Nadu), phone, email, and WhatsApp quick button.
   - Complete footer with brand tagline, smooth navigation links, and social channels.

---

## 🏗️ Project Architecture

```
wingroo-technologies/
├── frontend/                     # React (Vite) Single-Page Application
│   ├── src/
│   │   ├── components/           # Modular React components
│   │   │   ├── Navbar.jsx        # Sticky glassmorphic navbar with mobile drawer
│   │   │   ├── Navbar.css
│   │   │   ├── Hero.jsx          # Hero section with interactive tech visual
│   │   │   ├── Hero.css
│   │   │   ├── About.jsx         # About & philosophy section
│   │   │   ├── About.css
│   │   │   ├── Services.jsx      # 6 modern service cards
│   │   │   ├── Services.css
│   │   │   ├── Internship.jsx    # College & Live project cards + Application modal
│   │   │   ├── Internship.css
│   │   │   ├── Events.jsx        # Workshops, talks, hackathons + Registration modal
│   │   │   ├── Events.css
│   │   │   ├── Portfolio.jsx     # Zentime & IIE Plus showcases + Modal preview
│   │   │   ├── Portfolio.css
│   │   │   ├── WhyWingroo.jsx    # 6 feature value blocks
│   │   │   ├── WhyWingroo.css
│   │   │   ├── CTA.jsx           # Large gradient CTA banner
│   │   │   ├── CTA.css
│   │   │   ├── Contact.jsx       # Contact form & company details
│   │   │   ├── Contact.css
│   │   │   ├── Footer.jsx        # Footer with links, SVGs & copyright
│   │   │   └── Footer.css
│   │   ├── config/
│   │   │   └── api.js            # Centralized API base URL config
│   │   ├── styles/
│   │   │   └── global.css        # Design tokens, typography & shared utilities
│   │   ├── App.jsx               # Single-page layout assembly
│   │   └── main.jsx              # React DOM entry point
│   ├── index.html                # Google Fonts & SEO meta tags
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python Flask REST API
│   ├── app.py                    # Main Flask application & CORS setup
│   ├── config.py                 # MySQL XAMPP configuration
│   ├── database.py               # Database manager (MySQL with SQLite fallback)
│   ├── schema.sql                # Complete MySQL schema & seed data
│   ├── requirements.txt          # Python dependencies
│   └── routes/
│       ├── __init__.py
│       ├── contact.py            # POST /api/contact
│       ├── internship.py         # POST /api/internship
│       ├── projects.py           # GET  /api/projects
│       └── events.py             # GET  /api/events
│
└── README.md
```

---

## 🚀 Step-by-Step Setup Guide

### 1. Database Setup (XAMPP MySQL — Standalone Project Database)

The entire project operates on a single dedicated, standalone database: **`wingrootech_db`**.
Because it uses the unique prefix `wingrootech`, phpMyAdmin displays it independently at the root level of the database tree (exactly like `django_react_db` and `foodexpress_db`).

**Tables inside `wingrootech_db`:**
1. **`contacts`**: Stores client/general inquiries from the Contact form (`id`, `name`, `email`, `phone`, `subject`, `message`, `created_at`).
2. **`internship_applications`**: Stores student internship applications from the interactive modal (`id`, `name`, `email`, `phone`, `college`, `course`, `year`, `internship_type`, `technology`, `message`, `created_at`).
3. **`projects`**: Stores featured portfolio projects (`ZENTIME`, `IIE PLUS`).
4. **`events`**: Stores workshops, hackathons, and talks schedules.

**Database Configuration ([backend/config.py](file:///c:/Users/sriya/Desktop/new/backend/config.py)):**
- **Host**: `localhost`
- **Port**: `3306`
- **User**: `root`
- **Password**: `""` (empty by default in XAMPP)
- **Database**: `wingrootech_db`

*(The database and all tables are automatically provisioned and seeded by the Flask backend on its first startup! You can also import [backend/schema.sql](file:///c:/Users/sriya/Desktop/new/backend/schema.sql) in phpMyAdmin).*

---

### 2. Backend Setup (Flask API)

1. Open a terminal in the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Flask development server:
   ```bash
   python app.py
   ```
4. The API server will start on `http://localhost:5000` (or `http://127.0.0.1:5000`).

**Available API Endpoints:**
- `GET  /api/health` — API health check
- `POST /api/contact` — Submit general contact inquiries
- `POST /api/internship` — Submit student internship applications
- `GET  /api/projects` — Fetch featured portfolio projects (Zentime, IIE Plus)
- `GET  /api/events` — Fetch workshops, talks, and hackathon schedules

---

### 3. Frontend Setup (React + Vite)

1. Open another terminal in the `frontend/` folder:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at:
   ```
   http://localhost:5173/
   ```

---

## 🧪 Testing the Forms

### 1. Contact Form Test:
1. Scroll down to the **#contact** section.
2. Fill in:
   - **Full Name**: `Arun Kumar`
   - **Email Address**: `arun@example.com`
   - **Phone Number**: `+91 9876543210`
   - **Subject**: `Project / Client Solution`
   - **Message**: `Interested in building an enterprise web solution.`
3. Click **SEND MESSAGE →**.
4. You will see the confirmation message:
   > *"Thanks for reaching out. We'll get back to you soon."*
5. Check `wingroo_db.contacts` table in phpMyAdmin to verify the new record.

### 2. Internship Application Test:
1. Navigate to the **#internship** section.
2. Click **Explore College Internship** or **Start Your Internship →**.
3. A clean application modal will slide open.
4. Fill in:
   - **Full Name**: `Priya S`
   - **Email**: `priya@example.com`
   - **Phone**: `+91 9123456780`
   - **College**: `PSG College of Technology`
   - **Course**: `B.E Computer Science`
   - **Track & Tech Domain**: Select preferred options.
5. Click **Apply Now**.
6. The modal displays:
   > *"Your internship application has been submitted successfully! Our academic team will get in touch with you shortly."*
7. Check `wingroo_db.internship_applications` table in phpMyAdmin to view the application.

---

## 🛡️ Reliability & Offline Fallback

The application is built with resilience:
- If MySQL or Flask is temporarily offline, the frontend provides instant, graceful feedback rather than breaking the UI.
- The Flask backend includes an automated fallback SQLite connection if MySQL XAMPP is paused during local testing.

---

## 🏢 Contact Information

- **Company**: Wingroo Technologies
- **Location**: Coimbatore, Tamil Nadu, India
- **Phone**: +91 81247 79111
- **Email**: [info@wingrootechnologies.com](mailto:info@wingrootechnologies.com)
- **Website**: [wingrootechnologies.com](https://wingrootechnologies.com/)
