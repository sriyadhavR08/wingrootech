import React from 'react';
import { Lightbulb, Wrench, BookOpen, Users2, Quote, CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import './About.css';

export default function About() {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const philosophies = [
    {
      icon: <Lightbulb size={24} />,
      title: 'Think Different.',
      desc: 'Look beyond conventional solutions and explore new possibilities.'
    },
    {
      icon: <Wrench size={24} />,
      title: 'Build Better.',
      desc: 'Turn ideas into practical, useful and scalable digital experiences.'
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Learn Continuously.',
      desc: 'Technology keeps evolving, and so do we.'
    },
    {
      icon: <Users2 size={24} />,
      title: 'Grow Together.',
      desc: 'Create opportunities where businesses, students and technology professionals can grow together.'
    }
  ];

  return (
    <section id="about" className="about-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot" />
            <span>Our Purpose & Vision</span>
          </div>
          <h2 className="section-title">More Than a Technology Company.</h2>
          <p className="section-desc">
            Bridging the gap between cutting-edge technology solutions and emerging talent through practical innovation.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="about-grid">
          {/* Column 1: Narrative */}
          <div className="about-text-col">
            <div className="about-lead-card">
              <p className="lead-paragraph">
                At <strong>Wingroo Technologies</strong>, we believe technology is not simply about writing code or creating applications. It is about understanding problems, discovering better possibilities and building solutions that people can actually use.
              </p>
              <p className="body-paragraph">
                We work across different technology areas to create modern digital experiences for businesses, organizations and emerging ideas. Our approach combines creativity, technical expertise and practical thinking to turn concepts into reliable digital solutions.
              </p>
              <p className="body-paragraph">
                At the same time, Wingroo is committed to helping students and aspiring technology professionals gain the experience they need to enter the industry with confidence. Through internships, live projects, workshops and technical events, we create an environment where learning happens through real experience.
              </p>
            </div>

            {/* Highlighted Quote */}
            <div className="about-quote-box">
              <Quote size={28} className="quote-icon" />
              <blockquote className="quote-text">
                “We don't just build technology. We build possibilities around it.”
              </blockquote>
              <div className="quote-author">— Wingroo Technologies Leadership</div>
            </div>
          </div>

          {/* Column 2: Tech & Ecosystem Visual Showcase */}
          <div className="about-visual-col">
            <div className="visual-card">
              <div className="visual-top">
                <span className="badge-chip">
                  <Zap size={14} /> Practical Innovation Matrix
                </span>
                <span className="badge-status">Active Ecosystem</span>
              </div>

              <div className="interactive-metric-grid">
                <div className="metric-box">
                  <div className="metric-num">100%</div>
                  <div className="metric-title">Hands-On Practice</div>
                  <p className="metric-sub">Real codebase exposure</p>
                </div>
                <div className="metric-box">
                  <div className="metric-num">Multi-Tech</div>
                  <div className="metric-title">Modern Domains</div>
                  <p className="metric-sub">Web, AI, Cloud, Mobile</p>
                </div>
                <div className="metric-box">
                  <div className="metric-num">Production</div>
                  <div className="metric-title">Standard Workflows</div>
                  <p className="metric-sub">Agile, CI/CD, Quality</p>
                </div>
                <div className="metric-box">
                  <div className="metric-num">Community</div>
                  <div className="metric-title">Mentorship Driven</div>
                  <p className="metric-sub">Industry guided growth</p>
                </div>
              </div>

              <div className="visual-action-strip">
                <div className="visual-action-text">
                  <ShieldCheck size={18} className="shield-icon" />
                  <span>Ready to collaborate or launch your project?</span>
                </div>
                <button onClick={() => scrollTo('#services')} className="btn btn-outline btn-sm">
                  <span>View Services</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Philosophy Strip */}
        <div className="philosophy-strip">
          <div className="philosophy-header">
            <h3 className="philosophy-title">Our Guiding Philosophy</h3>
            <p className="philosophy-sub">The principles that drive every solution we engineer</p>
          </div>

          <div className="philosophy-grid">
            {philosophies.map((item, idx) => (
              <div key={idx} className="philosophy-card modern-card">
                <div className="philosophy-icon-wrap">
                  {item.icon}
                </div>
                <h4 className="philosophy-card-title">{item.title}</h4>
                <p className="philosophy-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
