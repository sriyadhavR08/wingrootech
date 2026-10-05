import React from 'react';
import { 
  Search, 
  Map, 
  Palette, 
  Code2, 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  Sparkles,
  Layers
} from 'lucide-react';
import './HowWeWork.css';

const WORK_STEPS = [
  {
    step: '01',
    phase: 'DISCOVER',
    title: 'Discovery & Strategic Alignment',
    icon: <Search size={24} />,
    color: '#6366f1',
    summary: 'We dive deep into your business goals, target users, market competitors, and technical constraints.',
    deliverables: [
      '30-Min Requirements Breakdown',
      'Target Audience & User Personas',
      'Scope Baseline & Feature Checklist'
    ],
    timeframe: 'Day 1'
  },
  {
    step: '02',
    phase: 'PLAN',
    title: 'Architecture & Sprint Roadmap',
    icon: <Map size={24} />,
    color: '#06b6d4',
    summary: 'We map the database models, API contracts, cloud architecture, and select the optimal modern tech stack.',
    deliverables: [
      'Database ER Diagram & REST Schema',
      'Tech Stack & Cloud Infrastructure Plan',
      'Milestone Deadlines & 72h MVP Track'
    ],
    timeframe: 'Days 2 – 3'
  },
  {
    step: '03',
    phase: 'DESIGN',
    title: 'Modern UI/UX & Interactive Design',
    icon: <Palette size={24} />,
    color: '#ec4899',
    summary: 'We design high-converting, responsive layouts with clean typography, micro-interactions, and design tokens.',
    deliverables: [
      'Responsive Mobile-First Wireframes',
      'Design System (Colors, Fonts, Badges)',
      'Clickable Prototype Review'
    ],
    timeframe: 'Days 4 – 7'
  },
  {
    step: '04',
    phase: 'DEVELOP',
    title: 'Agile Engineering & Sprints',
    icon: <Code2 size={24} />,
    color: '#8b5cf6',
    summary: 'Our software engineers write clean, scalable code with Vibe Coding acceleration, security audits, and weekly demos.',
    deliverables: [
      'Modular Full-Stack Components',
      'Unit Tests & Performance Profiling',
      'Live Staging Link for Client Feedback'
    ],
    timeframe: 'Sprint Execution'
  },
  {
    step: '05',
    phase: 'LAUNCH',
    title: 'Cloud Deployment & Handover',
    icon: <Rocket size={24} />,
    color: '#10b981',
    summary: 'Production release on AWS/Vercel/Render with SSL encryption, SEO audits, documentation, and source code transfer.',
    deliverables: [
      'Live Production Domain & SSL',
      'Full GitHub Repository Ownership',
      '30-Day Post-Launch Technical Support'
    ],
    timeframe: 'Production Go-Live'
  }
];

export default function HowWeWork() {
  const scrollToContact = () => {
    const el = document.querySelector('#contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="how-we-work" className="how-we-work-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag b2b-process-tag">
            <span className="dot" />
            <span>Structured Client Delivery Process</span>
          </div>
          <h2 className="section-title">
            How We Work — <span className="text-gradient">From Concept to Production.</span>
          </h2>
          <p className="section-desc">
            No guesswork, no missed deadlines. Our transparent 5-step engineering pipeline 
            ensures you have complete visibility, live staging updates, and a production-grade software asset from day one.
          </p>
        </div>

        {/* Process Flow Cards Grid */}
        <div className="process-flow-grid">
          {WORK_STEPS.map((item, index) => (
            <div key={index} className="process-card modern-card">
              {/* Step Number & Connector */}
              <div className="process-card-top">
                <span className="process-step-pill" style={{ borderColor: `${item.color}40`, color: item.color }}>
                  STEP {item.step}
                </span>
                <span className="process-timeframe">{item.timeframe}</span>
              </div>

              {/* Icon & Phase */}
              <div className="process-icon-wrap" style={{ background: `${item.color}15`, color: item.color }}>
                {item.icon}
              </div>

              <div className="process-phase-badge">{item.phase}</div>
              <h3 className="process-step-title">{item.title}</h3>
              <p className="process-step-summary">{item.summary}</p>

              {/* Deliverables List */}
              <div className="process-deliverables-box">
                <div className="deliverables-heading">Key Deliverables:</div>
                <ul className="deliverables-list">
                  {item.deliverables.map((d, i) => (
                    <li key={i}>
                      <CheckCircle2 size={14} className="deliv-check" style={{ color: item.color }} />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow connector on desktop (except last item) */}
              {index < WORK_STEPS.length - 1 && (
                <div className="process-connector-arrow" aria-hidden="true">
                  <ArrowRight size={18} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Trust Banner */}
        <div className="process-cta-banner">
          <div className="process-cta-left">
            <div className="process-cta-badge">
              <Sparkles size={16} />
              <span>Transparent Software Development in Coimbatore</span>
            </div>
            <h4 className="process-cta-headline">Have a Project Idea? Let’s Architect It Together.</h4>
            <p className="process-cta-desc">
              Book a zero-obligation 30-minute consultation with our senior software engineers. 
              We’ll review your goals and provide an estimated timeline and architecture blueprint.
            </p>
          </div>

          <div className="process-cta-right">
            <button onClick={scrollToContact} className="btn btn-primary process-consult-btn">
              <span>Start Your Project</span>
              <ArrowRight size={16} />
            </button>
            <a 
              href="https://wa.me/918124779111?text=Hello%20Wingroo%20Technologies,%20I%20would%20like%20to%20discuss%20our%20project%20requirements." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary process-whatsapp-btn"
            >
              <span>WhatsApp Us ↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
