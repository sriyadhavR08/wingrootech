import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Heart } from 'lucide-react';
import './DiwaliPopup.css';

/**
 * Diwali Celebration Component
 * 
 * Flow:
 * 1. On Landing: Grand Diwali Wishes Pop-up Modal appears with sky crackers & roaring booshvanam fountains.
 * 2. When Closed (via X button):
 *    - An attractive festive greeting banner is placed in the UI at the top.
 *    - Across the WHOLE UI, on BOTH left and right sides, sky crackers continuously shoot and crack!
 *    - 100% non-blocking & transparent so website navigation is completely smooth.
 * 3. Removal: Setting SHOW_DIWALI_POPUP = false in `src/App.jsx` disables everything.
 */
export default function DiwaliPopup({ onOpenStudentPortal }) {
  const [isModalOpen, setIsModalOpen] = useState(() => {
    try {
      return sessionStorage.getItem('wingroo_diwali_modal_closed') !== 'true';
    } catch {
      return true;
    }
  });

  const modalCanvasRef = useRef(null);
  const globalSidesCanvasRef = useRef(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    try {
      sessionStorage.setItem('wingroo_diwali_modal_closed', 'true');
    } catch {
      // ignore
    }
  };

  const handleReopenModal = () => {
    setIsModalOpen(true);
    try {
      sessionStorage.removeItem('wingroo_diwali_modal_closed');
    } catch {
      // ignore
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Shared festive colors
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

  // =========================================================================
  // 1. MODAL SKY CRACKERS & BOOSHVANAM ENGINE (WHILE MODAL IS OPEN)
  // =========================================================================
  useEffect(() => {
    if (!isModalOpen) return;

    const canvas = modalCanvasRef.current;
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

    const rockets = [];
    const skyParticles = [];
    const booshvanamSparks = [];
    const flashWaves = [];

    class ModalRocket {
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
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 9) this.trail.shift();

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
          const trailAlpha = (i / this.trail.length) * 0.95;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.2 + i * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 215, 0, ${trailAlpha})`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#FF8C00';
          ctx.fill();
        }

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
        const count = 80 + Math.floor(Math.random() * 45);
        const burstColor = this.color;

        flashWaves.push({
          x: this.x,
          y: this.y,
          radius: 18,
          color: burstColor,
          alpha: 0.55
        });

        for (let i = 0; i < count; i++) {
          skyParticles.push(new ModalParticle(this.x, this.y, burstColor));
        }
      }
    }

    class ModalParticle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.0 + Math.random() * 8.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.friction = 0.93;
        this.gravity = 0.12;
        this.alpha = 1;
        this.decay = 0.011 + Math.random() * 0.014;
        this.size = 2.4 + Math.random() * 2.6;
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
        ctx.shadowBlur = 14;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    class BooshvanamSpark {
      constructor(nozzleX, nozzleY) {
        this.x = nozzleX + (Math.random() * 6 - 3);
        this.y = nozzleY;
        const upwardForce = 8 + Math.random() * 10;
        const spreadAngle = (Math.random() - 0.5) * 5.5;
        this.vx = spreadAngle;
        this.vy = -upwardForce;
        this.gravity = 0.22;
        this.friction = 0.985;
        this.alpha = 1;
        this.decay = 0.014 + Math.random() * 0.018;
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

    const launchModalRocket = () => {
      const startX = width * 0.05 + Math.random() * (width * 0.90);
      const targetX = startX + (Math.random() * 160 - 80);
      const targetY = height * 0.08 + Math.random() * (height * 0.38);
      const color = skyColors[Math.floor(Math.random() * skyColors.length)];

      rockets.push(new ModalRocket(startX, targetX, targetY, color));
    };

    launchModalRocket();
    setTimeout(launchModalRocket, 250);
    setTimeout(launchModalRocket, 600);

    let lastRocket = Date.now();

    const loop = () => {
      ctx.fillStyle = 'rgba(6, 3, 14, 0.24)';
      ctx.fillRect(0, 0, width, height);

      // Flash waves
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
        if (wave.alpha <= 0) flashWaves.splice(i, 1);
      }

      // Launch sky rockets
      const now = Date.now();
      if (now - lastRocket > 500 + Math.random() * 450) {
        launchModalRocket();
        lastRocket = now;
      }

      // Booshvanam sparks
      const leftEl = document.getElementById('booshvanam-left-nozzle');
      const rightEl = document.getElementById('booshvanam-right-nozzle');

      if (leftEl) {
        const rect = leftEl.getBoundingClientRect();
        const nx = rect.left + rect.width / 2;
        const ny = rect.top + rect.height / 2;
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

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();
        if (r.exploded) rockets.splice(i, 1);
      }

      // Update sky particles
      for (let i = skyParticles.length - 1; i >= 0; i--) {
        const p = skyParticles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) skyParticles.splice(i, 1);
      }

      // Update booshvanam sparks
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
      window.removeEventListener('resize', handleResize);
    };
  }, [isModalOpen]);

  // =========================================================================
  // 2. TWO-SIDED WHOLE UI SKY CRACKERS ENGINE (WHEN MODAL IS CLOSED)
  // Shoots & bursts sky crackers strictly along the Left & Right flanks of the whole page!
  // =========================================================================
  useEffect(() => {
    if (isModalOpen) return;

    const canvas = globalSidesCanvasRef.current;
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

    const sideRockets = [];
    const sideParticles = [];

    class SideSkyRocket {
      constructor(isLeft, color) {
        this.color = color;
        this.speed = 12 + Math.random() * 5;
        // Strictly left flank (0% - 20%) or right flank (80% - 100%)
        if (isLeft) {
          this.x = width * 0.03 + Math.random() * (width * 0.16);
          this.targetX = this.x + (Math.random() * 70 - 20);
        } else {
          this.x = width * 0.81 + Math.random() * (width * 0.16);
          this.targetX = this.x + (Math.random() * 70 - 50);
        }
        this.y = height + 10;
        this.targetY = height * 0.10 + Math.random() * (height * 0.38);

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
        const count = 55 + Math.floor(Math.random() * 35);
        const burstColor = this.color;

        for (let i = 0; i < count; i++) {
          sideParticles.push(new SideSkyParticle(this.x, this.y, burstColor));
        }
      }
    }

    class SideSkyParticle {
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
        this.decay = 0.012 + Math.random() * 0.015;
        this.size = 2.2 + Math.random() * 2.5;
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
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    let toggleLeftRight = true;
    const launchSideRocket = () => {
      const color = skyColors[Math.floor(Math.random() * skyColors.length)];
      sideRockets.push(new SideSkyRocket(toggleLeftRight, color));
      toggleLeftRight = !toggleLeftRight;
    };

    launchSideRocket();
    setTimeout(launchSideRocket, 250);

    let lastLaunch = Date.now();

    const loop = () => {
      // Clear transparently so full website is 100% visible and sharp
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      if (now - lastLaunch > 750 + Math.random() * 550) {
        launchSideRocket();
        // Occasional double rocket
        if (Math.random() > 0.45) {
          setTimeout(launchSideRocket, 180);
        }
        lastLaunch = now;
      }

      for (let i = sideRockets.length - 1; i >= 0; i--) {
        const r = sideRockets[i];
        r.update();
        r.draw();
        if (r.exploded) sideRockets.splice(i, 1);
      }

      for (let i = sideParticles.length - 1; i >= 0; i--) {
        const p = sideParticles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) sideParticles.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isModalOpen]);

  const handleExplore = () => {
    handleCloseModal();
    const el = document.querySelector('#services') || document.querySelector('#about');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* =================================================================
          1. OLD POPUP MODAL (ON LANDING)
         ================================================================= */}
      {isModalOpen && (
        <div 
          className="diwali-popup-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Happy Diwali Greetings"
        >
          {/* Modal Sky Fireworks & Booshvanam Canvas */}
          <canvas ref={modalCanvasRef} className="diwali-popup-canvas" />

          <div className="diwali-popup-container">
            {/* Top Hanging Marigold Toran */}
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

            {/* Close Button on Modal */}
            <button 
              type="button" 
              className="diwali-close-btn" 
              onClick={handleCloseModal}
              aria-label="Close Diwali Popup"
              title="Close"
            >
              <X size={20} />
            </button>

            {/* Left Booshvanam Pot Base */}
            <div className="diwali-booshvanam-left" aria-hidden="true" title="Booshvanam (பூவாணம்)">
              <div id="booshvanam-left-nozzle" className="booshvanam-nozzle" />
              <svg className="booshvanam-pot-svg" viewBox="0 0 54 50" fill="none">
                <path d="M27 6L8 46C7 48 8.5 49 11 49H43C45.5 49 47 48 46 46L27 6Z" fill="url(#bPotLeft)" stroke="#F59E0B" strokeWidth="1.8" />
                <path d="M14 38H40" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M18 28H36" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 2" />
                <ellipse cx="27" cy="6" rx="6" ry="2.2" fill="#D97706" />
                <defs>
                  <linearGradient id="bPotLeft" x1="27" y1="6" x2="27" y2="49">
                    <stop stopColor="#B45309" />
                    <stop offset="0.5" stopColor="#78350F" />
                    <stop offset="1" stopColor="#451A03" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Right Booshvanam Pot Base */}
            <div className="diwali-booshvanam-right" aria-hidden="true" title="Booshvanam (பூவாணம்)">
              <div id="booshvanam-right-nozzle" className="booshvanam-nozzle" />
              <svg className="booshvanam-pot-svg" viewBox="0 0 54 50" fill="none">
                <path d="M27 6L8 46C7 48 8.5 49 11 49H43C45.5 49 47 48 46 46L27 6Z" fill="url(#bPotRight)" stroke="#F59E0B" strokeWidth="1.8" />
                <path d="M14 38H40" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M18 28H36" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 2" />
                <ellipse cx="27" cy="6" rx="6" ry="2.2" fill="#D97706" />
                <defs>
                  <linearGradient id="bPotRight" x1="27" y1="6" x2="27" y2="49">
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

            {/* Center Triple Diyas */}
            <div className="diwali-diya-hero-container">
              <div className="diwali-diya-side">
                <svg width="42" height="40" viewBox="0 0 50 48" fill="none">
                  <path className="diwali-flame" d="M25 4C25 4 17 14 17 21C17 25.4 20.6 29 25 29C29.4 29 33 25.4 33 21C33 14 25 4 25 4Z" fill="url(#mFlameLeft)" />
                  <path className="diwali-flame-inner" d="M25 11C25 11 20 17 20 21C20 23.8 22.2 26 25 26C27.8 26 30 23.8 30 21C30 17 25 11 25 11Z" fill="#FFFBEB" />
                  <path d="M5 28C8 38 18 44 25 44C32 44 42 38 45 28C39 33 11 33 5 28Z" fill="url(#mDiyaLeft)" />
                  <ellipse cx="25" cy="28.5" rx="20" ry="4.5" fill="#B45309" />
                  <defs>
                    <linearGradient id="mFlameLeft" x1="25" y1="4" x2="25" y2="29">
                      <stop stopColor="#FDE047" />
                      <stop offset="0.5" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#DC2626" />
                    </linearGradient>
                    <linearGradient id="mDiyaLeft" x1="5" y1="28" x2="45" y2="44">
                      <stop stopColor="#F59E0B" />
                      <stop offset="0.5" stopColor="#D97706" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="diwali-diya-main">
                <svg width="68" height="64" viewBox="0 0 50 48" fill="none">
                  <path className="diwali-flame" d="M25 3C25 3 16 13 16 21C16 26 20 30 25 30C30 30 34 26 34 21C34 13 25 3 25 3Z" fill="url(#mMainFlame)" />
                  <path className="diwali-flame-inner" d="M25 10C25 10 19 16 19 21C19 24.3 21.7 27 25 27C28.3 27 31 24.3 31 21C31 16 25 10 25 10Z" fill="#FFFBEB" />
                  <path d="M4 28C7 39 17 45 25 45C33 45 43 39 46 28C40 33.5 10 33.5 4 28Z" fill="url(#mMainDiya)" />
                  <ellipse cx="25" cy="28.5" rx="21" ry="5" fill="#92400E" />
                  <circle cx="25" cy="36" r="2.5" fill="#FDE047" opacity="0.9" />
                  <defs>
                    <linearGradient id="mMainFlame" x1="25" y1="3" x2="25" y2="30">
                      <stop stopColor="#FEF08A" />
                      <stop offset="0.45" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#EF4444" />
                    </linearGradient>
                    <linearGradient id="mMainDiya" x1="4" y1="28" x2="46" y2="45">
                      <stop stopColor="#FCD34D" />
                      <stop offset="0.4" stopColor="#F59E0B" />
                      <stop offset="1" stopColor="#78350F" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="diwali-diya-side">
                <svg width="42" height="40" viewBox="0 0 50 48" fill="none">
                  <path className="diwali-flame" d="M25 4C25 4 17 14 17 21C17 25.4 20.6 29 25 29C29.4 29 33 25.4 33 21C33 14 25 4 25 4Z" fill="url(#mFlameLeft)" />
                  <path className="diwali-flame-inner" d="M25 11C25 11 20 17 20 21C20 23.8 22.2 26 25 26C27.8 26 30 23.8 30 21C30 17 25 11 25 11Z" fill="#FFFBEB" />
                  <path d="M5 28C8 38 18 44 25 44C32 44 42 38 45 28C39 33 11 33 5 28Z" fill="url(#mDiyaLeft)" />
                  <ellipse cx="25" cy="28.5" rx="20" ry="4.5" fill="#B45309" />
                </svg>
              </div>
            </div>

            {/* Festive Title */}
            <h2 className="diwali-main-title">Happy Diwali! 🪔✨</h2>
            <div className="diwali-tamil-title">இனிய தீபாவளி திருநாள் நல்வாழ்த்துகள்!</div>

            {/* Warm Greeting Text */}
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
                onClick={handleExplore}
              >
                <Sparkles size={18} />
                <span>Celebrate Diwali with Us</span>
                <Heart size={18} fill="#fff" />
              </button>
              <button 
                type="button" 
                className="diwali-dismiss-link" 
                onClick={handleCloseModal}
              >
                Enter Website 🪔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          2. CLOSED STATE: TWO-SIDED WHOLE UI SKY CRACKERS + SLEEK UI WISHES
         ================================================================= */}
      {!isModalOpen && (
        <>
          {/* Transparent Canvas: Sky crackers bursting on both the Left and Right sides of the WHOLE UI */}
          <canvas ref={globalSidesCanvasRef} className="diwali-global-sides-canvas" />

          {/* Sleek UI Festive Diwali Greeting Bar (Placed nicely in the page) */}
          <div className="diwali-ui-festive-bar" role="banner" aria-label="Diwali Wishes">
            <div className="diwali-ui-bar-content">
              <span className="diwali-ui-bar-badge">🪔 Diwali Special</span>
              <span className="diwali-ui-bar-text">Happy Diwali!</span>
              <span className="diwali-ui-bar-tamil">இனிய தீபாவளி திருநாள் நல்வாழ்த்துகள்! • Wingroo Technologies</span>
            </div>
            <div className="diwali-ui-bar-actions">
              <button 
                type="button" 
                className="diwali-ui-view-modal-btn" 
                onClick={handleReopenModal}
                title="View Grand Diwali Celebration"
              >
                <Sparkles size={14} />
                <span>View Celebration ✨</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
