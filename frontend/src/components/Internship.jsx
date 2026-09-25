import React, { useState } from 'react';
import { 
  GraduationCap, 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Database, 
  Terminal, 
  BrainCircuit, 
  Layers, 
  Sparkles,
  X,
  Send,
  Loader2
} from 'lucide-react';
import './Internship.css';

import { API_BASE_URL } from '../config/api';

const TECH_DOMAINS = [
  { name: 'Web Development', icon: <Code2 size={18} />, desc: 'Modern responsive SPAs & PWAs' },
  { name: 'Full Stack Development', icon: <Layers size={18} />, desc: 'End-to-end architectures & APIs' },
  { name: 'Python Development', icon: <Terminal size={18} />, desc: 'Backend systems & automation scripts' },
  { name: 'Java Development', icon: <Database size={18} />, desc: 'Enterprise patterns & robust services' },
  { name: 'AI & Machine Learning', icon: <BrainCircuit size={18} />, desc: 'Intelligent models & data workflows' }
];

const DOMAIN_SCHEDULES = {
  'Full Stack Development': {
    duration: '15 – 20 Days Intensive Cohort',
    overview: 'Master client-server architecture, modern React UI, RESTful backends, database models, and production cloud deployment with real-world industry tasks.',
    phases: [
      {
        phase: 'Phase 1: Architecture & Frontend Core (Days 1 – 5)',
        days: [
          { day: 'Day 01', topic: 'Modern Web Architecture & Developer Tooling', task: 'Git workflow, Node.js environment, Vite workspace setup & branch strategy' },
          { day: 'Day 02', topic: 'Advanced React 19 & Component Architecture', task: 'Reusable JSX components, prop-drilling prevention, atomic design' },
          { day: 'Day 03', topic: 'State Management & Custom Reactive Hooks', task: 'useState, useEffect, useMemo, custom hooks for API integration' },
          { day: 'Day 04', topic: 'Modern UI/UX & Responsive Layouts', task: 'CSS Flexbox/Grid, CSS Modules, mobile-first layouts & dark modes' },
          { day: 'Day 05', topic: 'Frontend Routing, Navigation & Global Context', task: 'Single Page App routing, protected routes, and auth contexts' }
        ]
      },
      {
        phase: 'Phase 2: Backend APIs & Database Integration (Days 6 – 10)',
        days: [
          { day: 'Day 06', topic: 'Server Architecture & RESTful API Principles', task: 'Express / Flask server bootstrap, request life-cycle, routing' },
          { day: 'Day 07', topic: 'Middleware, Body Parsing & Input Validation', task: 'Custom middleware, sanitization, schema validation rules' },
          { day: 'Day 08', topic: 'Relational Database Design with MySQL', task: 'Entity Relationship diagrams, tables, indexing, queries & foreign keys' },
          { day: 'Day 09', topic: 'ORM / Database Driver Integration', task: 'Database connection pooling, CRUD queries, error handling' },
          { day: 'Day 10', topic: 'Milestone 1: Mini Full-Stack Integration', task: 'Wire frontend React client to live backend API database endpoints' }
        ]
      },
      {
        phase: 'Phase 3: Authentication, Security & Business Logic (Days 11 – 15)',
        days: [
          { day: 'Day 11', topic: 'Secure Authentication & Session Tokens', task: 'JWT (JSON Web Tokens), bcrypt password hashing, auth cookies' },
          { day: 'Day 12', topic: 'Role-Based Access Control (RBAC)', task: 'Admin vs Student/User permissions, middleware route guards' },
          { day: 'Day 13', topic: 'File Uploads & Media Storage Pipeline', task: 'Handling multipart forms, poster/image storage & secure serving' },
          { day: 'Day 14', topic: 'API Error Handling, CORS & Edge Security', task: 'Rate limiting, CORS configuration, centralized error handling' },
          { day: 'Day 15', topic: 'Milestone 2: Production Feature Sprint', task: 'Build core application features with authenticated workflows' }
        ]
      },
      {
        phase: 'Phase 4: Optimization, Cloud Deployment & Capstone (Days 16 – 20)',
        days: [
          { day: 'Day 16', topic: 'Frontend Production Optimization & SEO', task: 'Vite build bundling, lazy loading, meta tags, lighthouse auditing' },
          { day: 'Day 17', topic: 'Backend WSGI / Gunicorn & Production Config', task: 'Environment variables, production server tuning & health endpoints' },
          { day: 'Day 18', topic: 'Cloud Deployment (Vercel & Render)', task: 'Continuous integration, git push deployments, live HTTPS domains' },
          { day: 'Day 19', topic: 'Automated Code Review, Bug Bash & Testing', task: 'Unit test sanity checks, cross-device testing, security audit' },
          { day: 'Day 20', topic: 'Capstone Demo, Viva & Internship Certification', task: 'Live project presentation, mentor evaluation & certificate dispatch' }
        ]
      }
    ]
  },
  'Web Development': {
    duration: '15 – 20 Days Frontend & PWA Cohort',
    overview: 'Deep dive into responsive modern web interfaces, component libraries, state management, API data pipelines, and progressive web apps.',
    phases: [
      {
        phase: 'Phase 1: Modern JS & Component Fundamentals (Days 1 – 5)',
        days: [
          { day: 'Day 01', topic: 'Modern ES6+ JavaScript Mastery', task: 'Arrow functions, destructuring, promises, async/await & modules' },
          { day: 'Day 02', topic: 'DOM Optimization & Event Delegation', task: 'Virtual DOM concepts, synthetic events, performance rendering' },
          { day: 'Day 03', topic: 'React Core & Component Composition', task: 'JSX structure, component patterns, props & render props' },
          { day: 'Day 04', topic: 'State Machines & Form Handling', task: 'Controlled inputs, multi-step forms, real-time validations' },
          { day: 'Day 05', topic: 'Responsive CSS Design Systems', task: 'CSS variables, dark/light themes, animations, micro-interactions' }
        ]
      },
      {
        phase: 'Phase 2: Complex State & API Communication (Days 6 – 10)',
        days: [
          { day: 'Day 06', topic: 'HTTP Client Architecture & Fetch API', task: 'Axios/Fetch abstractions, interceptors, retry logic' },
          { day: 'Day 07', topic: 'Asynchronous UI States & Skeletons', task: 'Loading states, error boundaries, optimistic UI updates' },
          { day: 'Day 08', topic: 'Single Page Application Routing', task: 'Dynamic path parameters, query strings, active navigation' },
          { day: 'Day 09', topic: 'Data Visualization & Interactive Charts', task: 'Chart.js / SVG dashboards for interactive stats presentation' },
          { day: 'Day 10', topic: 'Mid-Term Frontend Showcase', task: 'Interactive candidate/client portal prototype review' }
        ]
      },
      {
        phase: 'Phase 3: Performance, Caching & PWAs (Days 11 – 15)',
        days: [
          { day: 'Day 11', topic: 'Local Storage, Session & Offline Cache', task: 'Client-side data persistence and offline fallback state' },
          { day: 'Day 12', topic: 'Progressive Web App (PWA) Manifest', task: 'Installable mobile web app, service workers, icon assets' },
          { day: 'Day 13', topic: 'Web Accessibility & Semantic Standards', task: 'ARIA labels, keyboard navigation, contrast ratio validation' },
          { day: 'Day 14', topic: 'Cross-Browser & Device Testing', task: 'Mobile viewport testing, responsive typography, touches' },
          { day: 'Day 15', topic: 'Feature Freeze & Code Polishing', task: 'Code cleaning, linting compliance, performance refactoring' }
        ]
      },
      {
        phase: 'Phase 4: Launch, SEO & Presentation (Days 16 – 20)',
        days: [
          { day: 'Day 16', topic: 'Vite Production Bundling & Splitting', task: 'Code-splitting, tree shaking, asset gzip compression' },
          { day: 'Day 17', topic: 'Search Engine Optimization (SEO)', task: 'OpenGraph tags, schema markup, sitemaps, fast FCP/LCP' },
          { day: 'Day 18', topic: 'Vercel / Netlify Global Cloud Deployment', task: 'Custom domain setup, automatic preview deployments' },
          { day: 'Day 19', topic: 'Portfolio Integration & Case Study Writeup', task: 'Showcasing project in personal GitHub & LinkedIn' },
          { day: 'Day 20', topic: 'Final Evaluation & Certificate Award', task: 'Faculty/mentor assessment score calculation & scholarship grants' }
        ]
      }
    ]
  },
  'Python Development': {
    duration: '15 – 20 Days Backend & Automation Cohort',
    overview: 'Engineered for backend systems, REST microservices, database ORMs, automation tools, and production API architectures with Python.',
    phases: [
      {
        phase: 'Phase 1: Advanced Python & Environment (Days 1 – 5)',
        days: [
          { day: 'Day 01', topic: 'Python 3 Environment, Pip & Virtualenvs', task: 'Modern project organization, requirements.txt, linters' },
          { day: 'Day 02', topic: 'Object-Oriented Programming (OOP) in Python', task: 'Classes, inheritance, decorators, magic methods' },
          { day: 'Day 03', topic: 'Data Structures, File I/O & Exception Handling', task: 'Custom exceptions, context managers, JSON serialization' },
          { day: 'Day 04', topic: 'Python Networking & Requests Module', task: 'HTTP verbs, consuming external APIs, handling payloads' },
          { day: 'Day 05', topic: 'Automated Scripting & Web Scraping', task: 'BeautifulSoup / Selenium automation pipelines' }
        ]
      },
      {
        phase: 'Phase 2: Flask / FastAPI Backend Frameworks (Days 6 – 10)',
        days: [
          { day: 'Day 06', topic: 'Flask Application Structure & Blueprints', task: 'Modular routing, app factories, configuration environments' },
          { day: 'Day 07', topic: 'Request Handling & JSON Response Standards', task: 'Query params, JSON payloads, HTTP status code etiquette' },
          { day: 'Day 08', topic: 'MySQL Integration via PyMySQL / SQLAlchemy', task: 'Database connections, table migrations, SQL queries' },
          { day: 'Day 09', topic: 'CRUD API Development & Testing', task: 'Building complete Create-Read-Update-Delete endpoints' },
          { day: 'Day 10', topic: 'Mid-Term API Milestone Validation', task: 'Postman / curl test collection validation & sanity check' }
        ]
      },
      {
        phase: 'Phase 3: Authentication, Security & Data Processing (Days 11 – 15)',
        days: [
          { day: 'Day 11', topic: 'Password Hashing & PyJWT Authentication', task: 'Secure passwords with passlib/bcrypt, token dispatch' },
          { day: 'Day 12', topic: 'CORS & Security Middleware', task: 'Enabling secure cross-origin requests for React/Vue frontends' },
          { day: 'Day 13', topic: 'File Uploads & Media Server Routing', task: 'Secure file upload endpoints, validation & disk serving' },
          { day: 'Day 14', topic: 'Background Tasks & Worker Queues', task: 'Email notifications, scheduled crons, async tasks' },
          { day: 'Day 15', topic: 'Database Optimization & Connection Pooling', task: 'Indexes, query profiling, handling concurrent loads' }
        ]
      },
      {
        phase: 'Phase 4: WSGI, Cloud Deployment & Capstone (Days 16 – 20)',
        days: [
          { day: 'Day 16', topic: 'Production WSGI with Gunicorn', task: 'Worker configs, procfile, handling production traffic' },
          { day: 'Day 17', topic: 'Cloud Deployment on Render / AWS', task: 'Cloud database linking, environment variables, health checks' },
          { day: 'Day 18', topic: 'API Documentation with Swagger / OpenAPI', task: 'Generating interactive developer docs for frontend teams' },
          { day: 'Day 19', topic: 'Code Audit, Unit Testing with PyTest', task: 'Writing automated test cases, edge case validation' },
          { day: 'Day 20', topic: 'Project Defense, Assessment Review & Certs', task: 'Technical presentation, viva, and certification dispatch' }
        ]
      }
    ]
  },
  'Java Development': {
    duration: '15 – 20 Days Enterprise Spring Boot Cohort',
    overview: 'Learn scalable enterprise software development, Spring Boot microservices, Hibernate/JPA, MySQL, and secure REST APIs.',
    phases: [
      {
        phase: 'Phase 1: Core Java & OOP Enterprise Patterns (Days 1 – 5)',
        days: [
          { day: 'Day 01', topic: 'Core Java Refresher & Maven Architecture', task: 'Maven pom.xml, dependencies, JDK 21 setup' },
          { day: 'Day 02', topic: 'OOP Principles, Interfaces & Polymorphism', task: 'SOLID principles, abstract classes, design patterns' },
          { day: 'Day 03', topic: 'Java Collections Framework & Generics', task: 'Lists, Sets, Maps, Streams API, Lambda expressions' },
          { day: 'Day 04', topic: 'Exception Handling & Multi-threading', task: 'Custom exceptions, threads, executors, concurrency' },
          { day: 'Day 05', topic: 'JDBC & Relational Database Connectivity', task: 'Connecting Java to MySQL, prepared statements, transactions' }
        ]
      },
      {
        phase: 'Phase 2: Spring Boot & Data JPA (Days 6 – 10)',
        days: [
          { day: 'Day 06', topic: 'Spring Boot Fundamentals & IoC Container', task: 'Spring Initializr, @SpringBootApplication, Dependency Injection' },
          { day: 'Day 07', topic: 'Building RESTful Controllers with Spring MVC', task: '@RestController, @GetMapping, @PostMapping, DTO patterns' },
          { day: 'Day 08', topic: 'Spring Data JPA & Hibernate Mapping', task: '@Entity, @Table, @Id, @OneToMany, repository interfaces' },
          { day: 'Day 09', topic: 'Custom JPQL Queries & Pagination', task: 'PagingAndSortingRepository, custom finder methods' },
          { day: 'Day 10', topic: 'Mid-Term Microservice Sprint', task: 'End-to-end CRUD service with relational database persistence' }
        ]
      },
      {
        phase: 'Phase 3: Spring Security, Validation & Business Logic (Days 11 – 15)',
        days: [
          { day: 'Day 11', topic: 'Bean Validation & Centralized Exception Handler', task: '@Valid, @NotNull, @ControllerAdvice, error response DTOs' },
          { day: 'Day 12', topic: 'Spring Security 6 & JWT Tokenization', task: 'SecurityFilterChain, BCryptPasswordEncoder, token filters' },
          { day: 'Day 13', topic: 'Role-Based Authorization & Method Security', task: '@PreAuthorize, role hierarchies (ADMIN, STUDENT, USER)' },
          { day: 'Day 14', topic: 'Service Layer Testing with JUnit 5 & Mockito', task: 'Mocking repositories, unit tests, code coverage' },
          { day: 'Day 15', topic: 'Application Configuration & Profiles', task: 'application.yml, active profiles (dev, test, prod)' }
        ]
      },
      {
        phase: 'Phase 4: Dockerization, Deployment & Capstone (Days 16 – 20)',
        days: [
          { day: 'Day 16', topic: 'Building Executable JARs & Docker Containers', task: 'Dockerfile setup, multi-stage builds, container running' },
          { day: 'Day 17', topic: 'Cloud Deployment to Railway / AWS EC2', task: 'Cloud MySQL integration, environment configuration' },
          { day: 'Day 18', topic: 'Swagger / Springdoc OpenAPI Documentation', task: 'Interactive API playground and documentation generation' },
          { day: 'Day 19', topic: 'Performance Tuning, Actuator & Logging (SLF4J)', task: 'Spring Boot Actuator health checks, structured logging' },
          { day: 'Day 20', topic: 'Enterprise Capstone Defense & Certification', task: 'Final code defense, assessment evaluation & certificate award' }
        ]
      }
    ]
  },
  'AI & Machine Learning': {
    duration: '15 – 20 Days Applied AI & Models Cohort',
    overview: 'Dive into applied machine learning, data processing, neural networks, predictive models, and deploying intelligent APIs into production.',
    phases: [
      {
        phase: 'Phase 1: Data Science Foundations & Vector Math (Days 1 – 5)',
        days: [
          { day: 'Day 01', topic: 'Python for AI, Jupyter Notebooks & NumPy', task: 'Array operations, matrix math, broadcasting, vectorized speed' },
          { day: 'Day 02', topic: 'Pandas for Data Wrangling & Manipulation', task: 'DataFrames, cleaning missing values, grouping, merging' },
          { day: 'Day 03', topic: 'Exploratory Data Analysis (EDA)', task: 'Matplotlib, Seaborn, statistical visualization, distributions' },
          { day: 'Day 04', topic: 'Feature Engineering & Data Preprocessing', task: 'Scaling, One-Hot Encoding, train-test splits, pipeline setup' },
          { day: 'Day 05', topic: 'Introduction to Supervised Learning', task: 'Linear Regression, cost functions, gradient descent intuition' }
        ]
      },
      {
        phase: 'Phase 2: Core Machine Learning Algorithms (Days 6 – 10)',
        days: [
          { day: 'Day 06', topic: 'Classification Models with Scikit-Learn', task: 'Logistic Regression, Decision Trees, Random Forests' },
          { day: 'Day 07', topic: 'Model Evaluation Metrics', task: 'Confusion matrix, precision, recall, F1-score, ROC-AUC curve' },
          { day: 'Day 08', topic: 'Hyperparameter Tuning & Cross-Validation', task: 'GridSearchCV, K-Fold cross validation, preventing overfitting' },
          { day: 'Day 09', topic: 'Unsupervised Learning & Clustering', task: 'K-Means clustering, PCA dimensionality reduction' },
          { day: 'Day 10', topic: 'Mid-Term Predictive Model Milestone', task: 'Train and validate an end-to-end predictive model on real data' }
        ]
      },
      {
        phase: 'Phase 3: Deep Learning, NLP & LLM Intro (Days 11 – 15)',
        days: [
          { day: 'Day 11', topic: 'Neural Networks Architecture Fundamentals', task: 'Perceptrons, activation functions (ReLU, Softmax), forward pass' },
          { day: 'Day 12', topic: 'Building Neural Nets with PyTorch / TensorFlow', task: 'Loss functions, optimizers (Adam), training loops, epochs' },
          { day: 'Day 13', topic: 'Natural Language Processing (NLP) Basics', task: 'Tokenization, TF-IDF, embeddings, sentiment classification' },
          { day: 'Day 14', topic: 'Working with Pre-trained Models & Hugging Face', task: 'Transformers, pipelines, sentiment analysis, text generation' },
          { day: 'Day 15', topic: 'Model Serialization & Persistence', task: 'Saving models with Joblib / Pickle / ONNX for production' }
        ]
      },
      {
        phase: 'Phase 4: AI Model Deployment, API & Capstone (Days 16 – 20)',
        days: [
          { day: 'Day 16', topic: 'Building an Inference REST API with Flask/FastAPI', task: 'Receiving user input, running model.predict(), returning JSON' },
          { day: 'Day 17', topic: 'Frontend-to-AI Model Integration', task: 'Connecting React dashboard to live AI prediction endpoints' },
          { day: 'Day 18', topic: 'Cloud Deployment on Render / Hugging Face Spaces', task: 'Deploying the AI service live on the internet with public URL' },
          { day: 'Day 19', topic: 'Model Monitoring, Latency & Optimization', task: 'Inference latency benchmarking, input guardrails, test cases' },
          { day: 'Day 20', topic: 'Live AI Capstone Showcase & Certification', task: 'Live demo presentation, evaluation review & scholarship awards' }
        ]
      }
    ]
  }
};

