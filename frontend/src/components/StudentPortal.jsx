import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  X, 
  CheckCircle, 
  FileText, 
  ExternalLink, 
  Printer, 
  Phone, 
  Mail, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  ShieldCheck,
  Award,
  Check
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './StudentPortal.css';

const API_BASE = API_BASE_URL || '';

export default function StudentPortal({ isOpen, onClose, initialQuery = '', onSwitchRole }) {
  // Tabs: 'internship' (Internship Apply) | 'events' (Events Apply)
  const [activeTab, setActiveTab] = useState('internship');

  const [searchQuery, setSearchQuery] = useState(() => {
    return initialQuery || sessionStorage.getItem('wingroo_student_lookup') || '';
  });
  const [applications, setApplications] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [trackLoading, setTrackLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [trackErrorMsg, setTrackErrorMsg] = useState('');
  const [activeSlip, setActiveSlip] = useState(null);
  const [activePass, setActivePass] = useState(null);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setSearchQuery(initialQuery);
      fetchStudentApplications(initialQuery);
    }
  }, [isOpen, initialQuery]);

  const fetchStudentApplications = async (queryToSearch) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) {
      setTrackErrorMsg('Please enter your email, phone number, or application / registration number.');
      return;
    }

    setTrackLoading(true);
    setTrackErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/student/applications?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearched(true);
      if (data.success) {
        const apps = Array.isArray(data.applications) ? data.applications : [];
        const evRegs = Array.isArray(data.event_registrations) ? data.event_registrations : [];
        setApplications(apps);
        setEventRegistrations(evRegs);
        if (apps.length > 0 || evRegs.length > 0) {
          sessionStorage.setItem('wingroo_student_lookup', q);
          // If no internships found but events found, auto-switch to events tab
          if (apps.length === 0 && evRegs.length > 0) {
            setActiveTab('events');
          } else if (apps.length > 0) {
            setActiveTab('internship');
          }
        } else {
          setTrackErrorMsg(data.message || 'No applications or event registrations found for this query.');
        }
      } else {
        setApplications([]);
        setEventRegistrations([]);
        setTrackErrorMsg(data.message || 'No applications or event registrations found.');
      }
    } catch {
      setSearched(true);
      setTrackErrorMsg('Failed to connect to candidate server. Please check your connection.');
      setApplications([]);
      setEventRegistrations([]);
    } finally {
      setTrackLoading(false);
    }
  };

  const getApplicantProfile = () => {
    if (applications.length > 0) {
      return {
        name: applications[0].name,
        email: applications[0].email,
        phone: applications[0].phone,
        college: applications[0].college,
        course: applications[0].course
      };
    }
    if (eventRegistrations.length > 0) {
      return {
        name: eventRegistrations[0].name,
        email: eventRegistrations[0].email,
        phone: eventRegistrations[0].phone,
        college: eventRegistrations[0].college,
        course: `Year: ${eventRegistrations[0].year || 'N/A'}`
      };
    }
    return null;
  };

  const applicantProfile = getApplicantProfile();

  if (!isOpen) return null;

  return (
    <div className="student-portal-overlay" onClick={onClose}>
      <div className="student-portal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Header */}
        <div className="student-portal-header">
          <div className="student-brand-title">
            <img 
              src="/logo.png" 
              alt="Wingroo Technologies" 
              className="portal-brand-logo" 
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            />
            <div className="student-icon-badge">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="student-portal-tag">Candidate Applications & Passes</div>
              <h3 className="student-portal-heading">Wingroo Candidate Portal</h3>
            </div>
          </div>

          {/* Unified Role Switcher / Header Actions */}
          <div className="d-flex align-items-center gap-2">
            <div className="portal-role-switch-tabs">
              <button type="button" className="portal-role-btn active" title="Current: Candidate Portal">
                <GraduationCap size={15} />
                <span>Candidate</span>
              </button>
              <button 
                type="button" 
                className="portal-role-btn" 
                onClick={() => typeof onSwitchRole === 'function' && onSwitchRole('admin')}
                title="Switch to Admin & Staff Login"
              >
                <ShieldCheck size={15} />
                <span>Admin Login</span>
              </button>
            </div>

            <button onClick={onClose} className="student-icon-btn student-close-btn" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feature Navigation Bar: Only Internship Apply & Events Apply */}
        <div className="student-nav-tabs-bar">
          <button 
            type="button"
            className={`student-nav-tab ${activeTab === 'internship' ? 'active' : ''}`}
            onClick={() => setActiveTab('internship')}
          >
            <GraduationCap size={16} />
            <span>Internship Apply</span>
            {applications.length > 0 && (
              <span className="live-pill" style={{ background: '#0284c7', color: '#fff' }}>
                {applications.length}
              </span>
            )}
          </button>

          <button 
            type="button"
            className={`student-nav-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={16} />
            <span>Events Apply</span>
            {eventRegistrations.length > 0 && (
              <span className="live-pill" style={{ background: '#0ea5e9', color: '#fff' }}>
                {eventRegistrations.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="student-portal-body">
          {/* Lookup Search Bar */}
          <div className="student-search-card">
            <div className="search-caption">
              <Sparkles size={16} style={{ color: '#0284c7' }} />
              <span>
                {activeTab === 'internship'
                  ? 'Track Internship Application Status & Download Official Slip'
                  : 'Track Event Registration Status & Download Verified Entry Pass'}
              </span>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); fetchStudentApplications(searchQuery); }} className="student-search-form">
              <div className="search-input-wrap">
                <Search size={18} className="search-field-icon" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Registered Email, Phone Number, or Application / Registration #"
                  className="student-search-input"
                  required
                />
              </div>
              <button type="submit" disabled={trackLoading} className="student-search-btn">
                <span>{trackLoading ? 'Searching…' : 'Track Status'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
            {trackErrorMsg && (
              <div className="student-search-error">
                <AlertCircle size={15} />
                <span>{trackErrorMsg}</span>
              </div>
            )}
          </div>

          {/* Loading State */}
          {trackLoading && (
            <div className="student-loading-state">
              <RefreshCw size={28} className="spin-anim" />
              <p>Fetching your application details and real-time review status…</p>
            </div>
          )}

          {/* Not Searched State */}
          {!trackLoading && !searched && (
            <div className="student-welcome-card">
              <div className="welcome-illustration">
                {activeTab === 'internship' ? <GraduationCap size={32} /> : <Calendar size={32} />}
              </div>
              <h4>
                {activeTab === 'internship' 
                  ? 'Track Your Internship Application' 
                  : 'Track Your Event Registration'}
              </h4>
              <p>
                {activeTab === 'internship'
                  ? 'Enter the email address or phone number you used when submitting your internship application to view real-time status, domain details, and print your official application receipt.'
                  : 'Enter the email address or phone number you used when registering for Wingroo tech events, bootcamps, or workshops to view your confirmation and entry pass.'}
              </p>

              <div className="welcome-perks-grid">
                <div className="perk-box">
                  <CheckCircle size={16} className="perk-check" />
                  <span>Real-time Status Badges</span>
                </div>
                <div className="perk-box">
                  <Printer size={16} className="perk-check" />
                  <span>Printable Official Slips & Passes</span>
                </div>
                <div className="perk-box">
                  <ShieldCheck size={16} className="perk-check" />
                  <span>Verified Participant Records</span>
                </div>
              </div>
            </div>
          )}

          {/* Searched Results View */}
          {!trackLoading && searched && (
            <>
              {/* Profile Summary Strip */}
              {applicantProfile && (
                <div className="student-profile-strip">
                  <div className="student-avatar-big">
                    {applicantProfile.name?.slice(0, 2).toUpperCase() || 'CD'}
                  </div>
                  <div className="student-profile-info">
                    <div className="student-full-name">{applicantProfile.name}</div>
                    <div className="student-sub-detail">
                      {applicantProfile.college || 'Candidate'} {applicantProfile.course ? `• ${applicantProfile.course}` : ''}
                    </div>
                    <div className="student-contact-chips">
                      {applicantProfile.email && (
                        <span className="contact-chip">
                          <Mail size={12} />
                          <span>{applicantProfile.email}</span>
                        </span>
                      )}
                      {applicantProfile.phone && (
                        <span className="contact-chip">
                          <Phone size={12} />
                          <span>{applicantProfile.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="student-apps-count">
                    <span className="count-num">
                      {activeTab === 'internship' ? applications.length : eventRegistrations.length}
                    </span>
                    <span className="count-text">
                      {activeTab === 'internship' ? 'Applications' : 'Registrations'}
                    </span>
                  </div>
                </div>
              )}

              {/* 1. Internship Apply Results */}
              {activeTab === 'internship' && (
                <div>
                  {applications.length > 0 ? (
                    <div className="student-apps-list">
                      {applications.map((app) => (
                        <div key={app.id} className="student-app-card">
                          <div className="app-card-top">
                            <div className="app-id-pill">
                              <FileText size={14} />
                              <span>{app.application_no}</span>
                            </div>
                            <div className="app-date-meta">
                              <Calendar size={13} />
                              <span>Applied on {app.created_at ? app.created_at.slice(0, 10) : 'Recently'}</span>
                            </div>
                            <span className={`status-pill ${
                              app.status === 'Approved' || app.status === 'Selected' ? 'badge-selected' :
                              app.status === 'Shortlisted' ? 'badge-shortlist' :
                              app.status === 'Rejected' ? 'badge-rejected' : 'badge-review'
                            }`}>
                              {app.status || 'Under Review'}
                            </span>
                          </div>

                          <div className="app-program-row">
                            <div>
                              <div className="program-title">{app.technology || 'Full Stack Development'}</div>
                              <div className="program-type">{app.internship_type || 'Internship'} • {app.college}</div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setActiveSlip(app)} 
                              className="btn-print-slip"
                              title="Print Official Slip"
                            >
                              <Printer size={15} />
                              <span>Print Application Slip</span>
                            </button>
                          </div>

                          {/* 4-Stage Stepper */}
                          <div className="app-stepper-wrap">
                            <div className="stepper-title">Application Progress Tracking</div>
                            <div className="app-stepper">
                              {[
                                { key: 'Submitted', label: 'Submitted' },
                                { key: 'Review', label: 'Under Review' },
                                { key: 'Shortlisted', label: 'Shortlisted' },
                                { key: 'Approved', label: 'Offer Confirmed' }
                              ].map((step, idx) => {
                                const currentStatus = app.status || 'Under Review';
                                const isDone = 
                                  idx === 0 || 
                                  (idx === 1 && currentStatus !== 'Rejected') ||
                                  (idx === 2 && (currentStatus === 'Shortlisted' || currentStatus === 'Approved' || currentStatus === 'Selected')) ||
                                  (idx === 3 && (currentStatus === 'Approved' || currentStatus === 'Selected'));

                                return (
                                  <React.Fragment key={step.key}>
                                    <div className={`step-node ${isDone ? 'step-done' : ''}`}>
                                      <div className="step-circle">{isDone ? <Check size={13} /> : idx + 1}</div>
                                      <div className="step-label">{step.label}</div>
                                    </div>
                                    {idx < 3 && <div className={`step-line ${isDone ? 'line-done' : ''}`} />}
                                  </React.Fragment>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="student-not-found-card">
                      <GraduationCap size={36} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
                      <h4>No Internship Applications Found</h4>
                      <p>
                        We could not find any internship applications registered with &apos;{searchQuery}&apos;.
                        If you registered for an event instead, check the <strong>Events Apply</strong> tab above.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Events Apply Results */}
              {activeTab === 'events' && (
                <div>
                  {eventRegistrations.length > 0 ? (
                    <div className="student-apps-list">
                      {eventRegistrations.map((ev) => (
                        <div key={ev.id} className="student-app-card" style={{ borderLeft: '4px solid #0284c7' }}>
                          <div className="app-card-top">
                            <div className="app-id-pill" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', borderColor: '#bae6fd' }}>
                              <Award size={14} />
                              <span>{ev.registration_no}</span>
                            </div>
                            <div className="app-date-meta">
                              <Calendar size={13} />
                              <span>Registered on {ev.created_at ? ev.created_at.slice(0, 10) : 'Recently'}</span>
                            </div>
                            <span className="status-pill badge-selected">
                              {ev.status || 'Confirmed'}
                            </span>
                          </div>

                          <div className="app-program-row">
                            <div>
                              <div className="program-title">{ev.event_title}</div>
                              <div className="program-type">Attendee: {ev.name} • {ev.college} {ev.year ? `(${ev.year})` : ''}</div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setActivePass(ev)} 
                              className="btn-print-slip"
                              style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', borderColor: 'transparent' }}
                              title="View & Print Official Event Pass"
                            >
                              <Award size={15} />
                              <span>View & Print Pass</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="student-not-found-card">
                      <Calendar size={36} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
                      <h4>No Event Registrations Found</h4>
                      <p>
                        We could not find any event passes registered with &apos;{searchQuery}&apos;.
                        If you submitted an internship application instead, check the <strong>Internship Apply</strong> tab above.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Certificate & Verification Portal Redirect Banner */}
          <div className="p-3 border rounded-3 bg-white d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2" style={{ borderColor: '#e2e8f0' }}>
            <div className="d-flex align-items-center gap-2">
              <ShieldCheck size={20} style={{ color: '#0284c7' }} />
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Looking for Certificate Verification or Candidate Account?</strong>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Certificate verification, candidate login & credential registration are hosted in the Certification Portal.</div>
              </div>
            </div>
            <a 
              href="/internship" 
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              style={{ fontWeight: 600, fontSize: '0.82rem' }}
            >
              <span>Go to Certificate & Verification Portal</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Printable Slip Popup Modal for Internship Application */}
      {activeSlip && (
        <div className="slip-modal-overlay" onClick={() => setActiveSlip(null)}>
          <div className="slip-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="slip-modal-header no-print">
              <span>Official Internship Application Receipt</span>
              <div className="d-flex align-items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => window.print()} 
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
                <button type="button" onClick={() => setActiveSlip(null)} className="slip-close-btn">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="slip-document-sheet" id="printable-slip">
              <div className="slip-doc-header">
                <div>
                  <div className="doc-brand">WINGROO TECHNOLOGIES</div>
                  <div className="doc-sub">Software & Web Development • Digital Innovation Center</div>
                  <div className="doc-sub">Coimbatore, Tamil Nadu, India</div>
                </div>
                <div className="doc-app-stamp">
                  <div className="doc-stamp-title">APPLICATION NUMBER</div>
                  <div className="doc-stamp-no">{activeSlip.application_no}</div>
                </div>
              </div>

              <div className="doc-divider" />

              <div className="doc-grid-info">
                <div className="doc-info-item">
                  <span className="doc-info-label">Candidate Name</span>
                  <span className="doc-info-val">{activeSlip.name}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Current Status</span>
                  <span className="doc-info-val status-highlight">{activeSlip.status || 'Under Review'}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Email Address</span>
                  <span className="doc-info-val">{activeSlip.email}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Phone Number</span>
                  <span className="doc-info-val">{activeSlip.phone}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">College / Institute</span>
                  <span className="doc-info-val">{activeSlip.college}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Course & Year</span>
                  <span className="doc-info-val">{activeSlip.course} {activeSlip.year ? `(${activeSlip.year})` : ''}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Domain / Technology</span>
                  <span className="doc-info-val">{activeSlip.technology || 'Full Stack Development'}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Internship Program</span>
                  <span className="doc-info-val">{activeSlip.internship_type || 'Short Term Internship'}</span>
                </div>
              </div>

              <div className="doc-verification-seal-row">
                <div className="doc-seal-box">
                  <ShieldCheck size={28} style={{ color: '#10b981' }} />
                  <div>
                    <div className="seal-title">OFFICIALLY REGISTERED APPLICANT</div>
                    <div className="seal-sub">Valid for interview & cohort verification at Wingroo Tech Hub</div>
                  </div>
                </div>
                <div className="doc-sign-area">
                  <div className="sign-line" />
                  <div className="sign-title">Academic Operations Desk</div>
                  <div className="sign-sub">Wingroo Technologies</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Event Pass Modal */}
      {activePass && (
        <div className="slip-modal-overlay" onClick={() => setActivePass(null)}>
          <div className="slip-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="slip-modal-header no-print">
              <span>Official Event Entry Pass</span>
              <div className="d-flex align-items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => window.print()} 
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                >
                  <Printer size={14} />
                  <span>Print Pass</span>
                </button>
                <button type="button" onClick={() => setActivePass(null)} className="slip-close-btn">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="slip-document-sheet" id="printable-event-pass">
              <div className="slip-doc-header">
                <div>
                  <div className="doc-brand">WINGROO TECHNOLOGIES</div>
                  <div className="doc-sub">Official Event Participant Badge & Entry Pass</div>
                  <div className="doc-sub">Coimbatore, Tamil Nadu, India</div>
                </div>
                <div className="doc-app-stamp" style={{ borderColor: '#0ea5e9', background: '#f0f9ff' }}>
                  <div className="doc-stamp-title" style={{ color: '#0284c7' }}>REGISTRATION NUMBER</div>
                  <div className="doc-stamp-no">{activePass.registration_no}</div>
                </div>
              </div>

              <div className="doc-divider" />

              <div className="doc-grid-info">
                <div className="doc-info-item">
                  <span className="doc-info-label">Event Name</span>
                  <span className="doc-info-val status-highlight">{activePass.event_title}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Registration Status</span>
                  <span className="doc-info-val" style={{ color: '#16a34a' }}>{activePass.status || 'Confirmed'}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Attendee Name</span>
                  <span className="doc-info-val">{activePass.name}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Email Address</span>
                  <span className="doc-info-val">{activePass.email}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">Phone Number</span>
                  <span className="doc-info-val">{activePass.phone}</span>
                </div>
                <div className="doc-info-item">
                  <span className="doc-info-label">College / Organization</span>
                  <span className="doc-info-val">{activePass.college} {activePass.year ? `(${activePass.year})` : ''}</span>
                </div>
              </div>

              <div className="doc-verification-seal-row">
                <div className="doc-seal-box">
                  <Award size={28} style={{ color: '#0284c7' }} />
                  <div>
                    <div className="seal-title">CONFIRMED EVENT PARTICIPANT</div>
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
          </div>
        </div>
      )}
    </div>
  );
}
