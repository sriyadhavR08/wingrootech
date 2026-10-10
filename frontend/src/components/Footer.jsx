import React, { useState } from 'react';
import { 
  ArrowUp,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Lock,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2
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

export default function Footer({ onOpenAdmin, onOpenStudentPortal, onOpenLogin }) {
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null

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
                href="https://wa.me/919626779608" 
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
              <li><a href="#events" onClick={(e) => { e.preventDefault(); scrollTo('#events'); }}>Events</a></li>
              <li><a href="#faq-knowledge-hub" onClick={(e) => { e.preventDefault(); scrollTo('#faq-knowledge-hub'); }}>FAQs</a></li>
              <li><a href="#careers" onClick={(e) => { e.preventDefault(); scrollTo('#careers'); }}>Careers</a></li>
              <li><a href="/internship">Internship & Verification</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('#contact'); }}>Contact</a></li>
            </ul>
          </div>

          {/* Featured Projects Col */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Featured Projects</h4>
            <ul className="footer-links-list">
              <li>
                <a href="https://zentime.co.in/#dashboard" target="_blank" rel="noopener noreferrer" className="featured-link" title="Open Zentime Dashboard">
                  <span>Zentime ↗</span>
                  <span className="footer-chip">Live App</span>
                </a>
              </li>
              <li>
                <a href="https://iiepulse.indrainstitute.com/" target="_blank" rel="noopener noreferrer" className="featured-link" title="Open IIE Pulse Platform">
                  <span>IIE Pulse ↗</span>
                  <span className="footer-chip">Web & Mobile</span>
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
              <p><Phone size={16} className="contact-icon" /> +91 96267 79608</p>
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

          {/* Legal Compliance Links */}
          <div className="footer-legal-links">
            <button 
              type="button" 
              onClick={() => setLegalModal('privacy')} 
              className="footer-legal-btn"
              title="Read our Privacy Policy"
            >
              Privacy Policy
            </button>
            <span className="footer-legal-dot">•</span>
            <button 
              type="button" 
              onClick={() => setLegalModal('terms')} 
              className="footer-legal-btn"
              title="Read our Terms of Service"
            >
              Terms of Service
            </button>
          </div>

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

      {/* Legal Modal Drawer */}
      {legalModal && (
        <div className="legal-modal-overlay" onClick={() => setLegalModal(null)}>
          <div 
            className="legal-modal-container" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="legal-modal-header">
              <div className="legal-modal-title-wrap">
                {legalModal === 'privacy' ? (
                  <ShieldCheck size={24} className="legal-modal-icon" />
                ) : (
                  <FileText size={24} className="legal-modal-icon" />
                )}
                <div>
                  <h3 className="legal-modal-title">
                    {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                  </h3>
                  <p className="legal-modal-subtitle">
                    Wingroo Technologies • Coimbatore, Tamil Nadu • Last Updated: October 2026
                  </p>
                </div>
              </div>
              <button 
                className="legal-modal-close"
                onClick={() => setLegalModal(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="legal-modal-body">
              {legalModal === 'privacy' ? (
                <div className="legal-content">
                  <div className="legal-highlight-box">
                    <p>
                      <strong>Summary:</strong> Wingroo Technologies is committed to safeguarding client intellectual property, proprietary business data, and student educational records. We do not sell or monetize personal data under any circumstances.
                    </p>
                  </div>

                  <section className="legal-section">
                    <h4>1. Information We Collect</h4>
                    <p>We collect information necessary to deliver high-quality technology solutions and educational services:</p>
                    <ul>
                      <li><strong>Client Enquiries:</strong> Business contact details, company name, scope of software requirements, and architectural preferences.</li>
                      <li><strong>Candidate & Intern Applications:</strong> Name, college affiliation, academic degree, contact email, phone number, and domain interests for verification and certification.</li>
                      <li><strong>Technical Usage:</strong> Aggregated anonymous web analytics to ensure optimal site performance, uptime, and accessibility.</li>
                    </ul>
                  </section>

                  <section className="legal-section">
                    <h4>2. Non-Disclosure & Intellectual Property Protection</h4>
                    <p>
                      For all custom software development and enterprise clients, Wingroo Technologies executes strict mutual Non-Disclosure Agreements (NDAs). Proprietary codebase, system architectures, credentials, and business logic remain the sole property of our clients.
                    </p>
                  </section>

                  <section className="legal-section">
                    <h4>3. Data Security & Storage</h4>
                    <p>
                      We utilize enterprise-grade encryption (TLS/SSL in transit, encrypted storage at rest), strict role-based access controls, and audited cloud infrastructures. Internal databases containing candidate applications or customer enquiries are isolated and accessible only by authorized personnel.
                    </p>
                  </section>

                  <section className="legal-section">
                    <h4>4. Third-Party Disclosures</h4>
                    <p>
                      Wingroo Technologies never rents, trades, or sells data to third-party advertisers. Data is only processed through trusted infrastructure providers (e.g., cloud hosting, email delivery) strictly bounded by data processing agreements.
                    </p>
                  </section>

                  <section className="legal-section">
                    <h4>5. Grievances & Contact</h4>
                    <p>
                      For privacy concerns or to request data rectification, write to us at:
                      <br />
                      <strong>Wingroo Technologies</strong>, Coimbatore, Tamil Nadu, India.
                      <br />
                      Email: <code>info@wingrootechnologies.com</code> | Phone: <code>+91 96267 79608</code>
                    </p>
                  </section>
                </div>
              ) : (
                <div className="legal-content">
                  <div className="legal-highlight-box">
                    <p>
                      <strong>Summary:</strong> These terms govern all software development contracts, consulting engagements, internship programs, and portal access provided by Wingroo Technologies.
                    </p>
                  </div>

                  <section className="legal-section">
                    <h4>1. Client Software Development Engagements</h4>
                    <ul>
                      <li><strong>Scope of Work (SOW):</strong> Project deliverables, timelines, milestones, and tech stacks are defined and mutually confirmed prior to project kickoff.</li>
                      <li><strong>Milestone Approvals:</strong> Clients inspect deliverables at each phase (Discover, Plan, Design, Develop, Launch). Production deployment proceeds upon client sign-off.</li>
                      <li><strong>IP Transfer:</strong> Full source code, deployment assets, and intellectual property are transferred completely to the client upon final milestone settlement.</li>
                    </ul>
                  </section>

                  <section className="legal-section">
                    <h4>2. Internship & Training Programs</h4>
                    <ul>
                      <li><strong>Eligibility & Conduct:</strong> Students must adhere to professional ethics, maintain project confidentiality, and submit required milestone reports.</li>
                      <li><strong>Certification:</strong> Official ISO 9001:2015 & MSME recognized completion certificates and Letters of Recommendation are awarded strictly upon verified project completion and mentor review.</li>
                      <li><strong>Academic Integrity:</strong> Plagiarism or unauthorized copying of open-source licenses is strictly prohibited.</li>
                    </ul>
                  </section>

                  <section className="legal-section">
                    <h4>3. Payment & Invoicing Terms</h4>
                    <p>
                      All invoices are denominated in INR (or mutually agreed international currency for overseas clients). Transparent milestone-based billing applies with zero hidden costs. Taxes (GST) are levied as applicable under Indian Law.
                    </p>
                  </section>

                  <section className="legal-section">
                    <h4>4. Limitation of Liability & Warranty</h4>
                    <p>
                      Wingroo Technologies provides a post-launch warranty period (as defined in the specific client agreement) covering bug fixes and maintenance for delivered software scopes. Wingroo Technologies is not liable for downstream indirect damages or third-party service outages.
                    </p>
                  </section>

                  <section className="legal-section">
                    <h4>5. Governing Law & Jurisdiction</h4>
                    <p>
                      These terms and any agreements entered into with Wingroo Technologies shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in <strong>Coimbatore, Tamil Nadu, India</strong>.
                    </p>
                  </section>
                </div>
              )}
            </div>

            <div className="legal-modal-footer">
              <button 
                type="button" 
                className="legal-modal-action-btn"
                onClick={() => setLegalModal(null)}
              >
                <CheckCircle2 size={16} />
                <span>I Understand & Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
