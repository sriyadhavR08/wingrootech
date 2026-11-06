import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Heart } from 'lucide-react';
import './DiwaliPopup.css';

/**
 * Diwali Whole-Page Celebration & Sky Crackers
 * 
 * Features:
 * - Whole-Page Sky Crackers: HTML5 Canvas transparently renders rockets & bursting fireworks across the ENTIRE viewport
 * - Works continuously whether the greeting modal is open or closed
 * - Non-intrusive: pointer-events none, 100% transparent clear (does not darken webpage)
 * - Ground Crackers: Spinning Zamin Chakkar (Left) & Sparkling Flowerpot Anar (Right)
 * - Triple Glowing Earthen Diyas with flickering flame animations
 * - Pure Festive Wishes (No Commercial Offers)
 * - Modular toggle via SHOW_DIWALI_POPUP in `src/App.jsx`
 */
export default function DiwaliPopup({ onOpenStudentPortal }) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return sessionStorage.getItem('wingroo_diwali_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  const canvasRef = useRef(null);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('wingroo_diwali_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleReopen = () => {
    setIsOpen(true);
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // =========================================================================
  // WHOLE-PAGE REALISTIC SKY CRACKERS & FIREWORKS (CANVAS 2D)
  // Transparent, non-blocking, bursts across the full page!
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Festive Color Palette for Diwali Sky Fireworks
    const colors = [
      '#FFD700', // Imperial Gold
      '#FF8800', // Amber Flame
      '#FF2E63', // Ruby Pink
      '#00F5D4', // Emerald Cyan
      '#9D4EDD', // Royal Violet
      '#38EF7D', // Vibrant Green
      '#FFFDF0', // Pure Diamond White
      '#FF5722'  // Deep Orange Red
    ];

    const rockets = [];
    const particles = [];

    class Rocket {
      constructor(startX, targetX, targetY, color) {
        this.x = startX;
        this.y = height + 10;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color;
        this.speed = 11 + Math.random() * 5;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.trail = [];
        this.exploded = false;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 8) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;

        // Explode when reached target height or apex
        if (this.vy < 0 && this.y <= this.targetY) {
          this.explode();
        }
      }

      draw() {
        ctx.save();
        // Rocket spark trail
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const trailAlpha = (i / this.trail.length) * 0.9;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.8 + i * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${trailAlpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#FF8800';
          ctx.fill();
        }

        // Rocket glowing tip
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 14;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }

      explode() {
        this.exploded = true;
        const count = 50 + Math.floor(Math.random() * 30);
        const burstColor = this.color;

        for (let i = 0; i < count; i++) {
          particles.push(new Particle(this.x, this.y, burstColor));
        }
      }
    }

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.0 + Math.random() * 7;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.friction = 0.94;
        this.gravity = 0.11;
        this.alpha = 1;
        this.decay = 0.012 + Math.random() * 0.015;
        this.size = 2.2 + Math.random() * 2.2;
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // Launch a rocket from bottom across the screen
    const launchRocket = () => {
      // Launch from anywhere across the entire bottom (10% to 90% of screen)
      const startX = width * 0.08 + Math.random() * (width * 0.84);
      // Target anywhere in the top 10% - 45% of the sky
      const targetX = startX + (Math.random() * 140 - 70);
      const targetY = height * 0.10 + Math.random() * (height * 0.35);
      const color = colors[Math.floor(Math.random() * colors.length)];

      rockets.push(new Rocket(startX, targetX, targetY, color));
    };

    // Initial festive burst
    launchRocket();
    setTimeout(launchRocket, 350);
    setTimeout(launchRocket, 800);

    let lastLaunch = Date.now();

    const loop = () => {
      // Crystal clear transparent erase so the full webpage underneath is 100% visible
      ctx.clearRect(0, 0, width, height);

      // Launch sky rockets across the whole page periodically
      const now = Date.now();
      if (now - lastLaunch > 1100 + Math.random() * 700) {
        launchRocket();
        // Occasional double sky rocket
        if (Math.random() > 0.6) {
          setTimeout(launchRocket, 180);
        }
        lastLaunch = now;
      }

      // Update & draw sky rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();
        if (r.exploded) {
          rockets.splice(i, 1);
        }
      }

      // Update & draw firework particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCelebrate = () => {
    handleClose();
    const section = document.getElementById('about') || document.getElementById('services');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. Whole-Page Sky Crackers Canvas Layer (Always active across the whole website) */}
      <canvas ref={canvasRef} className="diwali-whole-page-canvas" />

      {/* 2. Main Festive Modal Dialog */}
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
              <X size={20} />
            </button>

            {/* ========================================================
                LEFT GROUND CRACKER: Spinning Zamin Chakkar (தரைச்சக்கரம்)
               ======================================================== */}
            <div className="diwali-chakkar-wrapper" aria-hidden="true" title="Ground Chakkar (தரைச்சக்கரம்)">
              <div className="chakkar-sparks-ring" />
              <svg className="diwali-chakkar-wheel" viewBox="0 0 50 50" fill="none">
                <circle cx="25" cy="25" r="23" stroke="#F59E0B" strokeWidth="2.5" fill="#78350F" />
                <path d="M25 2L28 22L48 25L28 28L25 48L22 28L2 25L22 22Z" fill="url(#chakkarGrad)" />
                <circle cx="25" cy="25" r="5" fill="#FEF08A" />
                <defs>
                  <linearGradient id="chakkarGrad" x1="2" y1="2" x2="48" y2="48">
                    <stop stopColor="#FDE047" />
                    <stop offset="0.5" stopColor="#F59E0B" />
                    <stop offset="1" stopColor="#DC2626" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* ========================================================
                RIGHT GROUND CRACKER: Sparkling Flowerpot Anar (பூந்தொட்டி)
               ======================================================== */}
            <div className="diwali-anar-wrapper" aria-hidden="true" title="Flowerpot Fountain (பூந்தொட்டி)">
              <div className="anar-sparks-stream">
                <span className="anar-spark anar-s1" />
                <span className="anar-spark anar-s2" />
                <span className="anar-spark anar-s3" />
                <span className="anar-spark anar-s4" />
                <span className="anar-spark anar-s5" />
                <span className="anar-spark anar-s6" />
                <span className="anar-spark anar-s7" />
                <span className="anar-spark anar-s8" />
              </div>
              <div className="diwali-anar-flame-tip" />
              <svg className="diwali-anar-pot-svg" viewBox="0 0 52 48" fill="none">
                <path d="M26 6L8 44C7 46 8.5 47 11 47H41C43.5 47 45 46 44 44L26 6Z" fill="url(#anarGradRight)" stroke="#F59E0B" strokeWidth="1.5" />
                <path d="M14 36H38" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="2 2" />
                <path d="M18 26H34" stroke="#FDE047" strokeWidth="1.2" strokeDasharray="2 2" />
                <ellipse cx="26" cy="6" rx="6" ry="2" fill="#D97706" />
                <defs>
                  <linearGradient id="anarGradRight" x1="26" y1="6" x2="26" y2="47">
                    <stop stopColor="#92400E" />
                    <stop offset="0.5" stopColor="#B45309" />
                    <stop offset="1" stopColor="#78350F" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Top Festive Badge */}
            <div className="diwali-top-garland">
              <span className="diwali-garland-line" />
              <div className="diwali-festive-badge">
                <Sparkles size={13} />
                <span>Festival of Lights Celebration</span>
                <Sparkles size={13} />
              </div>
              <span className="diwali-garland-line" />
            </div>

            {/* Center Animated Diyas */}
            <div className="diwali-diya-hero-container">
              {/* Left Diya */}
              <div className="diwali-diya-side">
                <svg width="42" height="40" viewBox="0 0 50 48" fill="none">
                  <path className="diwali-flame" d="M25 4C25 4 17 14 17 21C17 25.4 20.6 29 25 29C29.4 29 33 25.4 33 21C33 14 25 4 25 4Z" fill="url(#flameGradLeft)" />
                  <path className="diwali-flame-inner" d="M25 11C25 11 20 17 20 21C20 23.8 22.2 26 25 26C27.8 26 30 23.8 30 21C30 17 25 11 25 11Z" fill="#FFFBEB" />
                  <path d="M5 28C8 38 18 44 25 44C32 44 42 38 45 28C39 33 11 33 5 28Z" fill="url(#diyaGoldLeft)" />
                  <ellipse cx="25" cy="28.5" rx="20" ry="4.5" fill="#B45309" />
                  <defs>
                    <linearGradient id="flameGradLeft" x1="25" y1="4" x2="25" y2="29">
                      <stop stopColor="#FDE047" />
                      <stop offset="0.5" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#DC2626" />
                    </linearGradient>
                    <linearGradient id="diyaGoldLeft" x1="5" y1="28" x2="45" y2="44">
                      <stop stopColor="#F59E0B" />
                      <stop offset="0.5" stopColor="#D97706" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Main Center Diya */}
              <div className="diwali-diya-main">
                <svg width="68" height="64" viewBox="0 0 50 48" fill="none">
                  <path className="diwali-flame" d="M25 3C25 3 16 13 16 21C16 26 20 30 25 30C30 30 34 26 34 21C34 13 25 3 25 3Z" fill="url(#mainFlameGrad)" />
                  <path className="diwali-flame-inner" d="M25 10C25 10 19 16 19 21C19 24.3 21.7 27 25 27C28.3 27 31 24.3 31 21C31 16 25 10 25 10Z" fill="#FFFBEB" />
                  <path d="M4 28C7 39 17 45 25 45C33 45 43 39 46 28C40 33.5 10 33.5 4 28Z" fill="url(#mainDiyaGold)" />
                  <ellipse cx="25" cy="28.5" rx="21" ry="5" fill="#92400E" />
                  <circle cx="25" cy="36" r="2.5" fill="#FDE047" opacity="0.9" />
                  <defs>
                    <linearGradient id="mainFlameGrad" x1="25" y1="3" x2="25" y2="30">
                      <stop stopColor="#FEF08A" />
                      <stop offset="0.45" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#EF4444" />
                    </linearGradient>
                    <linearGradient id="mainDiyaGold" x1="4" y1="28" x2="46" y2="45">
                      <stop stopColor="#FCD34D" />
                      <stop offset="0.4" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Right Diya */}
              <div className="diwali-diya-side">
                <svg width="42" height="40" viewBox="0 0 50 48" fill="none">
                  <path className="diwali-flame" d="M25 4C25 4 17 14 17 21C17 25.4 20.6 29 25 29C29.4 29 33 25.4 33 21C33 14 25 4 25 4Z" fill="url(#flameGradLeft)" />
                  <path className="diwali-flame-inner" d="M25 11C25 11 20 17 20 21C20 23.8 22.2 26 25 26C27.8 26 30 23.8 30 21C30 17 25 11 25 11Z" fill="#FFFBEB" />
                  <path d="M5 28C8 38 18 44 25 44C32 44 42 38 45 28C39 33 11 33 5 28Z" fill="url(#diyaGoldLeft)" />
                  <ellipse cx="25" cy="28.5" rx="20" ry="4.5" fill="#B45309" />
                </svg>
              </div>
            </div>

            {/* Festive Title */}
            <h2 className="diwali-main-title">Happy Diwali! 🪔✨</h2>
            <div className="diwali-tamil-title">இனிய தீபாவளி திருநாள் நல்வாழ்த்துகள்!</div>

            {/* Warm Greeting Text (PURE CELEBRATION - NO COMMERCIAL OFFER) */}
            <p className="diwali-greeting-body">
              May the divine festival of lights illuminate your life with boundless happiness, radiant health, and glorious success.
              <span className="diwali-brand-signature">
                ✨ Warm wishes from Wingroo Technologies & Team ✨
              </span>
            </p>

            {/* Action Buttons */}
            <div className="diwali-action-group">
              <button 
                type="button" 
                className="diwali-primary-btn" 
                onClick={handleCelebrate}
              >
                <Sparkles size={18} />
                <span>Celebrate Diwali with Us</span>
                <Heart size={18} fill="#fff" />
              </button>
              <button 
                type="button" 
                className="diwali-dismiss-link" 
                onClick={handleClose}
              >
                Enter Website 🪔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Floating Festive Diya Pill (When modal is closed) */}
      {!isOpen && (
        <button 
          type="button" 
          className="diwali-floating-pill" 
          onClick={handleReopen}
          title="Click to view Diwali Wishes"
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🪔</span>
          <span>Happy Diwali Wishes!</span>
        </button>
      )}
    </>
  );
}
