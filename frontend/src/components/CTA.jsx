import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import './CTA.css';

export default function CTA() {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-card">
          {/* Abstract glows */}
          <div className="cta-glow glow-1" />
          <div className="cta-glow glow-2" />

          <div className="cta-content">
            <div className="cta-badge">
              <Sparkles size={14} />
              <span>Let's Build Together</span>
            </div>

            <h2 className="cta-headline">What's Your Next Big Idea?</h2>

            <div className="cta-narrative">
              <p>Maybe it's a website.</p>
              <p>Maybe it's an application.</p>
              <p>Maybe it's a business solution.</p>
              <p>Maybe it's your first technology project.</p>
              <p className="cta-punchline">Whatever it is, let's build it.</p>
            </div>

            <div className="cta-actions">
              <button 
                onClick={() => scrollTo('#contact')} 
                className="btn btn-primary cta-btn-main"
              >
                <span>Let's Talk</span>
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={() => scrollTo('#portfolio')} 
                className="btn btn-secondary cta-btn-secondary"
              >
                <span>Explore Our Work</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
