import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkles, LogIn, ShieldCheck } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Events', href: '#events' },
  { label: 'FAQs', href: '#faq-knowledge-hub' },
  { label: 'Careers', href: '#careers' },
  { label: 'Contact', href: '#contact' }
];

export default function Navbar({ onOpenLogin, onOpenAdmin, onOpenStudentPortal }) {
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
        <nav className="desktop-nav">
          {NAV_LINKS.map((link) => {
            const id = link.href.substring(1);
            const isActive = activeSection === id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`nav-link-item ${isActive ? 'nav-link-item-active' : ''}`}
              >
                {link.label}
                {isActive && <span className="nav-indicator" />}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <a
            href="/internship/verify"
            className="nav-verify-btn"
            title="Certificate & Verification Portal"
          >
            <ShieldCheck size={16} />
            <span>Certificate & Verification</span>
          </a>

          <button
            type="button"
            onClick={() => typeof onOpenLogin === 'function' ? onOpenLogin('student') : (onOpenStudentPortal && onOpenStudentPortal())}
            className="nav-login-btn"
            title="Access Candidate & Admin Login Portal"
          >
            <LogIn size={16} />
            <span>Login</span>
          </button>

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
          <div className="mobile-cta-wrapper">
            <a
              href="/internship/verify"
              className="mobile-verify-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShieldCheck size={16} />
              <span>Certificate & Verification</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (typeof onOpenLogin === 'function') onOpenLogin('student');
                else if (onOpenStudentPortal) onOpenStudentPortal();
              }}
              className="mobile-login-btn"
            >
              <LogIn size={16} />
              <span>Login Portal</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
