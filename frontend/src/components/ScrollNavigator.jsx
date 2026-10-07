import React, { useState, useEffect } from 'react';
import './ScrollNavigator.css';

const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'internship', label: 'Internship' },
  { id: 'events', label: 'Events' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq-knowledge-hub', label: 'FAQs' },
  { id: 'careers', label: 'Careers' },
  { id: 'contact', label: 'Contact' }
];

export default function ScrollNavigator() {
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredSection, setHoveredSection] = useState(null);
  const [showMobileBadge, setShowMobileBadge] = useState(false);
  const [isFooterReached, setIsFooterReached] = useState(false);

  useEffect(() => {
    let hideTimeout;

    const handleScroll = () => {
      // Check if user has scrolled down into the footer
      const footerEl = document.querySelector('.site-footer') || document.querySelector('footer');
      const isFooterNow = footerEl ? footerEl.getBoundingClientRect().top <= window.innerHeight * 0.62 : false;
      setIsFooterReached(isFooterNow);

      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(prev => {
              if (prev !== SECTIONS[i].id) {
                if (!isFooterNow) {
                  setShowMobileBadge(true);
                  clearTimeout(hideTimeout);
                  hideTimeout = setTimeout(() => setShowMobileBadge(false), 2400);
                }
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
      {/* Desktop Minimalist Single Line Navigator */}
      <nav className={`line-navigator-dock ${isFooterReached ? 'dock-hidden' : ''}`} aria-label="Section navigation">
        <div className="line-navigator-spine">
          {/* Section Markers along the invisible line */}
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            const isHovered = hoveredSection === sec.id;

            return (
              <div 
                key={sec.id} 
                className={`line-node ${isActive ? 'active' : ''}`}
                onMouseEnter={() => setHoveredSection(sec.id)}
                onMouseLeave={() => setHoveredSection(null)}
                onClick={() => scrollTo(sec.id)}
                title={sec.label}
              >
                {/* Node Pip on the single line */}
                <span className="line-pip" />

                {/* Section Name Label (Appears neatly beside the line) */}
                <div className={`line-label-wrap ${isActive || isHovered ? 'visible' : ''}`}>
                  <span className="line-label-text">{sec.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Mobile Subtle Section Toast Badge (No numbers, hidden on footer) */}
      <div className={`mobile-section-badge ${showMobileBadge && !isFooterReached ? 'visible' : ''}`}>
        <div className="mobile-badge-pill" onClick={() => scrollTo(currentSecObj.id)}>
          <span className="mb-dot" />
          <span className="mb-label">{currentSecObj.label}</span>
        </div>
      </div>
    </>
  );
}
