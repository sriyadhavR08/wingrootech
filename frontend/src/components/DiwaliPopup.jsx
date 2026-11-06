import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Heart } from 'lucide-react';
import './DiwaliPopup.css';

/**
 * Diwali In-Page Festive Section with Two-Sided Sky Crackers & Roaring Booshvanams
 * 
 * Embedded directly on the landing page header.
 * - Left & Right Flanks: Heavy sky crackers bursting + realistic physics-based booshvanam fountain
 * - Center: Grand Diwali greetings, glowing diyas, & Tamil wishes
 * - Modular: set SHOW_DIWALI_POPUP = false in `src/App.jsx` to take down anytime
 */
export default function DiwaliPopup({ onOpenStudentPortal }) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return sessionStorage.getItem('wingroo_diwali_banner_dismissed') !== 'true';
    } catch {
      return true;
    }
  });

  const canvasRef = useRef(null);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('wingroo_diwali_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleReopen = () => {
    setIsOpen(true);
    try {
      sessionStorage.removeItem('wingroo_diwali_banner_dismissed');
    } catch {
      // ignore
    }
  };

  // =========================================================================
  // TWO-SIDED SKY CRACKERS & BOOSHVANAM ENGINE (HTML5 CANVAS 2D)
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const setSize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : 380;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Radiant festive palette for Sky Crackers
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

    // 1. SKY ROCKETS (Shooting from Left & Right flanks)
    class SkyRocket {
      constructor(isLeft, color) {
        const w = canvas.width;
        const h = canvas.height;
        // Launch strictly from Left flank (0% - 22%) or Right flank (78% - 100%)
        if (isLeft) {
          this.x = w * 0.04 + Math.random() * (w * 0.16);
          this.targetX = this.x + (Math.random() * 60 - 20);
        } else {
          this.x = w * 0.80 + Math.random() * (w * 0.16);
          this.targetX = this.x + (Math.random() * 60 - 40);
        }
        this.y = h + 10;
        this.targetY = h * 0.08 + Math.random() * (h * 0.38);
        this.color = color;
        this.speed = 10 + Math.random() * 5;
        const angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.trail = [];
        this.exploded = false;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;

        if (this.vy < 0 && this.y <= this.targetY) {
          this.explode();
        }
      }

      draw() {
        ctx.save();
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const trailAlpha = (i / this.trail.length) * 0.9;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2 + i * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${trailAlpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FF8C00';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 16;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }

      explode() {
        this.exploded = true;
        const count = 65 + Math.floor(Math.random() * 35);
        const burstColor = this.color;

        flashWaves.push({
          x: this.x,
          y: this.y,
          radius: 15,
          color: burstColor,
          alpha: 0.5
        });

        for (let i = 0; i < count; i++) {
          skyParticles.push(new SkyParticle(this.x, this.y, burstColor));
        }
      }
    }

    class SkyParticle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.0 + Math.random() * 7.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.friction = 0.93;
        this.gravity = 0.12;
        this.alpha = 1;
        this.decay = 0.012 + Math.random() * 0.016;
        this.size = 2.2 + Math.random() * 2.4;
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

    // 2. REALISTIC BOOSHVANAM FOUNTAIN SPARKS
    class BooshvanamSpark {
      constructor(nozzleX, nozzleY) {
        this.x = nozzleX + (Math.random() * 6 - 3);
        this.y = nozzleY;
        const upwardForce = 7.5 + Math.random() * 9.5;
        const spreadAngle = (Math.random() - 0.5) * 5;
        this.vx = spreadAngle;
        this.vy = -upwardForce;
        this.gravity = 0.20;
        this.friction = 0.985;
        this.alpha = 1;
        this.decay = 0.015 + Math.random() * 0.018;
        this.size = 2.0 + Math.random() * 2.2;

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

    // Launch rocket alternating Left and Right
    let toggleSide = true;
    const launchSideRocket = () => {
      const color = skyColors[Math.floor(Math.random() * skyColors.length)];
      rockets.push(new SkyRocket(toggleSide, color));
      toggleSide = !toggleSide;
    };

    // Initial rockets
    launchSideRocket();
    setTimeout(launchSideRocket, 300);

    let lastRocketTime = Date.now();

    const loop = () => {
      // Soft trail clear inside the festive banner
      ctx.fillStyle = 'rgba(15, 3, 27, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Flash waves
      for (let i = flashWaves.length - 1; i >= 0; i--) {
        const wave = flashWaves[i];
        ctx.save();
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${wave.alpha})`;
        ctx.shadowBlur = 30;
        ctx.shadowColor = wave.color;
        ctx.fill();
        ctx.restore();

        wave.radius += 8;
        wave.alpha -= 0.09;
        if (wave.alpha <= 0) {
          flashWaves.splice(i, 1);
        }
      }

      // Launch side rockets frequently
      const now = Date.now();
      if (now - lastRocketTime > 550 + Math.random() * 450) {
        launchSideRocket();
        lastRocketTime = now;
      }

      // Emit booshvanam fountain sparks
      const leftEl = document.getElementById('banner-booshvanam-left-nozzle');
      const rightEl = document.getElementById('banner-booshvanam-right-nozzle');

      if (leftEl) {
        const canvasRect = canvas.getBoundingClientRect();
        const rect = leftEl.getBoundingClientRect();
        const nx = rect.left - canvasRect.left + rect.width / 2;
        const ny = rect.top - canvasRect.top + rect.height / 2;
        for (let s = 0; s < 5; s++) {
          booshvanamSparks.push(new BooshvanamSpark(nx, ny));
        }
      }

      if (rightEl) {
        const canvasRect = canvas.getBoundingClientRect();
        const rect = rightEl.getBoundingClientRect();
        const nx = rect.left - canvasRect.left + rect.width / 2;
        const ny = rect.top - canvasRect.top + rect.height / 2;
        for (let s = 0; s < 5; s++) {
          booshvanamSparks.push(new BooshvanamSpark(nx, ny));
        }
      }

      // Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();
        if (r.exploded) rockets.splice(i, 1);
      }

      // Update & Draw Sky Particles
      for (let i = skyParticles.length - 1; i >= 0; i--) {
        const p = skyParticles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) skyParticles.splice(i, 1);
      }

      // Update & Draw Booshvanam Sparks
      for (let i = booshvanamSparks.length - 1; i >= 0; i--) {
        const b = booshvanamSparks[i];
        b.update();
        b.draw();
        if (b.alpha <= 0) booshvanamSparks.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setSize);
    };
  }, [isOpen]);

  const handleExplore = () => {
    const el = document.querySelector('#services') || document.querySelector('#about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. Main In-Page Festive Section */}
      {isOpen ? (
        <section className="diwali-page-section" aria-label="Diwali Celebration Wishes">
          {/* Two-Sided Sky Fireworks & Booshvanam Canvas */}
          <canvas ref={canvasRef} className="diwali-banner-canvas" />

          {/* Top Hanging Toran Garland */}
          <div className="diwali-banner-toran" aria-hidden="true">
            <span className="banner-toran-leaf" />
            <span className="banner-toran-leaf" />
            <span className="banner-toran-leaf" />
            <span className="banner-toran-leaf" />
            <span className="banner-toran-leaf" />
            <span className="banner-toran-leaf" />
            <span className="banner-toran-leaf" />
            <span className="banner-toran-leaf" />
          </div>

          {/* Dismiss / Close Button */}
          <button 
            type="button" 
            className="diwali-banner-close-btn" 
            onClick={handleClose}
            aria-label="Minimize Diwali Wishes Banner"
            title="Minimize festive banner"
          >
            <X size={18} />
          </button>

          {/* Left Flank Realistic Booshvanam Pot */}
          <div className="diwali-banner-booshvanam-left" aria-hidden="true">
            <div id="banner-booshvanam-left-nozzle" className="banner-booshvanam-nozzle" />
            <svg className="banner-booshvanam-pot-svg" viewBox="0 0 54 50" fill="none">
              <path d="M27 6L8 46C7 48 8.5 49 11 49H43C45.5 49 47 48 46 46L27 6Z" fill="url(#bPotGradLeft)" stroke="#F59E0B" strokeWidth="1.8" />
              <path d="M14 38H40" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
              <path d="M18 28H36" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 2" />
              <ellipse cx="27" cy="6" rx="6" ry="2.2" fill="#D97706" />
              <defs>
                <linearGradient id="bPotGradLeft" x1="27" y1="6" x2="27" y2="49">
                  <stop stopColor="#B45309" />
                  <stop offset="0.5" stopColor="#78350F" />
                  <stop offset="1" stopColor="#451A03" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right Flank Realistic Booshvanam Pot */}
          <div className="diwali-banner-booshvanam-right" aria-hidden="true">
            <div id="banner-booshvanam-right-nozzle" className="banner-booshvanam-nozzle" />
            <svg className="banner-booshvanam-pot-svg" viewBox="0 0 54 50" fill="none">
              <path d="M27 6L8 46C7 48 8.5 49 11 49H43C45.5 49 47 48 46 46L27 6Z" fill="url(#bPotGradRight)" stroke="#F59E0B" strokeWidth="1.8" />
              <path d="M14 38H40" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
              <path d="M18 28H36" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 2" />
              <ellipse cx="27" cy="6" rx="6" ry="2.2" fill="#D97706" />
              <defs>
                <linearGradient id="bPotGradRight" x1="27" y1="6" x2="27" y2="49">
                  <stop stopColor="#B45309" />
                  <stop offset="0.5" stopColor="#78350F" />
                  <stop offset="1" stopColor="#451A03" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Central Hero Content */}
          <div className="diwali-banner-inner">
            {/* Top Festive Badge */}
            <div className="diwali-banner-badge-row">
              <span className="diwali-banner-badge-line" />
              <div className="diwali-banner-badge">
                <Sparkles size={13} />
                <span>Festival of Lights Celebration</span>
                <Sparkles size={13} />
              </div>
              <span className="diwali-banner-badge-line" />
            </div>

            {/* Center Animated Diyas */}
            <div className="diwali-banner-diyas">
              <div className="diwali-banner-diya-side">
                <svg width="40" height="38" viewBox="0 0 50 48" fill="none">
                  <path className="diwali-flame" d="M25 4C25 4 17 14 17 21C17 25.4 20.6 29 25 29C29.4 29 33 25.4 33 21C33 14 25 4 25 4Z" fill="url(#bFlameLeft)" />
                  <path className="diwali-flame-inner" d="M25 11C25 11 20 17 20 21C20 23.8 22.2 26 25 26C27.8 26 30 23.8 30 21C30 17 25 11 25 11Z" fill="#FFFBEB" />
                  <path d="M5 28C8 38 18 44 25 44C32 44 42 38 45 28C39 33 11 33 5 28Z" fill="url(#bDiyaLeft)" />
                  <ellipse cx="25" cy="28.5" rx="20" ry="4.5" fill="#B45309" />
                  <defs>
                    <linearGradient id="bFlameLeft" x1="25" y1="4" x2="25" y2="29">
                      <stop stopColor="#FDE047" />
                      <stop offset="0.5" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#DC2626" />
                    </linearGradient>
                    <linearGradient id="bDiyaLeft" x1="5" y1="28" x2="45" y2="44">
                      <stop stopColor="#F59E0B" />
                      <stop offset="0.5" stopColor="#D97706" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="diwali-banner-diya-main">
                <svg width="64" height="60" viewBox="0 0 50 48" fill="none">
                  <path className="diwali-flame" d="M25 3C25 3 16 13 16 21C16 26 20 30 25 30C30 30 34 26 34 21C34 13 25 3 25 3Z" fill="url(#bMainFlame)" />
                  <path className="diwali-flame-inner" d="M25 10C25 10 19 16 19 21C19 24.3 21.7 27 25 27C28.3 27 31 24.3 31 21C31 16 25 10 25 10Z" fill="#FFFBEB" />
                  <path d="M4 28C7 39 17 45 25 45C33 45 43 39 46 28C40 33.5 10 33.5 4 28Z" fill="url(#bMainDiya)" />
                  <ellipse cx="25" cy="28.5" rx="21" ry="5" fill="#92400E" />
                  <circle cx="25" cy="36" r="2.5" fill="#FDE047" opacity="0.9" />
                  <defs>
                    <linearGradient id="bMainFlame" x1="25" y1="3" x2="25" y2="30">
                      <stop stopColor="#FEF08A" />
                      <stop offset="0.45" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#EF4444" />
                    </linearGradient>
                    <linearGradient id="bMainDiya" x1="4" y1="28" x2="46" y2="45">
                      <stop stopColor="#FCD34D" />
                      <stop offset="0.4" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="diwali-banner-diya-side">
                <svg width="40" height="38" viewBox="0 0 50 48" fill="none">
                  <path className="diwali-flame" d="M25 4C25 4 17 14 17 21C17 25.4 20.6 29 25 29C29.4 29 33 25.4 33 21C33 14 25 4 25 4Z" fill="url(#bFlameLeft)" />
                  <path className="diwali-flame-inner" d="M25 11C25 11 20 17 20 21C20 23.8 22.2 26 25 26C27.8 26 30 23.8 30 21C30 17 25 11 25 11Z" fill="#FFFBEB" />
                  <path d="M5 28C8 38 18 44 25 44C32 44 42 38 45 28C39 33 11 33 5 28Z" fill="url(#bDiyaLeft)" />
                  <ellipse cx="25" cy="28.5" rx="20" ry="4.5" fill="#B45309" />
                </svg>
              </div>
            </div>

            {/* Festive Title */}
            <h1 className="diwali-banner-title">Happy Diwali! 🪔✨</h1>
            <div className="diwali-banner-tamil-title">இனிய தீபாவளி திருநாள் நல்வாழ்த்துகள்!</div>

            {/* Warm Greeting Message */}
            <p className="diwali-banner-body">
              May this festival of lights spark limitless happiness, success, and prosperity in your tech journey.
              <span className="diwali-banner-signature">
                ✨ Warmest Wishes from Wingroo Technologies & Team ✨
              </span>
            </p>

            {/* Action Button */}
            <div className="diwali-banner-actions">
              <button 
                type="button" 
                className="diwali-banner-primary-btn" 
                onClick={handleExplore}
              >
                <Sparkles size={16} />
                <span>Celebrate Diwali with Us</span>
                <Heart size={16} fill="#fff" />
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* 2. Minimized Top Ribbon (When closed, allows user to re-open easily) */
        <div className="diwali-banner-minimized">
          <div>
            <span>🪔 Happy Diwali! இனிய தீபாவளி நல்வாழ்த்துகள்!</span>
          </div>
          <button 
            type="button" 
            className="diwali-minimized-reopen-btn" 
            onClick={handleReopen}
          >
            Show Celebration ✨
          </button>
        </div>
      )}
    </>
  );
}
