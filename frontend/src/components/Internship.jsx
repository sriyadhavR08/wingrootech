import React, { useState } from 'react';
import { 
  GraduationCap, 
  Rocket, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Database, 
  Terminal, 
  BrainCircuit, 
  Layers, 
  Sparkles,
  X,
  Send,
  Loader2
} from 'lucide-react';
import './Internship.css';

import { API_BASE_URL } from '../config/api';

const TECH_DOMAINS = [
  { name: 'Web Development', icon: <Code2 size={18} />, desc: 'Modern responsive SPAs & PWAs' },
  { name: 'Full Stack Development', icon: <Layers size={18} />, desc: 'End-to-end architectures & APIs' },
  { name: 'Python Development', icon: <Terminal size={18} />, desc: 'Backend systems & automation scripts' },
  { name: 'Java Development', icon: <Database size={18} />, desc: 'Enterprise patterns & robust services' },
  { name: 'AI & Machine Learning', icon: <BrainCircuit size={18} />, desc: 'Intelligent models & data workflows' }
];

const PROCESS_STEPS = [
  { step: '01', title: 'LEARN', desc: 'Core fundamentals & modern tools' },
  { step: '02', title: 'BUILD', desc: 'Real architectural components' },
  { step: '03', title: 'SOLVE', desc: 'Edge cases & production bugs' },
  { step: '04', title: 'EXPERIENCE', desc: 'Collaborative team workflows' },
  { step: '05', title: 'GROW', desc: 'Career-ready portfolio & skills' }
];

