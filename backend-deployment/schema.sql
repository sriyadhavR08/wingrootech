-- ============================================================================
-- Wingroo Technologies — Standalone Project Database Schema
-- Database: wingrootech_db
-- Shows independently at the root level in phpMyAdmin (like django_react_db, foodexpress_db)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS wingrootech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wingrootech_db;

-- 1. Contacts Table (Contact Form Inquiries)
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    subject VARCHAR(100) DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Under Review',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Internship Applications Table (Student Applications)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Projects Table (Featured Portfolio & Candidates Work)
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

-- 4. Events Table (Talks, Workshops, Hackathons & Sessions)
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    event_date VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Projects Data
INSERT INTO projects (title, heading, tag, tags, description, category, theme_color, project_url, image, video_url, media_type) VALUES 
('ZENTIME', 'Modern and user-focused digital solution.', 'Featured Project', 'React, Node.js, Web Platform', 'Zentime is one of the projects developed by Wingroo Technologies, showcasing our approach toward building modern and user-focused digital solutions. The project focuses on combining functionality with a clean and intuitive experience, demonstrating how technology can be structured around the needs of its users.', 'Web Application', '#4f46e5', 'https://wingrootechnologies.com/', '/zentime-preview.jpg', '', 'image'),
('IIE PLUS', 'Educational & career advancement ecosystem.', 'Featured Project', 'React, Flask, MySQL, Cloud', 'IIE Plus is another project associated with Wingroo Technologies, demonstrating our focus on developing digital platforms that bring information, users and opportunities together. The project represents our approach to creating technology that is accessible, practical and designed around a clear purpose.', 'Digital Platform', '#06b6d4', 'https://wingrootechnologies.com/', '/iie-plus-preview.jpg', '', 'image'),
('TOURISTS GUARD', 'Intelligent Tourist Safety & Travel Assistance Platform.', "Our Candidates' Work", 'Real-time GPS SOS, Safety Heatmaps, Multi-lingual Guide, Verified Hotspots, Cloud Alerts', 'Tourists Guard is a smart travel security and assistance platform developed by Wingroo Technologies. It provides real-time emergency alerts, geofenced tourist zone guidance, verified local services, multi-lingual SOS assistance, and live safety monitoring to ensure secure travel experiences worldwide.', 'Web & Mobile App', '#f59e0b', '', '/tourists-guard-preview.jpg', '', 'image'),
('SMART AI BOT', 'Next-Gen Conversational AI & Automated Enterprise Assistant.', "Our Candidates' Work", 'Conversational AI, Natural Language Processing, 24/7 Automation, Multi-Channel, Workflow Integration', 'Smart AI Bot is an intelligent conversational agent engineered by Wingroo Technologies. Built with advanced NLP and real-time knowledge retrieval, it automates multi-channel customer inquiries, streamlines internal enterprise workflows, and delivers personalized, context-aware user interactions 24/7.', 'AI Platform', '#8b5cf6', '', '/smart-ai-bot-preview.jpg', '', 'image'),
('VIRTUEHIRE', 'AI-Powered Talent Acquisition & Recruitment Pipeline.', "Our Candidates' Work", 'AI Candidate Screening, Resume Parsing, Automated Interviews, Talent Analytics, HR Pipeline', 'VirtueHire is an intelligent hiring and talent assessment platform developed by Wingroo Technologies. It transforms the recruitment lifecycle with AI-driven resume parsing, automated candidate screening, interactive interview scheduling, and skill-matching analytics to help organizations hire top talent efficiently.', 'HR Tech / SaaS', '#10b981', '', '/virtuehire-preview.jpg', '', 'image')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Seed Events Data
INSERT INTO events (title, description, event_date, location) VALUES
('Tech Talks', 'Interactive sessions covering emerging technologies, development trends, career opportunities and insights from the technology industry.', 'Monthly Series', 'Wingroo Innovation Hub & Online'),
('Technical Workshops', 'Hands-on learning sessions where participants can explore technologies, work with tools and understand concepts by actually applying them.', 'Bi-Weekly', 'Hybrid Mode (Coimbatore / Virtual)'),
('Hackathons', 'Collaborative challenges that encourage participants to turn ideas into working solutions while solving practical problems.', 'Quarterly Event', 'Partner University Campuses'),
('Career & Industry Sessions', 'Sessions designed to help students understand industry expectations, career paths, technical skills and the transition from student life to professional life.', 'Upcoming Session', 'Live Webinar & Campus Audits')
ON DUPLICATE KEY UPDATE title=VALUES(title);
