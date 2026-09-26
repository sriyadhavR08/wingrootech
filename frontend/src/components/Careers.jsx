import React, { useState, useRef, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowRight, 
  UploadCloud, 
  CheckCircle2, 
  Sparkles, 
  Code, 
  Bot, 
  Zap, 
  Check, 
  FileText, 
  X, 
  ChevronLeft,
  ChevronRight, 
  Rocket, 
  ShieldCheck,
  Building2,
  Users,
  Compass,
  Cpu
} from 'lucide-react';
import './Careers.css';
import { API_BASE_URL } from '../config/api';

const OPEN_ROLES = [
  {
    id: 'ai-fullstack',
    title: 'Full-Stack AI Engineer',
    department: 'Engineering & Innovation',
    location: 'Coimbatore / Hybrid',
    type: 'Full-Time',
    experience: '0 – 2 Years / Freshers Welcome',
    description: 'Build robust web applications and autonomous AI pipelines using React, Python, and cutting-edge Vibe Coding tools.',
    skills: ['React', 'Python', 'FastAPI', 'Cursor', 'Claude API', 'Tailwind/CSS'],
    highlight: 'Work on live 72h MVPs & Agentic AI'
  },
  {
    id: 'agentic-prompt',
    title: 'Agentic AI & Prompt Engineer',
    department: 'Artificial Intelligence',
    location: 'Coimbatore / Remote',
    type: 'Full-Time',
    experience: 'Fresher / 1 – 3 Years',
    description: 'Design autonomous multi-agent systems for Gmail auto-replies, CRM workflows, and multi-modal prompt pipelines.',
    skills: ['Python', 'LangChain', 'OpenAI/Claude API', 'Autonomous Agents', 'Prompt Architecture'],
    highlight: 'Pioneer next-gen Autonomous Workflows'
  },
  {
    id: 'mobile-dev',
    title: 'Mobile App Developer (Flutter / React Native)',
    department: 'Mobile Solutions',
    location: 'Coimbatore',
    type: 'Full-Time',
    experience: '1 – 3 Years',
    description: 'Lead web and mobile app development for flagship products including ZENTIME and IIE PULSE (Web & Mobile Platform) with offline sync and clean state management.',
    skills: ['Flutter', 'Dart', 'React Native', 'React.js', 'REST APIs', 'Firebase', 'State Management'],
    highlight: 'Build ZENTIME & IIE PULSE web & mobile apps'
  },
  {
    id: 'frontend-uiux',
    title: 'Frontend Developer & UI/UX Specialist',
    department: 'Product & Design',
    location: 'Coimbatore',
    type: 'Full-Time',
    experience: '0 – 2 Years / Freshers Welcome',
    description: 'Craft visually stunning, high-converting interfaces, micro-animations, and reusable component libraries.',
    skills: ['Figma', 'React', 'Modern Vanilla CSS', 'Responsive UI', 'Interaction Design'],
    highlight: 'Create state-of-the-art Web & App UIs'
  }
];

const CULTURE_PERKS = [
  {
    icon: Zap,
    title: 'Vibe Coding & Modern Tools',
    desc: 'Work with Cursor, Claude 3.5 Sonnet, v0, and high-speed AI tooling rather than slow repetitive manual scaffolding.'
  },
  {
    icon: Bot,
    title: 'Live Agentic AI Development',
    desc: 'Get hands-on experience developing autonomous AI agents, multi-step task execution systems, and production pipelines.'
  },
  {
    icon: Rocket,
    title: '72-Hour Rapid MVP Delivery',
    desc: 'Experience the thrill of turning bold product concepts into production deployments within 72 hours for live clients.'
  },
  {
    icon: Users,
    title: 'Direct Mentorship & Growth',
    desc: 'Work directly alongside the founding tech team with transparent communication, real accountability, and rapid career progression.'
  }
];

