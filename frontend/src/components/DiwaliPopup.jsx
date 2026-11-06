import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, Gift } from 'lucide-react';
import './DiwaliPopup.css';

/**
 * Diwali Festive Popup Modal with Two-Sided Sparkling Animated Crackers
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
            {/* Top Hanging Decorative Marigold Toran */}
            <div className="diwali-hanging-toran" aria-hidden="true">
              <span className="toran-leaf" />
              <span className="toran-leaf" />
              <span className="toran-leaf" />
              <span className="toran-leaf" />
              <span className="toran-leaf" />
              <span className="toran-leaf" />
              <span className="toran-leaf" />
              <span className="toran-leaf" />
            </div>

            {/* Close Button */}
            <button 
              type="button" 
              className="diwali-close-btn" 
              onClick={handleClose}
              aria-label="Close Diwali Popup"
            >
              <X size={18} />
            </button>

            {/* ========================================================
                LEFT SIDE SPARKLING CRACKERS & FOUNTAIN
               ======================================================== */}
            {/* Top-Left Aerial Starburst */}
            <div className="diwali-aerial-cracker diwali-aerial-left" aria-hidden="true">
              <div className="diwali-burst-ring" />
              <span className="diwali-star-spark star-1" />
              <span className="diwali-star-spark star-2" />
              <span className="diwali-star-spark star-3" />
              <span className="diwali-star-spark star-4" />
              <span className="diwali-star-spark star-5" />
              <span className="diwali-star-spark star-6" />
              <span className="diwali-star-spark star-7" />
              <span className="diwali-star-spark star-8" />
            </div>

            {/* Bottom-Left Sparkling Anar / Flowerpot Fountain */}
            <div className="diwali-side-cracker diwali-cracker-left" aria-hidden="true">
              <div className="diwali-fountain-stream">
                <span className="spark-p spark-left-1" />
                <span className="spark-p spark-left-2" />
                <span className="spark-p spark-left-3" />
                <span className="spark-p spark-left-4" />
                <span className="spark-p spark-left-5" />
                <span className="spark-p spark-left-6" />
                <span className="spark-p spark-left-7" />
                <span className="spark-p spark-left-8" />
                <span className="spark-p spark-left-9" />
                <span className="spark-p spark-left-10" />
              </div>
              <div className="diwali-anar-pot">
                <div className="diwali-anar-nozzle" />
                <svg className="diwali-anar-body" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M26 6L8 44C7 46 8.5 47 11 47H41C43.5 47 45 46 44 44L26 6Z" fill="url(#potGradLeft)" stroke="#F59E0B" strokeWidth="1.5" />
                  <path d="M14 36H38" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="2 2" />
                  <path d="M18 26H34" stroke="#FDE047" strokeWidth="1.2" strokeDasharray="2 2" />
                  <ellipse cx="26" cy="6" rx="6" ry="2" fill="#D97706" />
                  <defs>
                    <linearGradient id="potGradLeft" x1="26" y1="6" x2="26" y2="47" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#92400E" />
                      <stop offset="0.5" stopColor="#B45309" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* ========================================================
                RIGHT SIDE SPARKLING CRACKERS & FOUNTAIN
               ======================================================== */}
            {/* Top-Right Aerial Starburst */}
            <div className="diwali-aerial-cracker diwali-aerial-right" aria-hidden="true">
              <div className="diwali-burst-ring" style={{ animationDelay: '0.8s' }} />
              <span className="diwali-star-spark star-1" style={{ animationDelay: '0.9s' }} />
              <span className="diwali-star-spark star-2" style={{ animationDelay: '0.9s' }} />
              <span className="diwali-star-spark star-3" style={{ animationDelay: '0.9s' }} />
              <span className="diwali-star-spark star-4" style={{ animationDelay: '0.9s' }} />
              <span className="diwali-star-spark star-5" style={{ animationDelay: '0.9s' }} />
              <span className="diwali-star-spark star-6" style={{ animationDelay: '0.9s' }} />
              <span className="diwali-star-spark star-7" style={{ animationDelay: '0.9s' }} />
              <span className="diwali-star-spark star-8" style={{ animationDelay: '0.9s' }} />
            </div>

            {/* Bottom-Right Sparkling Anar / Flowerpot Fountain */}
            <div className="diwali-side-cracker diwali-cracker-right" aria-hidden="true">
              <div className="diwali-fountain-stream">
                <span className="spark-p spark-right-1" />
                <span className="spark-p spark-right-2" />
                <span className="spark-p spark-right-3" />
                <span className="spark-p spark-right-4" />
                <span className="spark-p spark-right-5" />
                <span className="spark-p spark-right-6" />
                <span className="spark-p spark-right-7" />
                <span className="spark-p spark-right-8" />
                <span className="spark-p spark-right-9" />
                <span className="spark-p spark-right-10" />
              </div>
              <div className="diwali-anar-pot">
                <div className="diwali-anar-nozzle" />
                <svg className="diwali-anar-body" viewBox="0 0 52 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M26 6L8 44C7 46 8.5 47 11 47H41C43.5 47 45 46 44 44L26 6Z" fill="url(#potGradRight)" stroke="#F59E0B" strokeWidth="1.5" />
                  <path d="M14 36H38" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="2 2" />
                  <path d="M18 26H34" stroke="#FDE047" strokeWidth="1.2" strokeDasharray="2 2" />
                  <ellipse cx="26" cy="6" rx="6" ry="2" fill="#D97706" />
                  <defs>
                    <linearGradient id="potGradRight" x1="26" y1="6" x2="26" y2="47" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#92400E" />
                      <stop offset="0.5" stopColor="#B45309" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Top Festive Badge */}
            <div className="diwali-top-garland">
              <span className="diwali-garland-line" />
              <div className="diwali-festive-badge">
                <Sparkles size={12} />
                <span>Festival of Lights Celebration</span>
                <Sparkles size={12} />
              </div>
              <span className="diwali-garland-line" />
            </div>

            {/* Center Animated Diyas */}
            <div className="diwali-diya-hero-container">
              {/* Left Diya */}
              <div className="diwali-diya-side">
                <svg width="42" height="40" viewBox="0 0 50 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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

              {/* Main Center Diya */}
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

              {/* Right Diya */}
              <div className="diwali-diya-side">
                <svg width="42" height="40" viewBox="0 0 50 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="diwali-flame" d="M25 4C25 4 17 14 17 21C17 25.4 20.6 29 25 29C29.4 29 33 25.4 33 21C33 14 25 4 25 4Z" fill="url(#flameGradient)" />
                  <path className="diwali-flame-inner" d="M25 11C25 11 20 17 20 21C20 23.8 22.2 26 25 26C27.8 26 30 23.8 30 21C30 17 25 11 25 11Z" fill="#FFFBEB" />
                  <path d="M5 28C8 38 18 44 25 44C32 44 42 38 45 28C39 33 11 33 5 28Z" fill="url(#diyaGold)" />
                  <ellipse cx="25" cy="28.5" rx="20" ry="4.5" fill="#B45309" />
                </svg>
              </div>
            </div>

            {/* Festive Title */}
            <h2 className="diwali-main-title">Happy Diwali! ✨</h2>
            <div className="diwali-tamil-title">இனிய தீபாவளி திருநாள் நல்வாழ்த்துகள்!</div>

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
