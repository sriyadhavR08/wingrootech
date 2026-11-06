import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Gift } from 'lucide-react';
import './DiwaliPopup.css';

/**
 * Diwali Festive Popup Modal
 * 
 * To remove or disable anytime:
 * Simply set `SHOW_DIWALI_POPUP = false` in `src/App.jsx` or remove `<DiwaliPopup />`.
 */
export default function DiwaliPopup({ onOpenStudentPortal }) {
  // Check if previously dismissed in this browser session
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return sessionStorage.getItem('wingroo_diwali_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  // Handle closing modal
  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('wingroo_diwali_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  // Re-open from floating pill
  const handleReopen = () => {
    setIsOpen(true);
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleActionClick = () => {
    handleClose();
    // Scroll smoothly to internship / programs section or open portal
    const section = document.getElementById('internship') || document.getElementById('programs') || document.getElementById('services');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else if (onOpenStudentPortal) {
      onOpenStudentPortal();
    }
  };

  return (
    <>
      {/* 1. Main Modal Dialog */}
      {isOpen && (
        <div 
          className="diwali-popup-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Happy Diwali Greetings"
        >
          <div className="diwali-popup-container">
            {/* Ambient Background Sparkles */}
            <div className="diwali-ambient-sparkles" />

            {/* Close Button */}
            <button 
              type="button" 
              className="diwali-close-btn" 
              onClick={handleClose}
              aria-label="Close Diwali Popup"
            >
              <X size={18} />
            </button>

            {/* Top Garland & Badge */}
            <div className="diwali-top-garland">
              <span className="diwali-garland-line" />
              <div className="diwali-festive-badge">
                <Sparkles size={12} />
                <span>Festival of Lights</span>
                <Sparkles size={12} />
              </div>
              <span className="diwali-garland-line" />
            </div>

            {/* Animated Diya Art */}
            <div className="diwali-diya-hero-container">
              {/* Left Small Diya */}
              <div className="diwali-diya-side">
                <svg width="44" height="42" viewBox="0 0 50 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="diwali-flame" d="M25 4C25 4 17 14 17 21C17 25.4 20.6 29 25 29C29.4 29 33 25.4 33 21C33 14 25 4 25 4Z" fill="url(#flameGradient)" />
                  <path className="diwali-flame-inner" d="M25 11C25 11 20 17 20 21C20 23.8 22.2 26 25 26C27.8 26 30 23.8 30 21C30 17 25 11 25 11Z" fill="#FFFBEB" />
                  <path d="M5 28C8 38 18 44 25 44C32 44 42 38 45 28C39 33 11 33 5 28Z" fill="url(#diyaGold)" />
                  <ellipse cx="25" cy="28.5" rx="20" ry="4.5" fill="#B45309" />
                  <defs>
                    <linearGradient id="flameGradient" x1="25" y1="4" x2="25" y2="29" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FDE047" />
                      <stop offset="0.5" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#DC2626" />
                    </linearGradient>
                    <linearGradient id="diyaGold" x1="5" y1="28" x2="45" y2="44" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F59E0B" />
                      <stop offset="0.5" stopColor="#D97706" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Center Main Diya */}
              <div className="diwali-diya-main">
                <svg width="68" height="64" viewBox="0 0 50 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="diwali-flame" d="M25 3C25 3 16 13 16 21C16 26 20 30 25 30C30 30 34 26 34 21C34 13 25 3 25 3Z" fill="url(#mainFlameGrad)" />
                  <path className="diwali-flame-inner" d="M25 10C25 10 19 16 19 21C19 24.3 21.7 27 25 27C28.3 27 31 24.3 31 21C31 16 25 10 25 10Z" fill="#FFFBEB" />
                  <path d="M4 28C7 39 17 45 25 45C33 45 43 39 46 28C40 33.5 10 33.5 4 28Z" fill="url(#mainDiyaGold)" />
                  <ellipse cx="25" cy="28.5" rx="21" ry="5" fill="#92400E" />
                  <circle cx="25" cy="36" r="2.5" fill="#FDE047" opacity="0.85" />
                  <defs>
                    <linearGradient id="mainFlameGrad" x1="25" y1="3" x2="25" y2="30" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FEF08A" />
                      <stop offset="0.45" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#EF4444" />
                    </linearGradient>
                    <linearGradient id="mainDiyaGold" x1="4" y1="28" x2="46" y2="45" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FCD34D" />
                      <stop offset="0.4" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Right Small Diya */}
              <div className="diwali-diya-side">
                <svg width="44" height="42" viewBox="0 0 50 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="diwali-flame" d="M25 4C25 4 17 14 17 21C17 25.4 20.6 29 25 29C29.4 29 33 25.4 33 21C33 14 25 4 25 4Z" fill="url(#flameGradient)" />
                  <path className="diwali-flame-inner" d="M25 11C25 11 20 17 20 21C20 23.8 22.2 26 25 26C27.8 26 30 23.8 30 21C30 17 25 11 25 11Z" fill="#FFFBEB" />
                  <path d="M5 28C8 38 18 44 25 44C32 44 42 38 45 28C39 33 11 33 5 28Z" fill="url(#diyaGold)" />
                  <ellipse cx="25" cy="28.5" rx="20" ry="4.5" fill="#B45309" />
                </svg>
              </div>
            </div>

            {/* Festive Title */}
            <h2 className="diwali-main-title">Happy Diwali! ✨</h2>
            <div className="diwali-tamil-title">இனிய தீபாவளி நல்வாழ்த்துகள்!</div>

            {/* Warm Greeting Text */}
            <p className="diwali-greeting-body">
              May this divine festival of lights spark boundless joy, good health, and stellar success in your tech journey. Wingroo Technologies wishes you and your family a bright and prosperous Diwali!
            </p>

            {/* Special Festive Offer Badge */}
            <div className="diwali-offer-card">
              <div className="diwali-offer-left">
                <div className="diwali-offer-icon">
                  <Gift size={20} />
                </div>
                <div>
                  <div className="diwali-offer-title">Festive Tech Scholarship</div>
                  <div className="diwali-offer-sub">Flat 20% off on all Industry Internships & AI Certifications</div>
                </div>
              </div>
              <div className="diwali-coupon-badge">
                DIWALI2026
              </div>
            </div>

            {/* Action Buttons */}
            <div className="diwali-action-group">
              <button 
                type="button" 
                className="diwali-primary-btn" 
                onClick={handleActionClick}
              >
                <span>Explore Programs & Offers</span>
                <ArrowRight size={17} />
              </button>
              <button 
                type="button" 
                className="diwali-dismiss-link" 
                onClick={handleClose}
              >
                Continue to Website
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Festive Diya Pill (Shown when modal is dismissed, allows user to re-read wishes) */}
      {!isOpen && (
        <button 
          type="button" 
          className="diwali-floating-pill" 
          onClick={handleReopen}
          title="Click to view Diwali Wishes & Festive Offer"
        >
          <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>🪔</span>
          <span>Happy Diwali Offers!</span>
        </button>
      )}
    </>
  );
}
