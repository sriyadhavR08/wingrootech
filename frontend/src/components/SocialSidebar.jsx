import React, { useState, useEffect } from 'react';
import './SocialSidebar.css';

// Crisp SVG Icons
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

const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const SIDEBAR_LINKS = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    label: 'Connect on LinkedIn',
    href: 'https://www.linkedin.com/in/wingroo-technologies?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    icon: LinkedinIcon,
    color: '#0077b5'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    label: 'Follow on Instagram',
    href: 'https://www.instagram.com/wingrootechnologies?stkn=MW5kY3ZwMGcweTlxNA==',
    icon: InstagramIcon,
    color: '#e1306c'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    label: 'Chat on WhatsApp',
    href: 'https://wa.me/919626779609',
    icon: WhatsappIcon,
    color: '#25d366'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    label: 'Visit Facebook Page',
    href: 'https://www.facebook.com/profile.php?id=100064696851817',
    icon: FacebookIcon,
    color: '#1877f2'
  }
];

export default function SocialSidebar() {
  const [hoveredId, setHoveredId] = useState(null);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    const handleCheckFooter = () => {
      const footer = document.querySelector('footer') || document.querySelector('.site-footer');
      if (!footer) return;

      const rect = footer.getBoundingClientRect();
      // If footer top is approaching or within the viewport
      if (rect.top <= window.innerHeight - 40) {
        setIsNearFooter(true);
      } else {
        setIsNearFooter(false);
      }
    };

    window.addEventListener('scroll', handleCheckFooter, { passive: true });
    window.addEventListener('resize', handleCheckFooter, { passive: true });
    handleCheckFooter();

    return () => {
      window.removeEventListener('scroll', handleCheckFooter);
      window.removeEventListener('resize', handleCheckFooter);
    };
  }, []);

  return (
    <aside 
      className={`social-side-dock ${isNearFooter ? 'social-side-dock-hidden' : ''}`} 
      aria-label="Social Media Quick Links"
    >
      <div className="social-dock-pill">
        <span className="social-dock-tag">CONNECT</span>
        <div className="social-dock-divider" />
        
        {SIDEBAR_LINKS.map((item) => {
          const IconComponent = item.icon;
          const isHovered = hoveredId === item.id;

          return (
            <div 
              key={item.id} 
              className="social-dock-item-wrapper"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-dock-link social-${item.id}`}
                aria-label={item.name}
                title={item.name}
              >
                <span className="social-dock-icon">
                  <IconComponent />
                </span>
              </a>

              {/* Flyout Label Tooltip */}
              <div className={`social-dock-tooltip ${isHovered ? 'tooltip-visible' : ''}`}>
                <span className="tooltip-arrow" />
                <span className="tooltip-text">{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
