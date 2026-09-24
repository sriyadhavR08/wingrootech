import React from 'react';
import { ArrowRight, Sparkles, Layers, Cpu, Compass, TrendingUp, CheckCircle2, Terminal } from 'lucide-react';
import './Hero.css';

export default function Hero() {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero-section">
      {/* Decorative Glows */}
      <div className="bg-mesh-glow bg-glow-indigo hero-glow-1" />
      <div className="bg-mesh-glow bg-glow-cyan hero-glow-2" />

      <div className="container hero-container">
        <div className="hero-grid">
          {/* Hero Left Content */}
          <div className="hero-content">

            <h1 className="hero-headline">
              Turning Ideas Into <span className="text-gradient">Digital Impact.</span>
            </h1>

            <p className="hero-subline">
              Technology. Creativity. Opportunity. — All under one roof.
            </p>

            <p className="hero-description">
              Wingroo Technologies is a technology-driven company focused on building meaningful 
              digital solutions and creating opportunities for the next generation of technology professionals.
              From websites and software solutions to intelligent applications and industry-focused projects, 
              we combine technology, creativity and practical experience to transform ideas into solutions that make a difference.
            </p>

            <div className="hero-actions">
              <button 
                onClick={() => scrollTo('#portfolio')} 
                className="btn btn-primary hero-btn"
              >
                <span>Explore Our Work</span>
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={() => scrollTo('#contact')} 
                className="btn btn-secondary hero-btn"
              >
                <span>Start a Conversation</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="hero-stats-row">
              <div className="hero-stat-pill">
                <CheckCircle2 size={16} className="stat-pill-icon" />
                <span>Enterprise Grade Architecture</span>
              </div>
              <div className="hero-stat-pill">
                <CheckCircle2 size={16} className="stat-pill-icon" />
                <span>Student-to-Professional Programs</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual: Abstract Tech Composition */}
          <div className="hero-visual">
            <div className="tech-stage">
              {/* Backglow element */}
              <div className="stage-backlight" />

              {/* Main Visual Glass Card */}
              <div className="glass-card main-tech-card">
                <div className="card-top-bar">
                  <div className="window-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <span className="window-title">wingroo-engine.config.ts</span>
                </div>

                <div className="card-code-area">
                  <div className="code-line">
                    <span className="syntax-keyword">import</span> &#123; <span className="syntax-func">DigitalSolution</span>, <span className="syntax-func">Innovate</span> &#125; <span className="syntax-keyword">from</span> <span className="syntax-str">'@wingroo/core'</span>;
                  </div>
                  <div className="code-line">
                    <span className="syntax-comment">// Transforming visionary ideas into production realities</span>
                  </div>
                  <div className="code-line">
                    <span className="syntax-keyword">export const</span> <span className="syntax-var">future</span> = <span className="syntax-keyword">await</span> <span className="syntax-func">Innovate</span>(&#123;
                  </div>
                  <div className="code-line indent">
                    <span className="syntax-prop">mission:</span> <span className="syntax-str">'Make meaningful impact'</span>,
                  </div>
                  <div className="code-line indent">
                    <span className="syntax-prop">stack:</span> [<span className="syntax-str">'React'</span>, <span className="syntax-str">'AI & ML'</span>, <span className="syntax-str">'Cloud'</span>],
                  </div>
                  <div className="code-line indent">
                    <span className="syntax-prop">status:</span> <span className="syntax-badge-inline">READY_TO_DEPLOY</span>
                  </div>
                  <div className="code-line">&#125;);</div>
                </div>

                <div className="tech-card-footer">
                  <div className="footer-metric">
                    <span className="metric-label">Execution Speed</span>
                    <span className="metric-val">99.8% Uptime</span>
                  </div>
                  <div className="footer-status-pill">
                    <span className="live-status-dot" /> Live Pipeline
                  </div>
                </div>
              </div>

              {/* Floating Card 1: Modern Solutions */}
              <div className="floating-card float-card-1">
                <div className="float-icon-wrap violet">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="float-title">Modern Solutions</div>
                  <div className="float-subtitle">High Digital Impact</div>
                </div>
              </div>

              {/* Floating Card 2: Modern Architecture */}
              <div className="floating-card float-card-2">
                <div className="float-icon-wrap indigo">
                  <Layers size={20} />
                </div>
                <div>
                  <div className="float-title">Full-Stack & AI</div>
                  <div className="float-subtitle">Scalable Engineering</div>
                </div>
              </div>

              {/* Floating Card 3: Experience Guarantee */}
              <div className="floating-card float-card-3">
                <div className="float-icon-wrap emerald">
                  <Cpu size={20} />
                </div>
                <div>
                  <div className="float-title">Real Projects</div>
                  <div className="float-subtitle">Live Industry Exposure</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Four Highlight Items below Hero */}
        <div className="hero-highlights-grid">
          <div className="highlight-item">
            <div className="highlight-icon-box">
              <Sparkles size={22} className="highlight-icon" />
            </div>
            <div className="highlight-text">
              <h3 className="highlight-title">Innovation</h3>
              <p className="highlight-desc">Ideas that move forward.</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon-box">
              <Cpu size={22} className="highlight-icon" />
            </div>
            <div className="highlight-text">
              <h3 className="highlight-title">Technology</h3>
              <p className="highlight-desc">Solutions built for the real world.</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon-box">
              <Compass size={22} className="highlight-icon" />
            </div>
            <div className="highlight-text">
              <h3 className="highlight-title">Experience</h3>
              <p className="highlight-desc">Learning through doing.</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon-box">
              <TrendingUp size={22} className="highlight-icon" />
            </div>
            <div className="highlight-text">
              <h3 className="highlight-title">Growth</h3>
              <p className="highlight-desc">Opportunities that create careers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
