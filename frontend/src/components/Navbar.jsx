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
          </div>
        </div>
      </div>
    </header>
  );
}
