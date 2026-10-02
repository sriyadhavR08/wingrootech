import React, { useState, useEffect } from 'react';
import './ScrollNavigator.css';

const SECTIONS = [
  { id: 'home', label: 'Home', num: '01' },
  { id: 'about', label: 'About', num: '02' },
  { id: 'services', label: 'Services', num: '03' },
  { id: 'internship', label: 'Internship', num: '04' },
  { id: 'careers', label: 'Careers', num: '05' },
  { id: 'events', label: 'Events', num: '06' },
  { id: 'portfolio', label: 'Portfolio', num: '07' },
  { id: 'reviews', label: 'Reviews', num: '08' },
  { id: 'faq-knowledge-hub', label: 'FAQs Hub', num: '09' },
  { id: 'contact', label: 'Contact', num: '10' }
];

export default function ScrollNavigator() {
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredSection, setHoveredSection] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showMobileBadge, setShowMobileBadge] = useState(false);

  useEffect(() => {
    let hideTimeout;

    const handleScroll = () => {
      // Calculate overall scroll progress (0 to 100%)
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(Math.max(currentProgress, 0), 100));
      }

      // Detect active section based on scroll offset
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(prev => {
              if (prev !== SECTIONS[i].id) {
                setShowMobileBadge(true);
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(() => setShowMobileBadge(false), 2600);
                return SECTIONS[i].id;
              }
              return prev;
            });
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(hideTimeout);
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentSecObj = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <>
      {/* Top Thin Reading Progress Bar (Visible on all devices) */}
      <div 
        className="global-reading-progress" 
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
        aria-hidden="true"
      />

      {/* Desktop Floating Right-Side Scroll Navigator */}
      <nav className="scroll-navigator-dock" aria-label="Section navigation">
        <div className="scroll-navigator-track">
          {/* Vertical Track Fill */}
          <div className="navigator-progress-line">
            <div 
              className="navigator-progress-fill" 
              style={{ height: `${scrollProgress}%` }}
            />
          </div>

          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            const isHovered = hoveredSection === sec.id;

            return (
              <div 
                key={sec.id} 
                className={`nav-dot-wrapper ${isActive ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSection(sec.id)}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <button
                  type="button"
                  className={`nav-dot ${isActive ? 'dot-active' : ''}`}
                  onClick={() => scrollTo(sec.id)}
                  aria-label={`Scroll to ${sec.label}`}
                  title={`${sec.num} • ${sec.label}`}
                >
                  <span className="dot-inner" />
                </button>

                {/* Glassmorphism Section Label Tooltip */}
                <div 
                  className={`nav-dot-tooltip ${isActive || isHovered ? 'tooltip-visible' : ''}`}
                  onClick={() => scrollTo(sec.id)}
                >
                  <span className="tooltip-num">{sec.num}</span>
                  <span className="tooltip-label">{sec.label}</span>
                  {isActive && <span className="tooltip-active-pulse" />}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Mobile Dynamic Section Toast Badge (Smoothly informs mobile users of current section) */}
      <div className={`mobile-section-badge ${showMobileBadge ? 'visible' : ''}`}>
        <div className="mobile-badge-pill" onClick={() => scrollTo(currentSecObj.id)}>
          <span className="mb-dot" />
          <span className="mb-num">{currentSecObj.num}</span>
          <span className="mb-label">{currentSecObj.label}</span>
        </div>
      </div>
    </>
  );
}
