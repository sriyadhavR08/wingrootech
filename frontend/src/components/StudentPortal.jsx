import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  X, 
  CheckCircle, 
  Clock, 
  FileText, 
  ExternalLink, 
  Printer, 
  Phone, 
  Mail, 
  Sparkles, 
  Building2, 
  Calendar, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  ShieldCheck,
  Award,
  BookOpen
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import './StudentPortal.css';

export default function StudentPortal({ isOpen, onClose, initialQuery = '' }) {
  const [searchQuery, setSearchQuery] = useState(() => {
    return initialQuery || sessionStorage.getItem('wingroo_student_lookup') || '';
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSlip, setActiveSlip] = useState(null); // For printable slip modal view

  useEffect(() => {
    if (isOpen) {
      const stored = initialQuery || sessionStorage.getItem('wingroo_student_lookup') || '';
      if (stored) {
        setSearchQuery(stored);
        fetchStudentApplications(stored);
      }
    }
  }, [isOpen, initialQuery]);

  const fetchStudentApplications = async (queryToSearch) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) {
      setErrorMsg('Please enter your email, phone number, or application number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/applications?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearched(true);
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications);
        if (data.applications.length > 0) {
          sessionStorage.setItem('wingroo_student_lookup', q);
        }
      } else {
        setApplications([]);
        setErrorMsg(data.message || 'No applications found.');
      }
    } catch (err) {
      setSearched(true);
      setErrorMsg('Failed to connect to student server. Please check connection.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudentApplications(searchQuery);
  };

  const getStatusStage = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('select') || s.includes('admit') || s.includes('offer')) return 4;
    if (s.includes('interview') || s.includes('assessment')) return 3;
    if (s.includes('shortlist')) return 2;
    return 1; // Under Review
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('select') || s.includes('admit') || s.includes('offer')) return 'badge-selected';
    if (s.includes('interview') || s.includes('assessment')) return 'badge-interview';
    if (s.includes('shortlist')) return 'badge-shortlist';
    if (s.includes('reject')) return 'badge-rejected';
    return 'badge-review';
  };

  const handlePrintSlip = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="student-portal-overlay" onClick={onClose}>
      <div className="student-portal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="student-portal-header">
          <div className="student-brand-title">
            <div className="student-icon-badge">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="student-portal-tag">Candidate Services</div>
              <h3 className="student-portal-heading">Wingroo Student Portal</h3>
            </div>
          </div>

          <div className="student-header-actions">
            {searched && (
              <button 
                onClick={() => fetchStudentApplications(searchQuery)} 
                className="student-icon-btn" 
                title="Refresh Status"
              >
                <RefreshCw size={16} className={loading ? 'spin-anim' : ''} />
              </button>
            )}
            <button onClick={onClose} className="student-icon-btn student-close-btn" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="student-portal-body">
          {/* Search Box */}
          <div className="student-search-card">
            <div className="search-caption">
              <Sparkles size={16} style={{ color: '#0ea5e9' }} />
              <span>Track Your Internship Application & Real-Time Status</span>
            </div>
            <form onSubmit={handleSearchSubmit} className="student-search-form">
              <div className="search-input-wrap">
                <Search size={18} className="search-field-icon" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Registered Email, Phone, or Application # (e.g. WINGROO-INT-0001)"
                  className="student-search-input"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="student-search-btn">
                <span>{loading ? 'Searching...' : 'Track Application'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
            {errorMsg && (
              <div className="student-search-error">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Results View */}
          {loading ? (
            <div className="student-loading-state">
              <RefreshCw size={28} className="spin-anim" />
              <p>Fetching your application profile and status...</p>
            </div>
          ) : searched && applications.length > 0 ? (
            <div className="student-results-wrap">
              {/* Profile Overview Bar */}
              <div className="student-profile-strip">
                <div className="student-avatar-big">
                  {applications[0].name.slice(0, 2).toUpperCase()}
                </div>
                <div className="student-profile-info">
                  <div className="student-full-name">{applications[0].name}</div>
                  <div className="student-sub-detail">
                    <span>{applications[0].college}</span> • <span>{applications[0].course}</span> ({applications[0].year})
                  </div>
                  <div className="student-contact-chips">
                    <span className="contact-chip"><Mail size={12} /> {applications[0].email}</span>
                    <span className="contact-chip"><Phone size={12} /> {applications[0].phone}</span>
                  </div>
                </div>
                <div className="student-apps-count">
                  <span className="count-num">{applications.length}</span>
                  <span className="count-text">{applications.length === 1 ? 'Application' : 'Applications'}</span>
                </div>
              </div>

              {/* Applications List */}
              <div className="student-apps-list">
                {applications.map((app) => {
                  const stage = getStatusStage(app.status);
                  const isSelected = stage === 4;

                  return (
                    <div key={app.id} className="student-app-card">
                      {/* Top Meta Bar */}
                      <div className="app-card-top">
                        <div className="app-id-pill">
                          <FileText size={14} />
                          <span>{app.application_no}</span>
                        </div>
                        <div className="app-date-meta">
                          <Calendar size={13} />
                          <span>Applied on {app.created_at || 'Recently'}</span>
                        </div>
                        <span className={`status-pill ${getStatusBadgeClass(app.status)}`}>
                          {app.status || 'Under Review'}
                        </span>
                      </div>

                      {/* Domain and Track */}
                      <div className="app-program-row">
                        <div>
                          <div className="program-title">{app.technology} Track</div>
                          <div className="program-type">{app.internship_type}</div>
                        </div>
                        <button 
                          onClick={() => setActiveSlip(app)} 
                          className="btn-print-slip"
                          title="View Official Admission / Application Slip"
                        >
                          <Printer size={14} />
                          <span>View Admission Slip</span>
                        </button>
                      </div>

                      {/* 4-Stage Progress Stepper */}
                      <div className="app-stepper-wrap">
                        <div className="stepper-title">Application Review Workflow:</div>
                        <div className="app-stepper">
                          <div className={`step-node ${stage >= 1 ? 'step-done' : ''}`}>
                            <div className="step-circle">
                              {stage >= 1 ? <CheckCircle size={14} /> : '1'}
                            </div>
                            <span className="step-label">Submitted</span>
                          </div>
                          <div className={`step-line ${stage >= 2 ? 'line-done' : ''}`} />

                          <div className={`step-node ${stage >= 2 ? 'step-done' : stage === 1 ? 'step-active' : ''}`}>
                            <div className="step-circle">
                              {stage >= 2 ? <CheckCircle size={14} /> : '2'}
                            </div>
                            <span className="step-label">Profile Review</span>
                          </div>
                          <div className={`step-line ${stage >= 3 ? 'line-done' : ''}`} />

                          <div className={`step-node ${stage >= 3 ? 'step-done' : stage === 2 ? 'step-active' : ''}`}>
                            <div className="step-circle">
                              {stage >= 3 ? <CheckCircle size={14} /> : '3'}
                            </div>
                            <span className="step-label">Interview & Task</span>
                          </div>
                          <div className={`step-line ${stage >= 4 ? 'line-done' : ''}`} />

                          <div className={`step-node ${stage >= 4 ? 'step-done' : stage === 3 ? 'step-active' : ''}`}>
                            <div className="step-circle">
                              {stage >= 4 ? <Award size={14} /> : '4'}
                            </div>
                            <span className="step-label">Official Offer</span>
                          </div>
                        </div>
                      </div>

                      {/* Next Steps & Guidance Banner */}
                      <div className="app-guidance-box">
                        <div className="guidance-header">
                          <Clock size={15} style={{ color: '#0ea5e9' }} />
                          <span className="guidance-title">Current Status Notes:</span>
                        </div>
                        <p className="guidance-desc">
                          {app.notes ? (
                            app.notes
                          ) : isSelected ? (
                            "🎉 Congratulations! Your selection is confirmed. Welcome to Wingroo Technologies Internship Cohort. Check your WhatsApp & Email for onboarding materials and GitHub Classroom access."
                          ) : stage === 3 ? (
                            "Your profile has been shortlisted! Technical assessment details or meeting coordinates have been prepared. Please keep your email and phone active."
                          ) : stage === 2 ? (
                            "Your academic credentials and portfolio are being reviewed by our engineering mentors. Shortlist notifications are dispatched on a rolling basis."
                          ) : (
                            "Your application has been logged into the Wingroo Academic Pipeline. The evaluation panel will review your submissions within 24-48 business hours."
                          )}
                        </p>
                      </div>

                      {/* Helpdesk Action Row */}
                      <div className="app-footer-row">
                        <div className="mentor-support-hint">
                          Need priority assistance or schedule change?
                        </div>
                        <a 
                          href={`https://wa.me/919626779609?text=Hi%20Wingroo%20Technologies,%20I%20am%20${encodeURIComponent(app.name)}%20inquiring%20about%20my%20Internship%20Application%20${encodeURIComponent(app.application_no)}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn-whatsapp-query"
                        >
                          <Phone size={13} />
                          <span>Academic Desk (WhatsApp)</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : searched && applications.length === 0 ? (
            <div className="student-not-found-card">
              <GraduationCap size={44} style={{ color: '#64748b', opacity: 0.6, marginBottom: '14px' }} />
              <h4>No Application Found Matching "{searchQuery}"</h4>
              <p>
                Please verify that you entered the exact Email Address, Phone Number, or Application Number used during registration.
              </p>
              <div style={{ marginTop: '16px' }}>
                <a href="#internship" onClick={onClose} className="btn btn-primary">
                  <span>Apply for Internship Now</span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          ) : (
            /* Default Welcome State */
            <div className="student-welcome-card">
              <div className="welcome-illustration">
                <BookOpen size={36} style={{ color: '#0ea5e9' }} />
              </div>
              <h4>Welcome to Wingroo Student & Candidate Portal</h4>
              <p>
                Track your internship selection lifecycle, review academic verification status, access mentor evaluation feedback, and download your official admission acknowledgment slip anytime.
              </p>
              <div className="welcome-perks-grid">
                <div className="perk-box">
                  <CheckCircle size={16} className="perk-check" />
                  <span>Real-Time Status Tracking</span>
                </div>
                <div className="perk-box">
                  <CheckCircle size={16} className="perk-check" />
                  <span>Official Admission Slip</span>
                </div>
                <div className="perk-box">
                  <CheckCircle size={16} className="perk-check" />
                  <span>Direct Academic Mentorship</span>
                </div>
                <div className="perk-box">
                  <CheckCircle size={16} className="perk-check" />
                  <span>GitHub & LMS Integration</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Printable Admission Slip Modal View */}
        {activeSlip && (
          <div className="slip-modal-overlay" onClick={() => setActiveSlip(null)}>
            <div className="slip-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="slip-modal-header no-print">
                <span>Official Candidate Acknowledgment Slip</span>
                <button onClick={() => setActiveSlip(null)} className="slip-close-btn">
                  <X size={18} />
                </button>
              </div>

              {/* Printable Document Area */}
              <div className="slip-document-sheet">
                <div className="slip-doc-header">
                  <div className="doc-logo-area">
                    <div className="doc-brand">WINGROO TECHNOLOGIES</div>
                    <div className="doc-sub">Practical Innovation & Engineering Excellence</div>
                  </div>
                  <div className="doc-app-stamp">
                    <div className="doc-stamp-title">CANDIDATE SLIP</div>
                    <div className="doc-stamp-no">{activeSlip.application_no}</div>
                  </div>
                </div>

                <div className="doc-divider" />

                <div className="doc-grid-info">
                  <div className="doc-info-item">
                    <span className="doc-info-label">Candidate Full Name:</span>
                    <span className="doc-info-val">{activeSlip.name}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Current Status:</span>
                    <span className="doc-info-val status-highlight">{activeSlip.status}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">College / Institution:</span>
                    <span className="doc-info-val">{activeSlip.college}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Degree & Year:</span>
                    <span className="doc-info-val">{activeSlip.course} • {activeSlip.year}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Selected Track:</span>
                    <span className="doc-info-val">{activeSlip.technology}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Program Type:</span>
                    <span className="doc-info-val">{activeSlip.internship_type}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Email ID:</span>
                    <span className="doc-info-val">{activeSlip.email}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Phone Contact:</span>
                    <span className="doc-info-val">{activeSlip.phone}</span>
                  </div>
                </div>

                <div className="doc-verification-seal-row">
                  <div className="doc-seal-box">
                    <ShieldCheck size={28} style={{ color: '#0ea5e9' }} />
                    <div>
                      <div className="seal-title">VERIFIED CANDIDATE RECORD</div>
                      <div className="seal-sub">Digitally registered in Wingroo Tech Academic System</div>
                    </div>
                  </div>
                  <div className="doc-sign-area">
                    <div className="sign-line" />
                    <div className="sign-title">Academic Directorate</div>
                    <div className="sign-sub">Wingroo Technologies</div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="slip-modal-actions no-print">
                <button onClick={handlePrintSlip} className="btn btn-primary">
                  <Printer size={16} />
                  <span>Print / Save PDF Slip</span>
                </button>
                <button onClick={() => setActiveSlip(null)} className="btn btn-secondary">
                  <span>Close Preview</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