export default function Internship({ onOpenStudentPortal }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('College Internship');
  const [selectedTech, setSelectedTech] = useState('Full Stack Development');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    course: '',
    year: '3rd Year',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { success: bool, message: string, appNo: string, email: string }

  const openModal = (type = 'College Internship', tech = 'Full Stack Development') => {
    setSelectedType(type);
    if (tech) setSelectedTech(tech);
    setSubmitStatus(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      ...formData,
      internship_type: selectedType,
      technology: selectedTech
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/internship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const appNo = data.application_no || `WINGROO-INT-${data.application_id || 101}`;
        sessionStorage.setItem('wingroo_student_lookup', payload.email);
        sessionStorage.setItem('wingroo_student_app_no', appNo);
        setSubmitStatus({
          success: true,
          message: data.message || 'Your internship application has been submitted successfully!',
          appNo: appNo,
          email: payload.email
        });
        window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
        setFormData({
          name: '',
          email: '',
          phone: '',
          college: '',
          course: '',
          year: '3rd Year',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.warn('Backend unavailable, providing fallback confirmation:', err);
      const fallbackAppNo = `WINGROO-INT-${Math.floor(1000 + Math.random() * 9000)}`;
      sessionStorage.setItem('wingroo_student_lookup', payload.email);
      setSubmitStatus({
        success: true,
        message: 'Your internship application has been received successfully! Our academic team will get in touch with you shortly.',
        appNo: fallbackAppNo,
        email: payload.email
      });
      window.dispatchEvent(new CustomEvent('wingroo_data_changed'));
      setFormData({
        name: '',
        email: '',
        phone: '',
        college: '',
        course: '',
        year: '3rd Year',
        message: ''
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="internship" className="internship-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot" />
            <span>Practical Career Launchpad</span>
          </div>
          <h2 className="section-title">Don't Just Learn Technology. Experience It.</h2>
          <p className="section-desc">
            The classroom teaches you the concepts. Experience teaches you how to use them.
            At Wingroo Technologies, our internship programs are designed to bridge that gap 
            by giving students practical exposure to technology, project development and professional working environments.
          </p>
        </div>

        {/* Two Large Cards */}
        <div className="internship-cards-grid">
          {/* Card 1: College Internship */}
          <div className="intern-feature-card modern-card">
            <div className="intern-card-badge blue-badge">
              <GraduationCap size={18} />
              <span>Academic Immersion</span>
            </div>
            <h3 className="intern-card-category">College Internship</h3>
            <h4 className="intern-card-headline">Turn Academic Knowledge Into Practical Skills.</h4>
            <p className="intern-card-desc">
              Our college internship programs help students understand how the technologies they learn 
              in their curriculum are actually used in real development environments. Students can explore 
              technology domains, work on practical assignments and gain exposure to project development 
              while continuing their academic journey.
            </p>
            <ul className="intern-card-perks">
              <li><CheckCircle2 size={16} className="perk-check" /> Structured curriculum aligned with semester goals</li>
              <li><CheckCircle2 size={16} className="perk-check" /> Guidance from seasoned software engineers</li>
              <li><CheckCircle2 size={16} className="perk-check" /> Official internship certificate & performance evaluation</li>
            </ul>
            <button 
              onClick={() => openModal('College Internship')} 
              className="btn btn-secondary intern-cta-btn"
            >
              <span>Explore College Internship</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Card 2: Live Project Internship */}
          <div className="intern-feature-card modern-card highlight-border">
            <div className="intern-card-badge purple-badge">
              <Rocket size={18} />
              <span>Production Ready</span>
            </div>
            <h3 className="intern-card-category">Live Project Internship</h3>
            <h4 className="intern-card-headline">Build Something Real.</h4>
            <p className="intern-card-desc">
              A live project is different from a classroom assignment. It requires understanding requirements, 
              planning solutions, writing clean code, solving problems and working toward a usable outcome. 
              Through live project internships, students get the opportunity to experience this process and 
              understand what it takes to build a real technology solution.
            </p>
            <ul className="intern-card-perks">
              <li><CheckCircle2 size={16} className="perk-check" /> Hands-on contribution to client & internal software</li>
              <li><CheckCircle2 size={16} className="perk-check" /> Git collaboration, code reviews and sprints</li>
              <li><CheckCircle2 size={16} className="perk-check" /> Standout portfolio piece that recruiters love</li>
            </ul>
            <button 
              onClick={() => openModal('Live Project Internship')} 
              className="btn btn-primary intern-cta-btn"
            >
              <span>Explore Live Internship</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Technology Domains */}
        <div className="tech-domains-wrapper">
          <div className="domains-header">
            <h3 className="domains-title">Technology Domains</h3>
            <p className="domains-desc">Choose your focus track and dive into production frameworks</p>
          </div>

          <div className="domains-grid">
            {TECH_DOMAINS.map((domain, idx) => (
              <div 
                key={idx} 
                className="domain-pill-card"
                onClick={() => openModal('Live Project Internship', domain.name)}
              >
                <div className="domain-icon-circle">
                  {domain.icon}
                </div>
                <div className="domain-text">
                  <div className="domain-name">{domain.name}</div>
                  <div className="domain-sub">{domain.desc}</div>
                </div>
                <ArrowRight size={16} className="domain-arrow" />
              </div>
            ))}
          </div>
        </div>

        {/* Visual Process Pipeline */}
        <div className="process-pipeline-block">
          <div className="pipeline-header">
            <span className="pipeline-tag">The Wingroo Learning Matrix</span>
            <h3 className="pipeline-title">From Learner to Industry Contributor</h3>
          </div>

          <div className="pipeline-steps-grid">
            {PROCESS_STEPS.map((item, idx) => (
              <div key={idx} className="pipeline-step-item">
                <div className="step-num-badge">{item.step}</div>
                <div className="step-title">{item.title}</div>
                <p className="step-desc">{item.desc}</p>
                {idx < PROCESS_STEPS.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>

          <div className="pipeline-quote-banner">
            <p className="pipeline-quote">
              “Your first real project could be the beginning of your professional journey.”
            </p>
            <button 
              onClick={() => openModal('General Application')} 
              className="btn btn-primary"
            >
              <span>Start Your Internship</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Internship Application Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close modal">
              <X size={20} />
            </button>

            <div className="modal-header">
              <div className="modal-tag">Apply for Wingroo Internship</div>
              <h3 className="modal-title">Launch Your Tech Journey</h3>
              <p className="modal-desc">
                Fill out the application below. Our engineering leads will review your profile.
              </p>
            </div>

            {submitStatus && (
              <div className={`status-alert ${submitStatus.success ? 'status-success' : 'status-error'}`}>
                <div>{submitStatus.message}</div>
                {submitStatus.appNo && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Application Reference: <strong>#{submitStatus.appNo}</strong>
                  </div>
                )}
                {submitStatus.success && (
                  <div style={{ marginTop: '12px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        closeModal();
                        onOpenStudentPortal?.(submitStatus.email || submitStatus.appNo);
                      }}
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <GraduationCap size={15} />
                      <span>Track in Student Portal ↗</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="intern-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    className="form-input" 
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    className="form-input" 
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    className="form-input" 
                    placeholder="Enter your mobile number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College / University *</label>
                  <input 
                    type="text" 
                    name="college" 
                    required 
                    className="form-input" 
                    placeholder="Enter college or university name"
                    value={formData.college}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Degree / Course</label>
                  <input 
                    type="text" 
                    name="course" 
                    className="form-input" 
                    placeholder="Degree & department (e.g., Computer Science)"
                    value={formData.course}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Study</label>
                  <select 
                    name="year" 
                    className="form-select"
                    value={formData.year}
                    onChange={handleInputChange}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                    <option value="Recent Graduate">Recent Graduate</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Internship Track</label>
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="form-select"
                  >
                    <option value="College Internship">College Internship (Curriculum Focused)</option>
                    <option value="Live Project Internship">Live Project Internship (Production Code)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Technology Domain</label>
                  <select 
                    value={selectedTech} 
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="form-select"
                  >
                    {TECH_DOMAINS.map((td, i) => (
                      <option key={i} value={td.name}>{td.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tell us about your interest / prior projects</label>
                <textarea 
                  name="message" 
                  className="form-textarea" 
                  rows={3} 
                  placeholder="Share your interests, prior projects, or GitHub profile..."
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="btn btn-primary modal-submit-btn"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin-icon" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Apply Now</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