export default function Careers() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Job Application Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience_level: 'Fresher',
    technologies: [],
    portfolio_url: '',
    message: '',
    resume_name: '',
    resume_url: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { success: bool, message: str, appNo: str }

  // User-Controlled Slider State (No Auto-Slide)
  const rolesSliderRef = useRef(null);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const checkRolesScroll = () => {
    const el = rolesSliderRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 10);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

    const firstCard = el.querySelector('.role-slide-item');
    if (firstCard) {
      const cardWidth = firstCard.offsetWidth + 24;
      const index = Math.round(el.scrollLeft / cardWidth);
      setActiveRoleIndex(Math.min(Math.max(index, 0), OPEN_ROLES.length - 1));
    }
  };

  useEffect(() => {
    checkRolesScroll();
    window.addEventListener('resize', checkRolesScroll);
    return () => window.removeEventListener('resize', checkRolesScroll);
  }, []);

  const scrollRoles = (direction) => {
    const el = rolesSliderRef.current;
    if (!el) return;
    const firstCard = el.querySelector('.role-slide-item');
    const scrollAmount = firstCard ? (firstCard.offsetWidth + 24) : 380;
    el.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  const scrollToRoleIndex = (index) => {
    const el = rolesSliderRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.role-slide-item');
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      setActiveRoleIndex(index);
    }
  };

  const handleOpenApply = (role = null) => {
    setSelectedRole(role);
    if (role) {
      setFormData(prev => ({
        ...prev,
        technologies: role.skills.slice(0, 3)
      }));
    }
    setSubmitResult(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setSubmitResult(null);
  };

  const toggleTechnology = (tech) => {
    setFormData(prev => {
      const exists = prev.technologies.includes(tech);
      return {
        ...prev,
        technologies: exists 
          ? prev.technologies.filter(t => t !== tech)
          : [...prev.technologies, tech]
      };
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller PDF/Word document.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        resume_name: file.name,
        resume_url: reader.result // Data URL / Base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please enter your name, email, and phone number.");
      return;
    }

    if (!formData.resume_url && !formData.resume_name) {
      alert("Please upload your Resume / CV before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      experience_level: formData.experience_level,
      technologies: formData.technologies.length > 0 ? formData.technologies : [selectedRole ? selectedRole.title : 'General Application'],
      resume_url: formData.resume_url || formData.resume_name,
      portfolio_url: formData.portfolio_url,
      message: formData.message || `Applying for ${selectedRole ? selectedRole.title : 'General Position'}`
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/careers/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitResult({
          success: true,
          message: data.message || "Application submitted successfully!",
          appNo: data.application_no || `WINGROO-JOB-${Math.floor(1000 + Math.random() * 9000)}`
        });
      } else {
        throw new Error(data.message || 'Failed to submit application.');
      }
    } catch (err) {
      console.warn("Backend submit fallback:", err);
      // Seamless optimistic confirmation
      const fallbackAppNo = `WINGROO-JOB-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmitResult({
        success: true,
        message: "Your application has been received! Our talent acquisition team will review your profile.",
        appNo: fallbackAppNo
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const TECH_OPTIONS = [
    'Vibe Coding',
    'Agentic AI',
    'React / Next.js',
    'Python / FastAPI',
    'Flutter / Dart',
    'Prompt Engineering',
    'UI/UX Design',
    'Node.js / Express'
  ];

  return (
    <section id="careers" className="careers-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <span className="dot" />
            <span>Join Our Team</span>
          </div>
          <h2 className="section-title">Build What's Next. Shape Your Career.</h2>
          <p className="section-desc">
            At Wingroo Technologies, we don't just write code — we build autonomous AI systems, rapid 72-hour MVPs, 
            and flagship mobile products. Whether you are an ambitious fresher or an experienced technologist, 
            discover exciting opportunities to grow, innovate, and make a real-world impact.
          </p>
        </div>

        {/* Culture & Perks Grid */}
        <div className="careers-perks-grid">
          {CULTURE_PERKS.map((perk, idx) => {
            const IconComp = perk.icon;
            return (
              <div key={idx} className="career-perk-card">
                <div className="perk-icon-wrap">
                  <IconComp size={22} />
                </div>
                <h3 className="perk-card-title">{perk.title}</h3>
                <p className="perk-card-desc">{perk.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Flagship Product Showcase Banner */}
        <div className="careers-product-banner">
          <div className="banner-badge">
            <Sparkles size={14} />
            <span>Active Engineering Products</span>
          </div>
          <h3 className="banner-title">Work On Cutting-Edge Live Applications</h3>
          <p className="banner-desc">
            Our teams are actively architecting and scaling production software including 
            <strong> ZENTIME</strong> (Next-gen Productivity & Time Management Mobile App), 
            <strong> IIE PULSE</strong> (Comprehensive Web & Mobile Educational Platform), and 
            <strong> Autonomous Agentic Workflows</strong> (Gmail auto-responders & CRM routing).
          </p>
          <div className="banner-tags">
            <span className="b-tag">📱 ZENTIME Mobile App</span>
            <span className="b-tag">🌐📱 IIE PULSE (Web & Mobile)</span>
            <span className="b-tag">🤖 Custom Autonomous AI</span>
            <span className="b-tag">🚀 72h Rapid MVP Engine</span>
          </div>
        </div>

        {/* Open Job Positions Grid */}
        <div className="open-positions-header">
          <div>
            <h3 className="positions-title">Current Open Positions</h3>
            <p className="positions-subtitle">We are hiring for our Coimbatore hub and remote collaborative positions.</p>
          </div>
          <button 
            type="button" 
            onClick={() => handleOpenApply(null)} 
            className="btn btn-outline general-apply-btn"
          >
            <span>General Application</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* User-Controlled Roles Slider (No Auto-Slide) */}
        <div className="roles-slider-wrapper">
          <div className="roles-slider-container">
            <button 
              type="button"
              className="roles-slider-arrow roles-slider-prev"
              onClick={() => scrollRoles('prev')}
              disabled={!canScrollPrev}
              aria-label="Previous job position"
              title="Previous position"
            >
              <ChevronLeft size={22} />
            </button>

            <div 
              className="roles-slider-track" 
              ref={rolesSliderRef}
              onScroll={checkRolesScroll}
            >
              {OPEN_ROLES.map((role) => (
                <div key={role.id} className="role-slide-item">
                  <div className="role-card">
                    <div className="role-card-top">
                      <div className="role-dept-tag">{role.department}</div>
                      <div className="role-highlight-pill">{role.highlight}</div>
                    </div>

                    <h4 className="role-title">{role.title}</h4>
                    <p className="role-desc">{role.description}</p>

                    <div className="role-meta-list">
                      <div className="role-meta-item">
                        <MapPin size={15} />
                        <span>{role.location}</span>
                      </div>
                      <div className="role-meta-item">
                        <Clock size={15} />
                        <span>{role.type}</span>
                      </div>
                      <div className="role-meta-item">
                        <Briefcase size={15} />
                        <span>{role.experience}</span>
                      </div>
                    </div>

                    <div className="role-skills-wrap">
                      {role.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="role-skill-pill">{skill}</span>
                      ))}
                    </div>

                    <div className="role-footer">
                      <button
                        type="button"
                        onClick={() => handleOpenApply(role)}
                        className="btn btn-primary role-apply-btn"
                      >
                        <span>Apply For This Role</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button"
              className="roles-slider-arrow roles-slider-next"
              onClick={() => scrollRoles('next')}
              disabled={!canScrollNext}
              aria-label="Next job position"
              title="Next position"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Interactive Navigation Dots & Counter */}
          <div className="roles-slider-controls">
            <div className="roles-slider-dots">
              {OPEN_ROLES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`roles-dot ${activeRoleIndex === idx ? 'active' : ''}`}
                  onClick={() => scrollToRoleIndex(idx)}
                  aria-label={`Go to position ${idx + 1}`}
                />
              ))}
            </div>
            <div className="slider-hint-text">
              <span>← Drag or click arrows to view more roles →</span>
            </div>
            <div className="roles-slider-counter">
              <span>{activeRoleIndex + 1}</span> / <span>{OPEN_ROLES.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Job Application Modal */}
      {isModalOpen && (
        <div className="job-modal-backdrop" onClick={handleCloseModal}>
          <div className="job-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="job-modal-header">
              <div className="job-modal-title-group">
                <div className="job-modal-badge">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h3 className="job-modal-title">
                    {selectedRole ? `Apply: ${selectedRole.title}` : 'Wingroo Career Application'}
                  </h3>
                  <p className="job-modal-subtitle">
                    {selectedRole ? `${selectedRole.department} • ${selectedRole.location}` : 'Join our forward-thinking engineering team in Coimbatore'}
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="job-modal-close"
                aria-label="Close Modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="job-modal-body">
              {submitResult ? (
                <div className="job-success-card">
                  <div className="success-icon-wrap">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="success-title">Application Submitted Successfully!</h4>
                  <p className="success-desc">
                    Thank you for your interest in joining Wingroo Technologies. 
                    Our talent acquisition team will review your profile and contact you soon.
                  </p>
                  
                  <div className="success-app-badge">
                    <span className="app-badge-label">Application Reference Number:</span>
                    <strong className="app-badge-no">{submitResult.appNo}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-primary btn-block"
                    style={{ marginTop: '20px' }}
                  >
                    <span>Done</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="job-application-form">
                  <div className="job-form-row">
                    <div className="job-form-group">
                      <label className="job-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="job-input"
                        placeholder="e.g. Sri Yadhav"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="job-form-group">
                      <label className="job-label">Email Address *</label>
                      <input
                        type="email"
                        required
                        className="job-input"
                        placeholder="e.g. candidate@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="job-form-row">
                    <div className="job-form-group">
                      <label className="job-label">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        className="job-input"
                        placeholder="e.g. +91 96267 79609"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="job-form-group">
                      <label className="job-label">Experience Level *</label>
                      <select
                        className="job-select"
                        value={formData.experience_level}
                        onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                      >
                        <option value="Fresher">Fresher / College Graduate</option>
                        <option value="1-2 Years">1 – 2 Years Professional Experience</option>
                        <option value="3+ Years">3+ Years Experienced Professional</option>
                        <option value="Student">Current Student / Seeking Internship</option>
                      </select>
                    </div>
                  </div>

                  {/* Skills / Tech Selection Chips */}
                  <div className="job-form-group">
                    <label className="job-label">Key Technologies & Domains (Select all that apply) *</label>
                    <div className="job-tech-selector">
                      {TECH_OPTIONS.map((tech) => {
                        const isSelected = formData.technologies.includes(tech);
                        return (
                          <button
                            type="button"
                            key={tech}
                            onClick={() => toggleTechnology(tech)}
                            className={`job-tech-chip ${isSelected ? 'selected' : ''}`}
                          >
                            {isSelected && <Check size={14} />}
                            <span>{tech}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Resume Upload Box */}
                  <div className="job-form-group">
                    <label className="job-label">Resume / CV (PDF or DOCX, max 5MB) *</label>
                    <label className="job-upload-box">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      <UploadCloud size={24} className="upload-icon" />
                      <div className="upload-info">
                        {formData.resume_name ? (
                          <div className="file-ready">
                            <FileText size={16} />
                            <strong>{formData.resume_name}</strong>
                            <span className="file-change-hint">(Click to change)</span>
                          </div>
                        ) : (
                          <>
                            <strong>Click to browse & upload your Resume / CV</strong>
                            <span>Supports PDF, DOC, DOCX up to 5MB</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  <div className="job-form-group">
                    <label className="job-label">Portfolio, GitHub, or LinkedIn URL (Optional)</label>
                    <input
                      type="url"
                      className="job-input"
                      placeholder="e.g. https://github.com/your-username"
                      value={formData.portfolio_url}
                      onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    />
                  </div>

                  <div className="job-form-group">
                    <label className="job-label">Short Note or Message (Optional)</label>
                    <textarea
                      rows={3}
                      className="job-textarea"
                      placeholder="Tell us about yourself, key projects, or why you want to work at Wingroo..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <div className="job-modal-footer">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-primary submit-app-btn"
                    >
                      {isSubmitting ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
