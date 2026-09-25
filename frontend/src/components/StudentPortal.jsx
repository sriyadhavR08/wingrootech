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
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeSlip, setActiveSlip] = useState(null); // For printable slip modal view
  const [activePass, setActivePass] = useState(null); // For printable event pass
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'internships' | 'events'

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
      setErrorMsg('Please enter your email, phone number, or application / registration number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/student/applications?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearched(true);
      if (data.success) {
        const apps = Array.isArray(data.applications) ? data.applications : [];
        const evRegs = Array.isArray(data.event_registrations) ? data.event_registrations : [];
        setApplications(apps);
        setEventRegistrations(evRegs);

        if (apps.length > 0 || evRegs.length > 0) {
          sessionStorage.setItem('wingroo_student_lookup', q);
        } else {
          setErrorMsg(data.message || 'No applications or event registrations found.');
        }
      } else {
        setApplications([]);
        setEventRegistrations([]);
        setErrorMsg(data.message || 'No applications or event registrations found.');
      }
    } catch (err) {
      setSearched(true);
      setErrorMsg('Failed to connect to candidate server. Please check connection.');
      setApplications([]);
      setEventRegistrations([]);
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
          ) : searched && (applications.length > 0 || eventRegistrations.length > 0) ? (
            <div className="student-results-wrap">
              {/* Profile Overview Bar */}
              {(() => {
                const primaryRecord = applications[0] || eventRegistrations[0];
                return (
                  <div className="student-profile-strip">
                    <div className="student-avatar-big">
                      {primaryRecord.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="student-profile-info">
                      <div className="student-full-name">{primaryRecord.name}</div>
                      <div className="student-sub-detail">
                        <span>{primaryRecord.college}</span> {primaryRecord.year ? `• ${primaryRecord.year}` : ''}
                      </div>
                      <div className="student-contact-chips">
                        <span className="contact-chip"><Mail size={12} /> {primaryRecord.email}</span>
                        <span className="contact-chip"><Phone size={12} /> {primaryRecord.phone}</span>
                      </div>
                    </div>
                    <div className="student-apps-count">
                      <span className="count-num">{applications.length + eventRegistrations.length}</span>
                      <span className="count-text">Total Records</span>
                    </div>
                  </div>
                );
              })()}

              {/* Sub-Tabs Selector */}
              <div className="student-portal-tabs" style={{ display: 'flex', gap: '8px', margin: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <button 
                  onClick={() => setActiveSubTab('all')} 
                  className={`portal-filter-tab ${activeSubTab === 'all' ? 'active' : ''}`}
                  style={{ background: activeSubTab === 'all' ? 'rgba(14, 165, 233, 0.2)' : 'transparent', border: activeSubTab === 'all' ? '1px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  All ({applications.length + eventRegistrations.length})
                </button>
                {applications.length > 0 && (
                  <button 
                    onClick={() => setActiveSubTab('internships')} 
                    className={`portal-filter-tab ${activeSubTab === 'internships' ? 'active' : ''}`}
                    style={{ background: activeSubTab === 'internships' ? 'rgba(14, 165, 233, 0.2)' : 'transparent', border: activeSubTab === 'internships' ? '1px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    🎓 Internships ({applications.length})
                  </button>
                )}
                {eventRegistrations.length > 0 && (
                  <button 
                    onClick={() => setActiveSubTab('events')} 
                    className={`portal-filter-tab ${activeSubTab === 'events' ? 'active' : ''}`}
                    style={{ background: activeSubTab === 'events' ? 'rgba(14, 165, 233, 0.2)' : 'transparent', border: activeSubTab === 'events' ? '1px solid #0ea5e9' : '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', padding: '6px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    🎟️ Event Passes ({eventRegistrations.length})
                  </button>
                )}
              </div>

              {/* EVENT REGISTRATIONS LIST */}
              {(activeSubTab === 'all' || activeSubTab === 'events') && eventRegistrations.length > 0 && (
                <div className="student-events-section" style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#38bdf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} />
                    <span>Registered Events & Sessions ({eventRegistrations.length})</span>
                  </div>
                  <div className="student-apps-list">
                    {eventRegistrations.map((evReg) => (
                      <div key={evReg.id} className="student-app-card" style={{ borderLeft: '4px solid #38bdf8' }}>
                        <div className="app-card-top">
                          <div className="app-id-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                            <FileText size={14} />
                            <span>{evReg.registration_no}</span>
                          </div>
                          <div className="app-date-meta">
                            <Calendar size={13} />
                            <span>Registered: {evReg.created_at || 'Recently'}</span>
                          </div>
                          <span className="status-pill badge-selected">
                            {evReg.status || 'Confirmed'}
                          </span>
                        </div>

                        <div className="app-program-row">
                          <div>
                            <div className="program-title" style={{ color: '#f8fafc', fontSize: '1.1rem' }}>{evReg.event_title}</div>
                            <div className="program-type" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                              Attendee: {evReg.name} • {evReg.college} {evReg.year ? `(${evReg.year})` : ''}
                            </div>
                          </div>
                          <button 
                            onClick={() => setActivePass(evReg)} 
                            className="btn-print-slip"
                            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff' }}
                            title="View Official Event Entry Pass"
                          >
                            <Award size={14} />
                            <span>View Entry Pass</span>
                          </button>
                        </div>

                        <div className="app-guidance-box" style={{ background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.15)' }}>
                          <div className="guidance-header">
                            <CheckCircle size={15} style={{ color: '#10b981' }} />
                            <span className="guidance-title">Official Event Confirmation:</span>
                          </div>
                          <p className="guidance-desc" style={{ color: '#cbd5e1' }}>
                            {evReg.notes ? evReg.notes : `Your registration for "${evReg.event_title}" is confirmed! Please present your Event Pass or show Registration ID #${evReg.registration_no} during session check-in.`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INTERNSHIP APPLICATIONS LIST */}
              {(activeSubTab === 'all' || activeSubTab === 'internships') && applications.length > 0 && (
                <div className="student-internships-section">
                  {eventRegistrations.length > 0 && (
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#818cf8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GraduationCap size={16} />
                      <span>Internship Applications ({applications.length})</span>
                    </div>
                  )}
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
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {app.resume_url && (
                                <a 
                                  href={app.resume_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="btn-print-slip"
                                  style={{ background: '#f8fafc', color: '#4f46e5', borderColor: '#c7d2fe' }}
                                  title="View Attached Resume / CV"
                                >
                                  <FileText size={14} />
                                  <span>Resume</span>
                                </a>
                              )}
                              <button 
                                onClick={() => setActiveSlip(app)} 
                                className="btn-print-slip"
                                title="View Official Admission / Application Slip"
                              >
                                <Printer size={14} />
                                <span>View Admission Slip</span>
                              </button>
                            </div>
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
              )}
            </div>
          ) : searched && applications.length === 0 && eventRegistrations.length === 0 ? (
            <div className="student-not-found-card">
              <GraduationCap size={44} style={{ color: '#64748b', opacity: 0.6, marginBottom: '14px' }} />
              <h4>No Record Found Matching "{searchQuery}"</h4>
              <p>
                Please verify that you entered the exact Email Address, Phone Number, or Application / Event Registration Number used during registration.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <a href="#internship" onClick={onClose} className="btn btn-primary">
                  <span>Apply for Internship</span>
                  <ArrowRight size={15} />
                </a>
                <a href="#events" onClick={onClose} className="btn btn-secondary">
                  <span>View Events</span>
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

        {/* Printable Event Entry Pass Modal View */}
        {activePass && (
          <div className="slip-modal-overlay" onClick={() => setActivePass(null)}>
            <div className="slip-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="slip-modal-header no-print">
                <span>Official Event Entry Pass</span>
                <button onClick={() => setActivePass(null)} className="slip-close-btn">
                  <X size={18} />
                </button>
              </div>

              {/* Printable Document Sheet */}
              <div className="slip-document-sheet" style={{ borderColor: 'rgba(14, 165, 233, 0.4)' }}>
                <div className="slip-doc-header">
                  <div className="doc-logo-area">
                    <div className="doc-brand" style={{ color: '#0ea5e9' }}>WINGROO TECHNOLOGIES</div>
                    <div className="doc-sub">Official Community & Event Entry Pass</div>
                  </div>
                  <div className="doc-app-stamp" style={{ borderColor: '#0ea5e9', background: 'rgba(14, 165, 233, 0.08)' }}>
                    <div className="doc-stamp-title" style={{ color: '#0ea5e9' }}>EVENT ENTRY PASS</div>
                    <div className="doc-stamp-no">{activePass.registration_no}</div>
                  </div>
                </div>

                <div className="doc-divider" />

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Registered Event / Session:</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{activePass.event_title}</div>
                </div>

                <div className="doc-grid-info">
                  <div className="doc-info-item">
                    <span className="doc-info-label">Attendee Name:</span>
                    <span className="doc-info-val">{activePass.name}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Pass Status:</span>
                    <span className="doc-info-val status-highlight" style={{ color: '#10b981' }}>{activePass.status || 'Confirmed'}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Institution / Organization:</span>
                    <span className="doc-info-val">{activePass.college}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Year / Role:</span>
                    <span className="doc-info-val">{activePass.year || 'Participant'}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Email ID:</span>
                    <span className="doc-info-val">{activePass.email}</span>
                  </div>
                  <div className="doc-info-item">
                    <span className="doc-info-label">Phone Contact:</span>
                    <span className="doc-info-val">{activePass.phone}</span>
                  </div>
                </div>

                <div className="doc-verification-seal-row">
                  <div className="doc-seal-box">
                    <ShieldCheck size={28} style={{ color: '#10b981' }} />
                    <div>
                      <div className="seal-title">OFFICIALLY REGISTERED PARTICIPANT</div>
                      <div className="seal-sub">Valid for entry at Wingroo Tech Hub & Partner Venues</div>
                    </div>
                  </div>
                  <div className="doc-sign-area">
                    <div className="sign-line" />
                    <div className="sign-title">Event Operations Desk</div>
                    <div className="sign-sub">Wingroo Technologies</div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="slip-modal-actions no-print">
                <button onClick={handlePrintSlip} className="btn btn-primary">
                  <Printer size={16} />
                  <span>Print / Save Event Pass</span>
                </button>
                <button onClick={() => setActivePass(null)} className="btn btn-secondary">
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

