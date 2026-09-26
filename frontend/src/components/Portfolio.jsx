import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Users, 
  ShieldAlert, 
  TrendingUp, 
  X, 
  Laptop, 
  Check, 
  Globe, 
  Code 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './Portfolio.css';

export default function Portfolio() {
  const [projectsList, setProjectsList] = useState([]);
  const [activeProjectModal, setActiveProjectModal] = useState(null);

  const fetchProjects = () => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.projects)) {
          if (data.projects.length === 0) {
            setProjectsList([]);
            return;
          }
          const enriched = data.projects.map((p, idx) => {
            const isZ = (p.title || '').toUpperCase().includes('ZENTIME');
            const isI = (p.title || '').toUpperCase().includes('IIE');
            const title = isI ? 'IIE PULSE' : p.title;
            const category = isI ? 'Web & Mobile App' : (p.category || 'Digital Platform');
            const tag = isI ? 'Web & Mobile Platform' : (p.tag || 'Featured Project');
            const heading = isI ? 'All-In-One Academic & Student Management Platform.' : (p.heading || p.title);
            const demoUrl = isZ 
              ? 'https://zentime.co.in/#dashboard' 
              : isI 
                ? 'https://iiepulse.indrainstitute.com/' 
                : (p.demoUrl || p.project_url || 'https://wingrootechnologies.com/');

            const image = isZ
              ? (p.image || '/zentime-preview.png')
              : isI 
                ? (p.image || '/iiepulse-preview.png') 
                : p.image;

            return {
              ...p,
              title,
              category,
              tag,
              heading,
              demoUrl,
              image,
              stats: p.stats || (isZ ? [
                { label: 'Attendance Accuracy', value: '100% Real-Time' },
                { label: 'Leave & Swap Approval', value: '< 2 Mins' },
                { label: 'Employee Adoption', value: '99.4%' }
              ] : isI ? [
                { label: 'Web & Mobile Access', value: '100% Cloud' },
                { label: 'Active Students & Staff', value: '12,500+' },
                { label: 'System Reliability', value: '99.9% Uptime' }
              ] : [
                { label: 'Performance Reliability', value: '99.9%' },
                { label: 'Satisfaction Score', value: '4.9/5' },
                { label: 'Architecture', value: 'Enterprise Grade' }
              ]),
              themeColor: p.themeColor || (idx % 2 === 0 ? '#4f46e5' : '#0ea5e9')
            };
          });
          setProjectsList(enriched);
        } else {
          setProjectsList([]);
        }
      })
      .catch(() => {
        setProjectsList([]);
      });
  };

  useEffect(() => {
    fetchProjects();
    window.addEventListener('wingroo_data_changed', fetchProjects);
    return () => window.removeEventListener('wingroo_data_changed', fetchProjects);
  }, []);

  const handleOpenModal = (project) => {
    setActiveProjectModal(project);
  };

  const handleCloseModal = () => {
    setActiveProjectModal(null);
  };

  return (
    <section id="portfolio" className="portfolio-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="section-tag">
            <span className="dot" />
            <span>Featured Work & Platforms</span>
          </div>
          <h2 className="section-title">Turning Ideas Into Real-World Solutions.</h2>
          <p className="section-desc">
            We don't just build code; we craft digital experiences that solve real challenges 
            and create real impact. Take a look at some of the platforms developed and powered 
            by Wingroo Technologies.
          </p>
        </div>

        {/* Dynamic Projects Showcase List */}
        {projectsList.length > 0 ? (
          <div className="portfolio-showcase-list">
          {projectsList.map((project, index) => {
            const isReverse = index % 2 === 1;
            const isZentime = project.title.toUpperCase() === 'ZENTIME';
            const isIIE = project.title.toUpperCase().includes('IIE');

            return (
              <div 
                key={project.id || index} 
                className={`featured-project-card modern-card ${isReverse ? 'reverse-card' : ''}`}
              >
                <div className="project-grid">
                  {/* Left Info Column */}
                  <div className="project-info-col">
                    <div className={`project-tag-pill ${isReverse ? 'cyan-pill' : ''}`}>
                      <Sparkles size={14} />
                      <span>{project.tag || 'Project'}</span>
                    </div>

                    <h3 className={`project-brand-name ${isReverse ? 'cyan-text' : ''}`}>
                      {project.title}
                    </h3>
                    <h4 className="project-main-heading">{project.heading || project.title}</h4>
                    <p className="project-desc">{project.description}</p>

                    <div className="project-feature-tags">
                      {(project.tags || []).map((tag, i) => (
                        <span key={i} className="feature-chip">
                          <Check size={12} className="chip-check" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="project-btn-row">
                      <a 
                        href={project.demoUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary project-cta"
                        title={`View ${project.title} live platform`}
                      >
                        <span>View {project.title}</span>
                        <ExternalLink size={16} />
                      </a>
                      <button 
                        type="button"
                        onClick={() => handleOpenModal(project)} 
                        className="btn btn-secondary project-cta"
                        title="View details and architecture"
                      >
                        <span>Project Overview</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Right Mockup Visual Column */}
                  <div className="project-preview-col">
                    {project.videoUrl ? (
                      <div className="project-mockup-frame" style={{ borderColor: project.themeColor }}>
                        <div className="mockup-header-bar">
                          <div className="mockup-dots">
                            <span className="dot-red" />
                            <span className="dot-yellow" />
                            <span className="dot-green" />
                          </div>
                          <span className="mockup-title-text">{project.title.toLowerCase().replace(/\s+/g, '')}.wingrootechnologies.com (Video)</span>
                        </div>
                        <div className="project-media-container">
                          <video 
                            src={project.videoUrl} 
                            controls 
                            playsInline 
                            poster={project.image || undefined}
                            className="project-media-video" 
                          />
                        </div>
                      </div>
                    ) : (project.image || isZentime) ? (
                      <div className="project-mockup-frame" style={{ borderColor: project.themeColor }}>
                        <div className="mockup-header-bar">
                          <div className="mockup-dots">
                            <span className="dot-red" />
                            <span className="dot-yellow" />
                            <span className="dot-green" />
                          </div>
                          <a 
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mockup-title-text"
                            style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}
                            title={`Open ${project.demoUrl}`}
                          >
                            {isZentime 
                              ? 'zentime.co.in/#dashboard ↗' 
                              : isIIE 
                                ? 'iiepulse.indrainstitute.com ↗' 
                                : `${project.title.toLowerCase().replace(/\s+/g, '')}.wingrootechnologies.com ↗`}
                          </a>
                        </div>
                        <a 
                          href={project.demoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="project-media-container"
                          title={`Click to open ${project.title} live platform`}
                          style={{ display: 'block', cursor: 'pointer' }}
                        >
                          <img 
                            src={project.image || (isZentime ? '/zentime-preview.png' : '')} 
                            alt={project.title} 
                            className="project-media-img" 
                          />
                        </a>
                      </div>
                    ) : isIIE ? (
                      <div className="project-mockup-frame frame-iie mobile-mockup-frame">
                        <div className="mockup-header-bar mobile-statusbar">
                          <span className="mobile-clock">10:15 AM</span>
                          <a 
                            href={project.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mockup-title-text"
                            style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }}
                            title="Open https://iiepulse.indrainstitute.com/"
                          >
                            iiepulse.indrainstitute.com ↗
                          </a>
                          <span className="mobile-battery-badge" style={{ color: '#38bdf8' }}>100% ⚡</span>
                        </div>

                        <div className="mockup-screen-content mobile-screen-layout">
                          {/* App Brand Header */}
                          <div className="iie-mobile-header">
                            <div className="iie-logo-badge">
                              <Globe size={18} />
                            </div>
                            <div className="iie-header-text">
                              <div className="iie-app-name">IIE PULSE Community</div>
                              <div className="iie-app-tag">Campus News, Courses & Vlogs</div>
                            </div>
                            <span className="iie-live-pill">🔴 LIVE FEED</span>
                          </div>

                          {/* 1. Live News Updates Banner */}
                          <div className="iie-news-card">
                            <div className="iie-news-header">
                              <span className="news-badge">LIVE NEWS UPDATE</span>
                              <span className="news-time">Just Now</span>
                            </div>
                            <div className="news-title">Global Innovation Hackathon & AI Seminar 2026 Announced!</div>
                            <div className="news-snippet">New registration cohorts opened across partner colleges & tech clubs.</div>
                          </div>

                          {/* 2 & 3. Quick Actions: Courses Catalog & Photo Gallery */}
                          <div className="zentime-quick-actions-grid">
                            <div className="zentime-action-tile iie-action-tile">
                              <span className="action-tile-icon">📚</span>
                              <span className="action-tile-name">Courses Catalog</span>
                              <span className="action-tile-sub">Full-Stack, AI & DevOps</span>
                            </div>
                            <div className="zentime-action-tile iie-action-tile">
                              <span className="action-tile-icon">🖼️</span>
                              <span className="action-tile-name">Event Gallery</span>
                              <span className="action-tile-sub">450+ High-Res Photos</span>
                            </div>
                          </div>

                          {/* 4. Vlogs & Student Updates Strip */}
                          <div className="iie-vlog-tile">
                            <div className="vlog-play-icon">▶</div>
                            <div className="vlog-info">
                              <div className="vlog-title">Latest Vlog: Student Innovations & Project Demos</div>
                              <div className="vlog-meta">Campus Vlogs Series • 2.8k Views</div>
                            </div>
                            <span className="vlog-new-badge">NEW VLOG</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Generic Dynamic Mockup for Admin Added Projects */
                      <div className="project-mockup-frame" style={{ borderColor: project.themeColor }}>
                        <div className="mockup-header-bar">
                          <div className="mockup-dots">
                            <span className="dot-red" />
                            <span className="dot-yellow" />
                            <span className="dot-green" />
                          </div>
                          <span className="mockup-title-text">{project.title.toLowerCase().replace(/\s+/g, '')}.wingrootechnologies.com</span>
                        </div>
                        <div className="mockup-screen-content" style={{ padding: '24px', background: '#090d16' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: project.themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                <Globe size={18} />
                              </div>
                              <div>
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{project.title}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{project.category || 'Digital Solution'}</div>
                              </div>
                            </div>
                            <span style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '999px', fontWeight: 600 }}>LIVE IN PRODUCTION</span>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '16px' }}>
                            <div style={{ color: '#e2e8f0', fontSize: '0.85rem', lineHeight: '1.5' }}>
                              {project.description.slice(0, 140)}...
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {(project.stats || []).slice(0, 3).map((st, sIdx) => (
                              <div key={sIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ color: project.themeColor, fontWeight: 700, fontSize: '1.1rem' }}>{st.value}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{st.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="portfolio-empty-state modern-card" style={{ textAlign: 'center', padding: '50px 20px', margin: '20px 0', border: '1px dashed rgba(255,255,255,0.12)' }}>
            <Laptop size={40} style={{ color: '#4f46e5', marginBottom: '14px', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>No Featured Projects Published Currently</h3>
            <p style={{ color: '#94a3b8', maxWidth: '520px', margin: '0 auto', fontSize: '0.92rem' }}>
              We are constantly developing innovative web applications, AI platforms, and digital solutions. New portfolio entries will be showcased here!
            </p>
          </div>
        )}

        {/* Closing Portfolio Statement */}
        <div className="portfolio-statement-card">
          <div className="statement-content">
            <blockquote className="statement-quote">
              “From an idea on paper to something people can use.”
            </blockquote>
            <p className="statement-author">That's where technology becomes meaningful.</p>
          </div>
          <a href="#contact" className="btn btn-primary statement-cta">
            <span>Start a Project With Us</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Project Detail Modal */}
      {activeProjectModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              <X size={20} />
            </button>

            <div className="modal-header">
              <span className="modal-tag">{activeProjectModal.tag || 'Featured Project'}</span>
              <h3 className="modal-title">{activeProjectModal.title}</h3>
              <p className="modal-subtitle">{activeProjectModal.heading || activeProjectModal.title}</p>
            </div>

            <div className="modal-body">
              {activeProjectModal.videoUrl ? (
                <div className="modal-media-wrap">
                  <video 
                    src={activeProjectModal.videoUrl} 
                    controls 
                    className="modal-media-video" 
                  />
                </div>
              ) : activeProjectModal.image ? (
                <div className="modal-media-wrap">
                  <img 
                    src={activeProjectModal.image} 
                    alt={activeProjectModal.title} 
                    className="modal-media-img" 
                  />
                </div>
              ) : null}

              <p className="modal-desc">{activeProjectModal.description}</p>

              <div className="modal-stats-grid">
                {(activeProjectModal.stats || []).map((s, idx) => (
                  <div key={idx} className="modal-stat-box">
                    <span className="modal-stat-value">{s.value}</span>
                    <span className="modal-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="modal-features-list">
                <h4 className="modal-subheading">Core Highlights</h4>
                {(activeProjectModal.tags || []).map((t, idx) => (
                  <div key={idx} className="modal-feature-item">
                    <CheckCircle size={16} className="modal-check-icon" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <a 
                href={activeProjectModal.demoUrl || '#contact'} 
                target={activeProjectModal.demoUrl ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <span>Visit Live Platform</span>
                <ExternalLink size={16} />
              </a>
              <button onClick={handleCloseModal} className="btn btn-secondary">
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
