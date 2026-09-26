import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Cpu, 
  Compass, 
  TrendingUp, 
  CheckCircle2, 
  Terminal,
  Bot,
  Zap,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';
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
            <div className="hero-tech-badge">
              <Zap size={14} className="badge-sparkle" />
              <span>Next-Gen Tech Hub • Vibe Coding • Agentic AI • 72h Rapid MVPs</span>
            </div>

            <h1 className="hero-headline">
              Building the Future with <span className="text-gradient">Vibe Coding & Agentic AI.</span>
            </h1>

            <p className="hero-subline">
              Autonomous AI Agents • Prompt Engineering • 72-Hour Rapid MVPs • Practical Engineering
            </p>

            <p className="hero-description">
              Wingroo Technologies is a forward-thinking software and AI development company in Coimbatore. We pioneer 
              <strong> Vibe Coding</strong> workflows (using Cursor, v0 & Claude 3.5), build <strong>Custom Autonomous AI Agents</strong> (Gmail auto-responders, CRM lead routing & task automation), 
              and ship <strong>72-Hour Production-Ready MVPs</strong>. For engineering students, we conduct intensive 
              15–20 days college internships with up to 100% scholarships, daily timetables, and verified GitHub commits.
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
                <Zap size={16} className="stat-pill-icon" />
                <span>72-Hour Production MVP</span>
              </div>
              <div className="hero-stat-pill">
                <Bot size={16} className="stat-pill-icon" />
                <span>Autonomous Agentic AI</span>
              </div>
              <div className="hero-stat-pill">
                <BrainCircuit size={16} className="stat-pill-icon" />
                <span>Prompt Engineering (GPT-4o / Claude)</span>
              </div>
              <div className="hero-stat-pill">
                <GraduationCap size={16} className="stat-pill-icon" />
                <span>Up to 100% Merit Scholarship</span>
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
                  <span className="window-title">wingroo-agentic.engine.ts</span>
                </div>

                <div className="card-code-area">
                  <div className="code-line">
                    <span className="syntax-keyword">import</span> &#123; <span className="syntax-func">VibeCoding</span>, <span className="syntax-func">AgenticAI</span>, <span className="syntax-func">WorkflowEngine</span> &#125; <span className="syntax-keyword">from</span> <span className="syntax-str">'@wingroo/core'</span>;
                  </div>
                  <div className="code-line">
                    <span className="syntax-comment">// Autonomous Agent Pipeline & 72-Hour Rapid MVP Engine</span>
                  </div>
                  <div className="code-line">
                    <span className="syntax-keyword">export const</span> <span className="syntax-var">wingrooAgent</span> = <span className="syntax-keyword">await</span> <span className="syntax-func">AgenticAI</span>.initialize(&#123;
                  </div>
                  <div className="code-line indent">
                    <span className="syntax-prop">ideWorkflow:</span> [<span className="syntax-str">'Cursor'</span>, <span className="syntax-str">'v0.dev'</span>, <span className="syntax-str">'Claude-3.5-Sonnet'</span>],
                  </div>
                  <div className="code-line indent">
                    <span className="syntax-prop">autonomousAgents:</span> &#123;
                  </div>
                  <div className="code-line indent-2">
                    <span className="syntax-prop">gmailAutoResponder:</span> <span className="syntax-badge-inline">AUTO_REPLY_ACTIVE</span>,
                  </div>
                  <div className="code-line indent-2">
                    <span className="syntax-prop">crmLeadRouting:</span> <span className="syntax-badge-inline">DISPATCH_ONLINE</span>,
                  </div>
                  <div className="code-line indent-2">
                    <span className="syntax-prop">taskAutomation:</span> <span className="syntax-badge-inline">MULTI_STEP_SYNC</span>
                  </div>
                  <div className="code-line indent">&#125;,</div>
                  <div className="code-line indent">
                    <span className="syntax-prop">deploymentTarget:</span> <span className="syntax-str">'72_HOURS_PRODUCTION_READY'</span>,
                  </div>
                  <div className="code-line indent">
                    <span className="syntax-prop">uptime:</span> <span className="syntax-str">'99.98% REALTIME'</span>,
                  </div>
                  <div className="code-line indent">
                    <span className="syntax-prop">state:</span> <span className="syntax-badge-inline pulse-live">LIVE_PRODUCTION</span>
                  </div>
                  <div className="code-line">&#125;);</div>
                </div>

                <div className="tech-card-footer">
                  <div className="footer-metric">
                    <span className="metric-label">Execution Speed</span>
                    <span className="metric-val">72h Rapid MVP</span>
                  </div>
                  <div className="footer-metric">
                    <span className="metric-label">Core Pipeline</span>
                    <span className="metric-val" style={{ color: '#818cf8' }}>Cursor & Claude 3.5</span>
                  </div>
                  <div className="footer-status-pill">
                    <span className="live-status-dot" /> Autonomous Agent Active
                  </div>
                </div>
              </div>

              {/* Floating Card 1: Vibe Coding */}
              <div className="floating-card float-card-1">
                <div className="float-icon-wrap violet">
                  <Zap size={22} />
                </div>
                <div>
                  <div className="float-title">Vibe Coding</div>
                  <div className="float-subtitle">Cursor & Claude 3.5</div>
                </div>
              </div>

              {/* Floating Card 2: Agentic AI */}
              <div className="floating-card float-card-2">
                <div className="float-icon-wrap indigo">
                  <Bot size={22} />
                </div>
                <div>
                  <div className="float-title">Agentic AI</div>
                  <div className="float-subtitle">Gmail & CRM Agents</div>
                </div>
              </div>

              {/* Floating Card 3: Prompt Engineering */}
              <div className="floating-card float-card-3">
                <div className="float-icon-wrap emerald">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <div className="float-title">Prompt Engineering</div>
                  <div className="float-subtitle">GPT-4o & Multi-modal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Four Modern AI Highlight Cards below Hero */}
        <div className="hero-highlights-grid">
          <div className="highlight-item">
            <div className="highlight-icon-box">
              <Zap size={22} className="highlight-icon" />
            </div>
            <div className="highlight-text">
              <h3 className="highlight-title">Vibe Coding & 72h MVPs</h3>
              <p className="highlight-desc">From idea to live production within 72 hours using Cursor & Claude.</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon-box">
              <Bot size={22} className="highlight-icon" />
            </div>
            <div className="highlight-text">
              <h3 className="highlight-title">Agentic AI & Custom Agents</h3>
              <p className="highlight-desc">Autonomous systems handling Gmail auto-reply, CRM routing & task flows.</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon-box">
              <BrainCircuit size={22} className="highlight-icon" />
            </div>
            <div className="highlight-text">
              <h3 className="highlight-title">Advanced Prompt Engineering</h3>
              <p className="highlight-desc">Systematic multi-modal prompts across ChatGPT-4o, Claude & Gemini.</p>
            </div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon-box">
              <GraduationCap size={22} className="highlight-icon" />
            </div>
            <div className="highlight-text">
              <h3 className="highlight-title">15–20d College Internships</h3>
              <p className="highlight-desc">Up to 100% scholarships, daily timetables & live GitHub repos.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
