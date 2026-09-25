import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Internship', href: '#internship' },
  { label: 'Events', href: '#events' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contact', href: '#contact' }
];

// Social SVG Icons
const LinkedinNavIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramNavIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookNavIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const WhatsappNavIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const SOCIAL_LINKS = [
  { name: 'LinkedIn', icon: LinkedinNavIcon, href: 'https://www.linkedin.com/in/wingroo-technologies?utm_source=share_via&utm_content=profile&utm_medium=member_android', cls: 'social-nav-li' },
  { name: 'Instagram', icon: InstagramNavIcon, href: 'https://www.instagram.com/wingrootechnologies?stkn=MW5kY3ZwMGcweTlxNA==', cls: 'social-nav-ig' },
  { name: 'WhatsApp', icon: WhatsappNavIcon, href: 'https://wa.me/919626779609', cls: 'social-nav-wa' },
  { name: 'Facebook', icon: FacebookNavIcon, href: 'https://www.facebook.com/profile.php?id=100064696851817', cls: 'social-nav-fb' }
];

export default function Navbar({ onOpenAdmin, onOpenStudentPortal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Section spy
      const sections = NAV_LINKS.map(link => link.href.substring(1));
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar-header ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Official Brand Logo */}
        <a 
          href="#home" 
          className="navbar-brand" 
          onClick={(e) => handleLinkClick(e, '#home')}
        >
          <img 
            src="/logo.png" 
            alt="Wingroo Technologies" 
            className="navbar-brand-logo" 
          />
          <div className="brand-text">
            <span className="brand-title">WINGROO</span>
            <span className="brand-subtitle">TECHNOLOGIES</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav">
          {NAV_LINKS.map((link) => {
            const id = link.href.substring(1);
            const isActive = activeSection === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {link.label}
                {isActive && <span className="nav-indicator" />}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="navbar-actions">
          {/* Animated Social Icon Strip */}
          <div className="navbar-social-strip">
            {SOCIAL_LINKS.map(s => {
              const IconComp = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`nav-social-btn ${s.cls}`}
                  aria-label={s.name}
                  title={s.name}
                >
                  <IconComp />
                </a>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onOpenStudentPortal?.()}
            className="btn btn-outline nav-student-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.82rem',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(14, 165, 233, 0.1)',
              borderColor: 'rgba(14, 165, 233, 0.3)',
              color: '#38bdf8'
            }}
          >
            <GraduationCap size={15} />
            <span>Student Portal</span>
          </button>

          <a
            href="#contact"
            onClick={(e) => handleLinkClick(e, '#contact')}
            className="btn btn-primary nav-cta-btn"
          >
            <span>Let's Talk</span>
            <ArrowRight size={16} />
          </a>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'mobile-nav-open' : ''}`}>
        <div className="mobile-nav-inner">
          {NAV_LINKS.map((link) => {
            const id = link.href.substring(1);
            const isActive = activeSection === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}
              >
                <span>{link.label}</span>
                {isActive && <span className="mobile-active-dot" />}
              </a>
            );
          })}
          <div className="mobile-cta-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStudentPortal?.();
              }}
              className="btn btn-outline btn-block"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <GraduationCap size={16} />
              <span>Student Portal</span>
            </button>
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="btn btn-primary btn-block"
            >
              <span>Let's Talk</span>
              <ArrowRight size={16} />
            </a>

            {/* Mobile Social Strip */}
            <div className="mobile-nav-socials">
              {SOCIAL_LINKS.map(s => {
                const IconComp = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`nav-social-btn ${s.cls}`}
                    aria-label={s.name}
                    title={s.name}
                  >
                    <IconComp />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
