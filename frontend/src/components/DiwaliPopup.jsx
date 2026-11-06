import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Heart } from 'lucide-react';
import './DiwaliPopup.css';

/**
 * Diwali Celebration Popup Modal with Big Sky Crackers & Realistic Booshvanam
 * 
 * Features:
 * - Big Sky Crackers: Heavy continuous rocket launches & grand multi-color aerial explosions
 * - Realistic Booshvanam (Flowerpot Fountain): Roaring physics-based fountain spraying hundreds
 *   of golden sparkling embers high into the air on both sides!
 * - Pure Festive Wishes: No commercial offers or coupons
 * - Clean cleanup on close & single-flag modular removal
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
  // REALISTIC BIG SKY CRACKERS & BOOSHVANAM ENGINE (HTML5 CANVAS 2D)
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

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

    // Radiant festive palette for Sky Fireworks
    const skyColors = [
      '#FFD700', // Imperial Gold
      '#FF8C00', // Amber Orange
      '#FF1E56', // Ruby Crimson
      '#00F5D4', // Emerald Neon
      '#9D4EDD', // Royal Violet
      '#00E5FF', // Electric Cyan
      '#39FF14', // Neon Green
      '#FFFDF0', // Pure Diamond White
      '#FF007F'  // Vibrant Rose
    ];

    const rockets = [];
    const skyParticles = [];
    const booshvanamSparks = [];
    const flashWaves = [];

    // -----------------------------------------------------------------------
    // 1. BIG SKY ROCKETS & AERIAL EXPLOSIONS
    // -----------------------------------------------------------------------
    class SkyRocket {
      constructor(startX, targetX, targetY, color) {
        this.x = startX;
        this.y = height + 10;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color;
        this.speed = 13 + Math.random() * 6;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.trail = [];
        this.exploded = false;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > 9) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;

        // Apex explosion
        if (this.vy < 0 && this.y <= this.targetY) {
          this.explode();
        }
      }

      draw() {
        ctx.save();
        // Fiery golden rocket trail
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const trailAlpha = (i / this.trail.length) * 0.95;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.2 + i * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${trailAlpha})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#FF8C00';
          ctx.fill();
        }

        // Rocket Head Flash
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 18;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }

      explode() {
        this.exploded = true;
        // Big heavy explosion: 80 - 130 particles
        const count = 85 + Math.floor(Math.random() * 45);
        const burstColor = this.color;

        // Sky flash shockwave
        flashWaves.push({
          x: this.x,
          y: this.y,
          radius: 20,
          color: burstColor,
          alpha: 0.55
        });

        // 3 Explosion Styles: Willow, Radial Starburst, Ring
        const styleChoice = Math.random();

        for (let i = 0; i < count; i++) {
          skyParticles.push(new SkyParticle(this.x, this.y, burstColor, styleChoice));
        }
      }
    }

    class SkyParticle {
      constructor(x, y, color, styleChoice) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.style = styleChoice;
        const angle = Math.random() * Math.PI * 2;
        // Faster and larger expansion for big crackers
        const speed = styleChoice > 0.65 
          ? (3.0 + Math.random() * 10)  // Big Starburst
          : (2.0 + Math.random() * 7);   // Golden Willow Rain

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.friction = 0.93;
        this.gravity = styleChoice < 0.4 ? 0.16 : 0.11; // Willow drops faster like gold rain
        this.alpha = 1;
        this.decay = 0.009 + Math.random() * 0.014;
        this.size = 2.4 + Math.random() * 2.8;
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
        ctx.shadowBlur = 14;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // -----------------------------------------------------------------------
    // 2. REALISTIC BOOSHVANAM (FLOWERPOT FOUNTAIN) PHYSICS
    // Shoots hundreds of golden sparks high upwards from the nozzles
    // -----------------------------------------------------------------------
    class BooshvanamSpark {
      constructor(nozzleX, nozzleY) {
        this.x = nozzleX + (Math.random() * 6 - 3);
        this.y = nozzleY;
        // Shoots high into the sky: 150px - 260px!
        const upwardForce = 8 + Math.random() * 10.5;
        const spreadAngle = (Math.random() - 0.5) * 5.5; // Fan out spray
        this.vx = spreadAngle;
        this.vy = -upwardForce;
        this.gravity = 0.22; // Gravity pulls embers down
        this.friction = 0.985;
        this.alpha = 1;
        this.decay = 0.014 + Math.random() * 0.018;
        this.size = 2.0 + Math.random() * 2.4;

        // Realistic Diwali Booshvanam ember color spectrum:
        // White-hot core -> Golden yellow -> Amber orange -> Crimson red
        const rand = Math.random();
        if (rand < 0.25) this.color = '#FFFFFF';
        else if (rand < 0.65) this.color = '#FFD700';
        else if (rand < 0.88) this.color = '#FF9100';
        else this.color = '#FF2A2A';
      }

      update() {
        this.vx *= this.friction;
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
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // Launch heavy sky rockets across the screen
    const launchHeavyRocket = () => {
      // Launch across left, center, right
      const startX = width * 0.05 + Math.random() * (width * 0.90);
      const targetX = startX + (Math.random() * 160 - 80);
      const targetY = height * 0.08 + Math.random() * (height * 0.38);
      const color = skyColors[Math.floor(Math.random() * skyColors.length)];

      rockets.push(new SkyRocket(startX, targetX, targetY, color));
    };

    // Initial festive burst volley
    launchHeavyRocket();
    setTimeout(launchHeavyRocket, 250);
    setTimeout(launchHeavyRocket, 550);
    setTimeout(launchHeavyRocket, 900);

    let lastRocketTime = Date.now();

    // -----------------------------------------------------------------------
    // MAIN RENDER & PHYSICS LOOP
    // -----------------------------------------------------------------------
    const loop = () => {
      // Soft semi-transparent trail clear for glowing light tails
      ctx.fillStyle = 'rgba(6, 3, 14, 0.24)';
      ctx.fillRect(0, 0, width, height);

      // 1. Sky Flash Shockwaves
      for (let i = flashWaves.length - 1; i >= 0; i--) {
        const wave = flashWaves[i];
        ctx.save();
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${wave.alpha})`;
        ctx.shadowBlur = 40;
        ctx.shadowColor = wave.color;
        ctx.fill();
        ctx.restore();

        wave.radius += 10;
        wave.alpha -= 0.08;
        if (wave.alpha <= 0) {
          flashWaves.splice(i, 1);
        }
      }

      // 2. Launch Sky Rockets Frequently (Every 450 - 850ms)
      const now = Date.now();
      if (now - lastRocketTime > 500 + Math.random() * 450) {
        launchHeavyRocket();
        // Occasional double rocket
        if (Math.random() > 0.45) {
          setTimeout(launchHeavyRocket, 150);
        }
        lastRocketTime = now;
      }

      // 3. Emit Real Booshvanam Sparks from Left & Right Nozzles
      const leftEl = document.getElementById('booshvanam-left-nozzle');
      const rightEl = document.getElementById('booshvanam-right-nozzle');

      if (leftEl) {
        const rect = leftEl.getBoundingClientRect();
        const nx = rect.left + rect.width / 2;
        const ny = rect.top + rect.height / 2;
        // 5-8 sparks per frame = roaring dense fountain
        for (let s = 0; s < 6; s++) {
          booshvanamSparks.push(new BooshvanamSpark(nx, ny));
        }
      }

      if (rightEl) {
        const rect = rightEl.getBoundingClientRect();
        const nx = rect.left + rect.width / 2;
        const ny = rect.top + rect.height / 2;
        for (let s = 0; s < 6; s++) {
          booshvanamSparks.push(new BooshvanamSpark(nx, ny));
        }
      }

      // 4. Update & Draw Sky Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();
        if (r.exploded) {
          rockets.splice(i, 1);
        }
      }

      // 5. Update & Draw Sky Firework Particles
      for (let i = skyParticles.length - 1; i >= 0; i--) {
        const p = skyParticles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
          skyParticles.splice(i, 1);
        }
      }

      // 6. Update & Draw Booshvanam Fountain Sparks
      for (let i = booshvanamSparks.length - 1; i >= 0; i--) {
        const b = booshvanamSparks[i];
        b.update();
        b.draw();
        if (b.alpha <= 0) {
          booshvanamSparks.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const handleCelebrate = () => {
    handleClose();
    const section = document.getElementById('about') || document.getElementById('services');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* 1. Main Festive Modal Dialog (Covers the full screen with Big Sky Crackers & Roaring Booshvanams) */}
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
          {/* High-Performance Canvas for Big Sky Fireworks & Dense Booshvanam Fountains */}
          <canvas ref={canvasRef} className="diwali-popup-canvas" />

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
                LEFT REALISTIC BOOSHVANAM (FLOWERPOT FOUNTAIN) POT
               ======================================================== */}
            <div className="diwali-booshvanam-left" aria-hidden="true" title="Booshvanam (பூவாணம் / Flowerpot Fountain)">
              <div id="booshvanam-left-nozzle" className="booshvanam-nozzle" />
              <svg className="booshvanam-pot-svg" viewBox="0 0 54 50" fill="none">
                <path d="M27 6L8 46C7 48 8.5 49 11 49H43C45.5 49 47 48 46 46L27 6Z" fill="url(#booshPotGradLeft)" stroke="#F59E0B" strokeWidth="1.8" />
                <path d="M14 38H40" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M18 28H36" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M22 18H32" stroke="#FFF" strokeWidth="1.2" strokeDasharray="2 2" />
                <ellipse cx="27" cy="6" rx="6" ry="2.2" fill="#D97706" />
                <defs>
                  <linearGradient id="booshPotGradLeft" x1="27" y1="6" x2="27" y2="49">
                    <stop stopColor="#B45309" />
                    <stop offset="0.5" stopColor="#78350F" />
                    <stop offset="1" stopColor="#451A03" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* ========================================================
                RIGHT REALISTIC BOOSHVANAM (FLOWERPOT FOUNTAIN) POT
               ======================================================== */}
            <div className="diwali-booshvanam-right" aria-hidden="true" title="Booshvanam (பூவாணம் / Flowerpot Fountain)">
              <div id="booshvanam-right-nozzle" className="booshvanam-nozzle" />
              <svg className="booshvanam-pot-svg" viewBox="0 0 54 50" fill="none">
                <path d="M27 6L8 46C7 48 8.5 49 11 49H43C45.5 49 47 48 46 46L27 6Z" fill="url(#booshPotGradRight)" stroke="#F59E0B" strokeWidth="1.8" />
                <path d="M14 38H40" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M18 28H36" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M22 18H32" stroke="#FFF" strokeWidth="1.2" strokeDasharray="2 2" />
                <ellipse cx="27" cy="6" rx="6" ry="2.2" fill="#D97706" />
                <defs>
                  <linearGradient id="booshPotGradRight" x1="27" y1="6" x2="27" y2="49">
                    <stop stopColor="#B45309" />
                    <stop offset="0.5" stopColor="#78350F" />
                    <stop offset="1" stopColor="#451A03" />
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

      {/* 2. Floating Festive Diya Pill (When modal is closed) */}
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
