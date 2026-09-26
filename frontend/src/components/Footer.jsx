import React from 'react';
import { 
  ArrowUp,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Lock
} from 'lucide-react';
import './Footer.css';

// Crisp SVG Icons for Social Media
const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default function Footer({ onOpenAdmin, onOpenStudentPortal }) {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Main Footer Row */}
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <div className="footer-brand" onClick={scrollToTop}>
              <div className="footer-logo-wrap">
                <img 
                  src="/logo.png" 
                  alt="Wingroo Technologies" 
                  className="footer-brand-logo" 
                />
              </div>
              <div className="footer-brand-text">
                <span className="brand-name">WINGROO</span>
                <span className="brand-sub">TECHNOLOGIES</span>
              </div>
            </div>

            <div className="footer-tagline">Build What's Next.</div>
            <p className="footer-core-pillars">
              Technology • Innovation • Experience • Opportunity
            </p>

            <div className="footer-social-links">
              <a 
                href="https://www.linkedin.com/in/wingroo-technologies?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-btn" 
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <LinkedinIcon />
              </a>
              <a 
                href="https://www.instagram.com/wingrootechnologies?stkn=MW5kY3ZwMGcweTlxNA==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-btn" 
                aria-label="Instagram"
                title="Instagram"
              >
                <InstagramIcon />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=100064696851817" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-btn" 
                aria-label="Facebook"
                title="Facebook"
              >
                <FacebookIcon />
              </a>
              <a 
                href="https://wa.me/919626779609" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-btn" 
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <WhatsappIcon />
              </a>
            </div>
          </div>

          {/* Navigation Col */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links-list">
              <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('#home'); }}>Home</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('#about'); }}>About</a></li>
              <li><a href="#services" onClick={(e) => { e.preventDefault(); scrollTo('#services'); }}>Services</a></li>
              <li><a href="#internship" onClick={(e) => { e.preventDefault(); scrollTo('#internship'); }}>Internship</a></li>
              <li><a href="#careers" onClick={(e) => { e.preventDefault(); scrollTo('#careers'); }}>Careers</a></li>
              <li><a href="#events" onClick={(e) => { e.preventDefault(); scrollTo('#events'); }}>Events</a></li>
              <li><a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollTo('#portfolio'); }}>Portfolio</a></li>
              <li>
                <a href="#student" onClick={(e) => { e.preventDefault(); onOpenStudentPortal?.(); }} style={{ color: '#38bdf8', fontWeight: 600 }}>
                  🎓 Student Portal
                </a>
              </li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('#contact'); }}>Contact</a></li>
            </ul>
          </div>

          {/* Featured Projects Col */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Featured Projects</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollTo('#portfolio'); }} className="featured-link">
                  <span>Zentime</span>
                  <span className="footer-chip">Mobile App</span>
                </a>
              </li>
              <li>
                <a href="#portfolio" onClick={(e) => { e.preventDefault(); scrollTo('#portfolio'); }} className="featured-link">
                  <span>IIE Plus</span>
                  <span className="footer-chip">Mobile App</span>
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollTo('#services'); }}>
                  Enterprise Solutions
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => { e.preventDefault(); scrollTo('#services'); }}>
                  AI Automation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Summary Col */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Headquarters</h4>
            <div className="footer-contact-info">
              <p><MapPin size={16} className="contact-icon" /> Coimbatore, Tamil Nadu, India</p>
              <p><Phone size={16} className="contact-icon" /> +91 81247 79111</p>
              <p><Mail size={16} className="contact-icon" /> info@wingrootechnologies.com</p>
            </div>
            <button onClick={scrollToTop} className="scroll-top-btn" title="Back to top">
              <span>Back to Top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © 2026 Wingroo Technologies. All Rights Reserved.
          </p>
          <div className="footer-bottom-sub">
            Built with modern technology & purposeful engineering.
          </div>
          {onOpenAdmin && (
            <button 
              onClick={onOpenAdmin} 
              className="footer-admin-link"
              title="Admin Portal (Password protected)"
            >
              <Lock size={12} />
              <span>Admin Access</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
