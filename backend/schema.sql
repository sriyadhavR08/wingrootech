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

-- 3. Projects Table (Featured Portfolio: Zentime & IIE Plus)
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image VARCHAR(255),
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
INSERT INTO projects (title, description, category, project_url) VALUES 
('ZENTIME', 'Zentime is one of the projects developed by Wingroo Technologies, showcasing our approach toward building modern and user-focused digital solutions. The project focuses on combining functionality with a clean and intuitive experience, demonstrating how technology can be structured around the needs of its users.', 'Web Application', 'https://wingrootechnologies.com/'),
('IIE PLUS', 'IIE Plus is another project associated with Wingroo Technologies, demonstrating our focus on developing digital platforms that bring information, users and opportunities together. The project represents our approach to creating technology that is accessible, practical and designed around a clear purpose.', 'Digital Platform', 'https://wingrootechnologies.com/')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Seed Events Data
INSERT INTO events (title, description, event_date, location) VALUES
('Tech Talks', 'Interactive sessions covering emerging technologies, development trends, career opportunities and insights from the technology industry.', 'Monthly Series', 'Wingroo Innovation Hub & Online'),
('Technical Workshops', 'Hands-on learning sessions where participants can explore technologies, work with tools and understand concepts by actually applying them.', 'Bi-Weekly', 'Hybrid Mode (Coimbatore / Virtual)'),
('Hackathons', 'Collaborative challenges that encourage participants to turn ideas into working solutions while solving practical problems.', 'Quarterly Event', 'Partner University Campuses'),
('Career & Industry Sessions', 'Sessions designed to help students understand industry expectations, career paths, technical skills and the transition from student life to professional life.', 'Upcoming Session', 'Live Webinar & Campus Audits')
ON DUPLICATE KEY UPDATE title=VALUES(title);