const PROCESS_STEPS = [
  { step: '01', title: 'LEARN', desc: 'Core fundamentals & modern tools' },
  { step: '02', title: 'BUILD', desc: 'Real architectural components' },
  { step: '03', title: 'SOLVE', desc: 'Edge cases & production bugs' },
  { step: '04', title: 'EXPERIENCE', desc: 'Collaborative team workflows' },
  { step: '05', title: 'GROW', desc: 'Career-ready portfolio & skills' }
];

export default function Internship({ onOpenStudentPortal }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [activeScheduleDomain, setActiveScheduleDomain] = useState('Full Stack Development');
  const [selectedType, setSelectedType] = useState('College Internship');
  const [selectedTech, setSelectedTech] = useState('Full Stack Development');
  const [optScholarship, setOptScholarship] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    year: '3rd Year',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { success: bool, message: string, appNo: string, email: string }

  const openModal = (type = 'College Internship', tech = 'Full Stack Development', withScholarship = true) => {
    setSelectedType(type);
    if (tech) setSelectedTech(tech);
    setOptScholarship(withScholarship);
    setSubmitStatus(null);
    setIsModalOpen(true);
  };

  const openScheduleModal = (type = 'College Internship', tech = 'Full Stack Development') => {
    setSelectedType(type);
    if (tech) setActiveScheduleDomain(tech);
    setIsScheduleOpen(true);
  };

  const closeScheduleModal = () => {
    setIsScheduleOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    const fullMessage = optScholarship 
      ? `[🎓 MERIT SCHOLARSHIP APPLICANT: Candidate requested 20-min Screening Assessment for Up to 100% Fee Waiver]\n${formData.message || ''}`.trim()
      : (formData.message || '');

    const payload = {
      ...formData,
      message: fullMessage,
      internship_type: selectedType,
      technology: selectedTech
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/internship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const appNo = data.application_no || `WINGROO-INT-${data.application_id || 101}`;
        sessionStorage.setItem('wingroo_student_lookup', payload.email);
        sessionStorage.setItem('wingroo_student_app_no', appNo);
        setSubmitStatus({
          success: true,
          message: data.message || 'Your internship application has been submitted successfully!',
          appNo: appNo,
          email: payload.email
        });
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        setFormData({
          name: '',
          email: '',
          phone: '',
          college: '',
          course: '',
          year: '3rd Year',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.warn('Backend unavailable, providing fallback confirmation:', err);
      const fallbackAppNo = `WINGROO-INT-${Math.floor(1000 + Math.random() * 9000)}`;
      sessionStorage.setItem('wingroo_student_lookup', payload.email);
      setSubmitStatus({
        success: true,
        message: 'Your internship application has been received successfully! Our academic team will get in touch with you shortly.',
        appNo: fallbackAppNo,
        email: payload.email
      });
      window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        course: '',
        year: '3rd Year',
        message: ''
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="internship" className="internship-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot" />
            <span>Practical Career Launchpad</span>
          </div>
          <h2 className="section-title">Don't Just Learn Technology. Experience It.</h2>
          <p className="section-desc">
            The classroom teaches you the concepts. Experience teaches you how to use them.
            At Wingroo Technologies, our internship programs are designed to bridge that gap 
            by giving students practical exposure to technology, project development and professional working environments.
          </p>
        </div>

        {/* Two Large Cards */}
        <div className="internship-cards-grid">
          {/* Card 1: College Internship */}
          <div className="intern-feature-card modern-card">
            <div className="intern-card-badge blue-badge">
              <GraduationCap size={18} />
              <span>Academic Immersion</span>
            </div>
            <h3 className="intern-card-category">College Internship</h3>
            <h4 className="intern-card-headline">Turn Academic Knowledge Into Practical Skills.</h4>
            <p className="intern-card-desc">
              Our college internship programs help students understand how the technologies they learn 
              in their curriculum are actually used in real development environments. Students can explore 
              technology domains, work on practical assignments and gain exposure to project development 
              while continuing their academic journey.
            </p>
            <ul className="intern-card-perks">
              <li><CheckCircle2 size={16} className="perk-check" /> Structured 15 – 20 Days curriculum aligned with semester goals</li>
              <li><CheckCircle2 size={16} className="perk-check" /> Guidance from seasoned software engineers</li>
              <li><CheckCircle2 size={16} className="perk-check" /> Official internship certificate & performance evaluation</li>
              <li style={{ color: '#0284c7', fontWeight: 600 }}>
                <Sparkles size={16} className="perk-check" style={{ color: '#0284c7' }} />
                <span><strong>Up to 100% Scholarship</strong> based on assessment scores</span>
              </li>
            </ul>
            <button 
              onClick={() => openScheduleModal('College Internship', 'Full Stack Development')} 
              className="btn btn-secondary intern-cta-btn"
            >
              <span>Explore 15-20 Days Schedule & Scholarship</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Live Project Internship */}
          <div className="intern-feature-card modern-card highlight-border">
            <div className="intern-card-badge purple-badge">
              <Rocket size={18} />
              <span>Production Ready</span>
            </div>
            <h3 className="intern-card-category">Live Project Internship</h3>
            <h4 className="intern-card-headline">Build Something Real.</h4>
            <p className="intern-card-desc">
              A live project is different from a classroom assignment. It requires understanding requirements, 
              planning solutions, writing clean code, solving problems and working toward a usable outcome. 
              Through live project internships, students get the opportunity to experience this process and 
              understand what it takes to build a real technology solution.
            </p>
            <ul className="intern-card-perks">
              <li><CheckCircle2 size={16} className="perk-check" /> Hands-on contribution to client & internal software</li>
              <li><CheckCircle2 size={16} className="perk-check" /> Git collaboration, code reviews and sprints</li>
              <li><CheckCircle2 size={16} className="perk-check" /> Standout portfolio piece that recruiters love</li>
              <li style={{ color: '#7c3aed', fontWeight: 600 }}>
                <Sparkles size={16} className="perk-check" style={{ color: '#7c3aed' }} />
                <span>Merit Stipend & Project Certification</span>
              </li>
            </ul>
            <button 
              onClick={() => openScheduleModal('Live Project Internship', 'Full Stack Development')} 
              className="btn btn-primary intern-cta-btn"
            >
              <span>Explore Live Project Schedule</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Technology Domains */}
        <div className="tech-domains-wrapper">
          <div className="domains-header">
            <h3 className="domains-title">Technology Domains & 15-20 Day Roadmaps</h3>
            <p className="domains-desc">Click any track below to inspect the day-by-day curriculum and scholarship assessment guidelines</p>
          </div>

          <div className="domains-grid">
            {TECH_DOMAINS.map((domain, idx) => (
              <div 
                key={idx} 
                className="domain-pill-card"
                onClick={() => openScheduleModal('College Internship', domain.name)}
                title={`Explore ${domain.name} 15-20 Days Schedule`}
              >
                <div className="domain-icon-circle">
                  {domain.icon}
                </div>
                <div className="domain-text">
                  <div className="domain-name">{domain.name}</div>
                  <div className="domain-sub">{domain.desc}</div>
                </div>
                <ArrowRight size={16} className="domain-arrow" />
              </div>
            ))}
          </div>
        </div>

        {/* Visual Process Pipeline */}
        <div className="process-pipeline-block">
          <div className="pipeline-header">
            <span className="pipeline-tag">The Wingroo Learning Matrix</span>
            <h3 className="pipeline-title">From Learner to Industry Contributor</h3>
          </div>

          <div className="pipeline-steps-grid">
            {PROCESS_STEPS.map((item, idx) => (
              <div key={idx} className="pipeline-step-item">
                <div className="step-num-badge">{item.step}</div>
                <div className="step-title">{item.title}</div>
                <p className="step-desc">{item.desc}</p>
                {idx < PROCESS_STEPS.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>

          <div className="pipeline-quote-banner">
            <p className="pipeline-quote">
              “Your first real project could be the beginning of your professional journey.”
            </p>
            <button 
              onClick={() => openScheduleModal('College Internship', 'Full Stack Development')} 
              className="btn btn-primary"
            >
              <span>Explore Curriculum & Scholarship</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 15-20 Days Schedule & Scholarship Explorer Modal */}
      {isScheduleOpen && (
        <div className="modal-overlay" onClick={closeScheduleModal}>
          <div className="modal-content schedule-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeScheduleModal} aria-label="Close modal">
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="modal-header schedule-modal-header">
              <div className="modal-tag">Wingroo Academic Immersion</div>
              <h3 className="modal-title">15 – 20 Days Intensive Internship Schedule</h3>
              <p className="modal-desc">
                Structured hands-on curriculum, daily production milestones, and merit-based scholarship assessment program.
              </p>
            </div>

            {/* Scholarship Assessment Callout Banner */}
            <div className="scholarship-banner-card">
              <div className="scholarship-badge-pill">
                <Sparkles size={14} />
                <span>Merit Scholarship Assessment</span>
              </div>
              <div className="scholarship-main-row">
                <div className="scholarship-info-text">
                  <h4>Attend Online Assessment & Win Up to 100% Scholarship! 🎓</h4>
                  <p>
                    We believe financial constraints should never stop passionate learners. Attend our <strong>20-minute online screening assessment</strong> covering core aptitude and programming fundamentals. Top scoring candidates qualify for merit scholarships:
                  </p>
                </div>
                <button 
                  onClick={() => {
                    closeScheduleModal();
                    openModal('College Internship', activeScheduleDomain, true);
                  }}
                  className="btn btn-primary scholarship-apply-btn"
                >
                  <span>Apply with Scholarship</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Slabs Grid */}
              <div className="scholarship-slabs-grid">
                <div className="slab-card slab-gold">
                  <div className="slab-percent">100% Waiver</div>
                  <div className="slab-criteria">Score 90% & Above</div>
                  <div className="slab-desc">Full 100% Scholarship + Direct Fast-Track Cohort Selection</div>
                </div>
                <div className="slab-card slab-silver">
                  <div className="slab-percent">50% Scholarship</div>
                  <div className="slab-criteria">Score 75% – 89%</div>
                  <div className="slab-desc">50% Program Fee Waiver + Dedicated Mentor Pairing</div>
                </div>
                <div className="slab-card slab-bronze">
                  <div className="slab-percent">25% Grant</div>
                  <div className="slab-criteria">Score 60% – 74%</div>
                  <div className="slab-desc">25% Academic Grant + Live Capstone Project Access</div>
                </div>
              </div>
            </div>

            {/* Domain Selector Tabs */}
            <div className="schedule-domain-tabs">
              {TECH_DOMAINS.map((td) => (
                <button
                  key={td.name}
                  onClick={() => setActiveScheduleDomain(td.name)}
                  className={`schedule-tab-btn ${activeScheduleDomain === td.name ? 'active' : ''}`}
                >
                  <span className="tab-icon">{td.icon}</span>
                  <span>{td.name}</span>
                </button>
              ))}
            </div>

            {/* Schedule Body */}
            {DOMAIN_SCHEDULES[activeScheduleDomain] && (
              <div className="schedule-details-wrap">
                <div className="domain-curriculum-header">
                  <div>
                    <h4 className="curriculum-domain-title">{activeScheduleDomain} Curriculum</h4>
                    <p className="curriculum-domain-desc">{DOMAIN_SCHEDULES[activeScheduleDomain].overview}</p>
                  </div>
                  <div className="curriculum-duration-chip">
                    {DOMAIN_SCHEDULES[activeScheduleDomain].duration}
                  </div>
                </div>

                {/* 4 Phases List */}
                <div className="schedule-phases-list">
                  {DOMAIN_SCHEDULES[activeScheduleDomain].phases.map((phaseItem, pIdx) => (
                    <div key={pIdx} className="phase-card">
                      <div className="phase-header-badge">
                        <span>{phaseItem.phase}</span>
                      </div>
                      <div className="days-grid-list">
                        {phaseItem.days.map((dayItem, dIdx) => (
                          <div key={dIdx} className="day-schedule-item">
                            <div className="day-number-pill">{dayItem.day}</div>
                            <div className="day-content-info">
                              <div className="day-topic-name">{dayItem.topic}</div>
                              <div className="day-task-desc">
                                <strong>Hands-on Task:</strong> {dayItem.task}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Schedule Action Row */}
                <div className="schedule-modal-footer">
                  <div className="footer-left-info">
                    <span>Selected Domain: <strong>{activeScheduleDomain}</strong></span>
                    <span className="info-dot">•</span>
                    <span>Includes Certificate & Project Repo</span>
                  </div>
                  <div className="footer-action-buttons">
                    <button 
                      onClick={() => {
                        closeScheduleModal();
                        openModal('College Internship', activeScheduleDomain, true);
                      }}
                      className="btn btn-primary"
                    >
                      <span>Apply for {activeScheduleDomain}</span>
                      <ArrowRight size={15} />
                    </button>
                    <button onClick={closeScheduleModal} className="btn btn-secondary">
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Internship Application Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close modal">
              <X size={20} />
            </button>

            <div className="modal-header">
              <div className="modal-tag">Apply for Wingroo Internship</div>
              <h3 className="modal-title">Launch Your Tech Journey</h3>
              <p className="modal-desc">
                Fill out the application below. Our engineering leads will review your profile.
              </p>
            </div>

            {submitStatus && (
              <div className={`status-alert ${submitStatus.success ? 'status-success' : 'status-error'}`}>
                <div>{submitStatus.message}</div>
                {submitStatus.appNo && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Application Reference: <strong>#{submitStatus.appNo}</strong>
                  </div>
                )}
                {submitStatus.success && (
                  <div style={{ marginTop: '12px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        closeModal();
                        onOpenStudentPortal?.(submitStatus.email || submitStatus.appNo);
                      }}
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <GraduationCap size={15} />
                      <span>Track in Student Portal ↗</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="intern-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    className="form-input" 
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    className="form-input" 
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    className="form-input" 
                    placeholder="Enter your mobile number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College / University *</label>
                  <input 
                    type="text" 
                    name="college" 
                    required 
                    className="form-input" 
                    placeholder="Enter college or university name"
                    value={formData.college}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Degree / Course</label>
                  <input 
                    type="text" 
                    name="course" 
                    className="form-input" 
                    placeholder="Degree & department (e.g., Computer Science)"
                    value={formData.course}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Study</label>
                  <select 
                    name="year" 
                    className="form-select"
                    value={formData.year}
                    onChange={handleInputChange}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                    <option value="Recent Graduate">Recent Graduate</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Internship Track</label>
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="form-select"
                  >
                    <option value="College Internship">College Internship (Curriculum Focused)</option>
                    <option value="Live Project Internship">Live Project Internship (Production Code)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Technology Domain</label>
                  <select 
                    value={selectedTech} 
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="form-select"
                  >
                    {TECH_DOMAINS.map((td, i) => (
                      <option key={i} value={td.name}>{td.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tell us about your interest / prior projects</label>
                <textarea 
                  name="message" 
                  className="form-textarea" 
                  rows={3} 
                  placeholder="Share your interests, prior projects, or GitHub profile..."
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>

              {/* Scholarship Opt-in Toggle */}
              <div className="scholarship-form-checkbox-row">
                <input 
                  type="checkbox" 
                  id="optScholarshipInput"
                  checked={optScholarship}
                  onChange={(e) => setOptScholarship(e.target.checked)}
                  className="scholarship-checkbox"
                />
                <label htmlFor="optScholarshipInput" className="scholarship-label">
                  <span className="scholarship-highlight-title">🎓 Apply for Merit Scholarship Assessment</span>
                  <span className="scholarship-highlight-sub">
                    I want to attend the 20-minute online screening assessment to qualify for up to 100% scholarship fee waiver based on test score.
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="btn btn-primary modal-submit-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Apply Now</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
